/**
 * lib/api/mask-generator.ts
 *
 * Generates a black-and-white face-region mask from any image URL or data URI.
 *
 * Pipeline:
 *   1. Bria background removal (fal.ai) → transparent PNG with person silhouette
 *   2. sharp: alpha → B/W silhouette (white person on black background)
 *   3. sharp: isolate upper-center region (heuristic face zone = top 55%, center 70%)
 *      → This targets the head/face reliably without any native ML dependency
 *   4. Intersect silhouette + face-zone → final mask
 *   5. Fallback: full white mask if Bria fails
 *
 * No native binaries. No TensorFlow. No OpenCV.
 * Works on any platform (Windows, Linux, Mac, Vercel edge).
 */

import { fal } from '@fal-ai/client';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase/server';

// NOTE: fal.config() is called lazily inside functions — not at module load time.
// This ensures process.env.FAL_KEY is already populated by dotenv before use.

// ─── Types ────────────────────────────────────────────────────────────────────

interface BriaResult {
    data?: { image?: { url?: string } };
    image?: { url?: string };
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Generates a PNG mask buffer where the face/head region is WHITE and
 * everything else is BLACK.
 *
 * Suitable for use as mask_url in fal-ai/ideogram/character/edit.
 *
 * @param imageUrl Public URL or data URI of the template scene image.
 */
export async function generateFaceMask(imageUrl: string): Promise<Buffer> {
    // Lazy fal config — called here (not at module load) so FAL_KEY is populated by dotenv first
    fal.config({ credentials: process.env.FAL_KEY });

    // ── Step 1: Remove background via Bria ─────────────────────────────────────
    let transparentBuffer: Buffer;

    try {
        const briaResult = (await fal.subscribe('fal-ai/bria/background/remove', {
            input: { image_url: imageUrl },
        })) as BriaResult;

        const transparentUrl =
            briaResult?.data?.image?.url ?? briaResult?.image?.url;

        if (!transparentUrl) throw new Error('Bria returned no URL');

        const res = await fetch(transparentUrl);
        if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
        transparentBuffer = Buffer.from(await res.arrayBuffer());
    } catch (err) {
        console.warn('[mask-generator] Bria failed, falling back to full white mask:', err);
        // Full white fallback — fetch original image dimensions
        const meta = await sharp(await fetchBuffer(imageUrl)).metadata();
        return fullWhiteMask(meta.width ?? 1024, meta.height ?? 1024);
    }

    // ── Step 2: sharp → B/W silhouette from alpha channel ──────────────────────
    const { data: rawPixels, info } = await sharp(transparentBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { width, height } = info;

    // Silhouette: white where person is (alpha ≥ 128), black elsewhere
    const silhouettePixels = Buffer.alloc(width * height * 3);
    for (let i = 0; i < width * height; i++) {
        const alpha = rawPixels[i * 4 + 3];
        const value = alpha >= 128 ? 255 : 0;
        silhouettePixels[i * 3] = value; // R
        silhouettePixels[i * 3 + 1] = value; // G
        silhouettePixels[i * 3 + 2] = value; // B
    }

    // ── Step 3: Face-zone heuristic ─────────────────────────────────────────────
    // The face/head occupies roughly: top 55% of height, central 70% of width.
    // We apply 25% padding on all sides to be safe.
    const faceTop = 0;
    const faceBottom = Math.floor(height * 0.60);  // top 60% of height
    const faceLeft = Math.floor(width * 0.15);  // inner 70% of width
    const faceRight = Math.floor(width * 0.85);

    const faceWidth = faceRight - faceLeft;
    const faceHeight = faceBottom - faceTop;

    // White rectangle for the face zone
    const faceZone = await sharp({
        create: {
            width: faceWidth,
            height: faceHeight,
            channels: 3,
            background: { r: 255, g: 255, b: 255 },
        },
    }).png().toBuffer();

    // Black canvas
    const blackCanvas = await sharp({
        create: {
            width,
            height,
            channels: 3,
            background: { r: 0, g: 0, b: 0 },
        },
    }).png().toBuffer();

    // Place white face zone on black canvas
    const faceZoneMask = await sharp(blackCanvas)
        .composite([{ input: faceZone, left: faceLeft, top: faceTop }])
        .raw()
        .toBuffer();

    // ── Step 4: Intersect silhouette × face-zone → final mask ──────────────────
    // A pixel is white in the final mask only if it's white in BOTH
    // the person silhouette AND the face zone.
    const finalPixels = Buffer.alloc(width * height * 3);
    for (let i = 0; i < width * height; i++) {
        const inSilhouette = silhouettePixels[i * 3] === 255;
        const inFaceZone = faceZoneMask[i * 3] === 255;
        const value = (inSilhouette && inFaceZone) ? 255 : 0;
        finalPixels[i * 3] = value;
        finalPixels[i * 3 + 1] = value;
        finalPixels[i * 3 + 2] = value;
    }

    const finalMask = await sharp(finalPixels, {
        raw: { width, height, channels: 3 },
    }).png().toBuffer();

    // If the intersection is completely black (no overlap), fall back to face zone
    const hasWhitePixels = finalPixels.some((v) => v === 255);
    if (!hasWhitePixels) {
        console.warn('[mask-generator] No silhouette/face-zone overlap — using face-zone mask');
        return sharp(blackCanvas)
            .composite([{ input: faceZone, left: faceLeft, top: faceTop }])
            .png()
            .toBuffer();
    }

    return finalMask;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchBuffer(url: string): Promise<Buffer> {
    if (url.startsWith('data:')) {
        const base64 = url.split(',')[1];
        return Buffer.from(base64, 'base64');
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch failed: ${res.statusText}`);
    return Buffer.from(await res.arrayBuffer());
}

function fullWhiteMask(width: number, height: number): Promise<Buffer> {
    return sharp({
        create: { width, height, channels: 3, background: { r: 255, g: 255, b: 255 } },
    }).png().toBuffer();
}

// ─── Supabase upload helper ───────────────────────────────────────────────────

/**
 * Uploads a mask PNG buffer to Supabase Storage.
 * Returns the public URL.
 */
export async function uploadTempMaskToSupabase(
    maskBuffer: Buffer,
    userId: string,
): Promise<string> {
    const db = createAdminClient() as any;
    const filename = `masks/tmp-${userId}-${Date.now()}.png`;

    const { error } = await db.storage
        .from('templates')
        .upload(filename, maskBuffer, { contentType: 'image/png', upsert: true });

    if (error) throw new Error(`[mask-generator] Supabase upload error: ${error.message}`);

    const { data: publicData } = db.storage.from('templates').getPublicUrl(filename);
    return publicData.publicUrl as string;
}
