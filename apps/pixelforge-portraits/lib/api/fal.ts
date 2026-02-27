/**
 * lib/api/fal.ts
 *
 * fal.ai client wrapper for all AI image/video operations.
 *
 * Cost reference ($1 = ₹92):
 *   portrait — ideogram/v3/edit (LinkedIn, mask inpaint) ~$0.12 = ₹11
 *   portrait — nano-banana-2/edit (all other templates)  ~$0.05 = ₹4.60
 *   enhance  (esrgan)                                     ~4s   = ₹0.41
 *   bg_remove (bria)                                     $0.018 = ₹1.66
 *   beautify (gfpgan)                                     ~3s   = ₹0.31
 *
 * Model routing:
 *   10 LinkedIn templates  → fal-ai/ideogram/v3/edit  (REALISTIC, mask face swap)
 *   All other templates    → fal-ai/nano-banana-2/edit (template+face reference)
 *   Text / img-to-image    → fal-ai/nano-banana-2      (Gemini Flash Image)
 */

import { fal } from '@fal-ai/client';

fal.config({ credentials: process.env.FAL_KEY });

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImageResult {
    success: boolean;
    url?: string;           // primary URL field
    imageUrl?: string;      // alias — some callers use this
    output?: string | string[]; // alias — older routes use result.output
    error?: string;
}

export interface VideoResult {
    success: boolean;
    url?: string;
    error?: string;
}

// ─── Artistic template names (use nano-banana-2/edit — style transfer + face swap) ───
// All other templates use ideogram/v3/edit (mask-based face inpainting).
export const ARTISTIC_TEMPLATE_NAMES = new Set([
    // Art style transfer templates
    'Renaissance Oil Painting',
    'Cyberpunk Neon Glow',
    'Anime Cel Shaded',
    'Street Graffiti Mural',
    'Watercolor Dreamscape',
    'Film Noir Monochrome',
    'Pop Art Explosion',
    // Religious / spiritual templates — masks from BiSeNet weren't precise enough
    // for ideogram inpainting; Nano Banana 2 style-transfer gives better results
    'Ancient Hanuman',
    'Cosmic Protector Lord Vishnu',
    'Blessing from Maa Saraswati',
    'Blessing Aura',
    'Flute With Krishna',
    'Shiv Meditation',
]);

// ─── Portrait Generation — ideogram/v3/edit (ALL templates except artistic) ───────

export interface IdeogramV3Params {
    userFaceUrl: string;
    templateImageUrl: string;
    maskUrl: string;
    prompt: string;
}

/**
 * Non-artistic portrait via character face-swap inpainting.
 * Model: fal-ai/ideogram/character/edit
 *
 * - image_url:            the template (scene/background to preserve)
 * - mask_url:             face region to inpaint
 * - reference_image_urls: [userFaceUrl] — the face identity to use
 * - rendering_speed:      TURBO
 * - style:                REALISTIC
 *
 * Used for ALL non-artistic templates (professional, Indian, lifestyle, etc.)
 */
export async function generatePortraitIdeogramV3(
    params: IdeogramV3Params,
): Promise<{ imageUrl: string }> {
    console.log('[Ideogram/character/edit] calling', {
        hasUserFace: !!params.userFaceUrl,
        templateImage: params.templateImageUrl,
        hasMask: !!params.maskUrl,
    });

    const enrichedPrompt =
        `${params.prompt} ` +
        `Preserve all background, lighting, and scene composition exactly. ` +
        `Replace only the masked face/person region with the reference face. ` +
        `The output face must be identical to the reference photo — same features, skin tone, and likeness.`;

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const result = (await fal.subscribe('fal-ai/ideogram/character/edit', {
                input: {
                    image_url: params.templateImageUrl,
                    mask_url: params.maskUrl,
                    reference_image_urls: [params.userFaceUrl],  // face identity reference
                    prompt: enrichedPrompt,
                    rendering_speed: 'TURBO',
                    style: 'REALISTIC',
                    num_images: 1,
                    expand_prompt: false,   // don't let AI rewrite our prompt
                } as any,
            })) as any;

            const url: string | undefined =
                result?.data?.images?.[0]?.url ??
                result?.images?.[0]?.url ??
                result?.image?.url;

            if (!url) throw new Error('[Ideogram/character/edit] returned no image URL');
            return { imageUrl: url };
        } catch (err: any) {
            const retryable =
                err?.message?.includes('ECONNRESET') ||
                err?.message?.includes('fetch failed') ||
                err?.code === 'ECONNRESET';
            if (attempt < 2 && retryable) {
                console.warn(`[Ideogram/character/edit] attempt ${attempt} failed, retrying in 1.5s...`);
                await new Promise(r => setTimeout(r, 1500));
                continue;
            }
            throw err;
        }
    }
    throw new Error('[Ideogram/character/edit] all attempts failed');
}

// ─── Portrait Generation — nano-banana-2/edit (artistic templates only) ──────

export interface NanaBanana2Params {
    userFaceUrl: string;
    templateImageUrl: string;
    templatePrompt: string;
    userDescription: string;    // from face-feature analysis
    aspectRatio?: string;       // default: "2:3"
}

/**
 * Artistic style-transfer via Nano Banana 2 — ONLY for 7 art-style templates.
 * Face identity is IMMUTABLE: only the art medium/style changes.
 * Model: fal-ai/nano-banana-2/edit
 */
export async function generatePortraitNanaBanana2(
    params: NanaBanana2Params,
): Promise<{ imageUrl: string }> {
    console.log('[NanaBanana2/edit] calling', {
        hasUserFace: !!params.userFaceUrl,
        templateImage: params.templateImageUrl,
    });

    // Face preservation is the #1 constraint.
    const prompt =
        `CRITICAL REQUIREMENT — DO NOT CHANGE THE FACE: The output must show the EXACT same face as the person in image 2. Zero alterations to facial features, bone structure, skin tone, eyes, nose, mouth, or identity.

You have two reference images:
1. An artistic style template (shows the target art medium, color palette, and composition)
2. A photo of a real person — their EXACT face must appear unchanged in the output

Task: Apply ONLY the art style/medium from image 1 to the person from image 2.
- The person's face is IMMUTABLE — identical eyes, nose, lips, jaw, skin tone, facial structure, and any facial hair
- Only change the artistic rendering: brushstroke texture, line art, watercolor wash, color grading, etc.
- Keep the same head angle and framing as image 2 (the real photo)
- ${params.templatePrompt}
- Person: ${params.userDescription}
- Output ONE portrait with the unchanged real face rendered in the art style.`;

    const result = (await fal.subscribe('fal-ai/nano-banana-2/edit', {
        input: {
            image_urls: [params.templateImageUrl, params.userFaceUrl],
            prompt,
            aspect_ratio: params.aspectRatio ?? '2:3',
            output_format: 'jpeg',
            resolution: '1K',
            safety_tolerance: '4',
            limit_generations: true,
            num_images: 1,
        } as any,
    })) as any;

    const url: string | undefined =
        result?.data?.images?.[0]?.url ??
        result?.images?.[0]?.url;

    if (!url) throw new Error('[NanaBanana2/edit] returned no image URL');
    return { imageUrl: url };
}

// ─── Text / Image-guided generation — nano-banana-2 base (Gemini Flash Image) ─

/**
 * Uses fal-ai/nano-banana-2 (base) for text-to-image,
 * or fal-ai/nano-banana-2/edit for image-guided generation.
 */
export async function generateImageNanaBanana2(
    prompt: string,
    imageUrl?: string,
    aspectRatio?: string,
): Promise<ImageResult> {
    try {
        let result: any;
        if (imageUrl) {
            result = (await fal.subscribe('fal-ai/nano-banana-2/edit', {
                input: {
                    image_urls: [imageUrl],
                    prompt,
                    aspect_ratio: aspectRatio ?? 'auto',
                    output_format: 'jpeg',
                    resolution: '1K',
                    safety_tolerance: '4',
                    limit_generations: true,
                    num_images: 1,
                } as any,
            })) as any;
        } else {
            result = (await fal.subscribe('fal-ai/nano-banana-2', {
                input: {
                    prompt,
                    aspect_ratio: aspectRatio ?? 'auto',
                    output_format: 'jpeg',
                    resolution: '1K',
                    safety_tolerance: '4',
                    limit_generations: true,
                    num_images: 1,
                } as any,
            })) as any;
        }
        const url: string | undefined =
            result?.data?.images?.[0]?.url ??
            result?.images?.[0]?.url;
        if (!url) return { success: false, error: 'No image returned from Nano Banana 2' };
        return { success: true, url, imageUrl: url, output: url };
    } catch (err: any) {
        console.error('[NanaBanana2] error:', err);
        return { success: false, error: err?.message ?? 'Image generation failed' };
    }
}

// ─── General Image Generation — for fal/generate route ───────────────────────

/**
 * General image generation/editing via fal.ai.
 * Called by app/api/fal/generate/route.ts with (prompt, aspect_ratio).
 *
 * @param prompt      Text prompt
 * @param imageUrlOrAspect  Optional image URL for img2img, or aspect ratio string
 */
export async function generateImageWithFal(
    prompt: string,
    imageUrlOrAspect?: string,
): Promise<ImageResult> {
    try {
        // Determine if second arg is an image URL or an aspect ratio
        const isImageUrl =
            imageUrlOrAspect && (
                imageUrlOrAspect.startsWith('http') ||
                imageUrlOrAspect.startsWith('data:')
            );

        let result: any;

        if (isImageUrl) {
            result = await fal.subscribe('fal-ai/flux/dev/image-to-image', {
                input: {
                    prompt,
                    image_url: imageUrlOrAspect,
                    strength: 0.85,
                } as any,
            });
        } else {
            // Text-to-image; imageUrlOrAspect may be an aspect ratio string like "3:4"
            result = await fal.subscribe('fal-ai/flux/schnell', {
                input: {
                    prompt,
                    image_size: 'landscape_4_3',
                    num_images: 1,
                } as any,
            });
        }

        const url: string | undefined =
            result?.data?.images?.[0]?.url ?? result?.images?.[0]?.url;

        if (!url) return { success: false, error: 'No image returned' };
        return { success: true, url, imageUrl: url, output: url };
    } catch (err: any) {
        console.error('[generateImageWithFal] error:', err);
        return { success: false, error: err?.message ?? 'Image generation failed' };
    }
}

// ─── Image Editing — flux-2-flex/edit ────────────────────────────────────────

/**
 * Edits an existing image guided by a prompt (img2img).
 * Used by the generic image-gen tool when user uploads an image.
 */
export async function editImageWithFal(
    image_url: string,
    prompt: string,
): Promise<ImageResult> {
    try {
        const result = (await fal.subscribe('fal-ai/flux-2-flex/edit', {
            input: { image_url, prompt } as any,
        })) as any;

        const url: string | undefined =
            result?.data?.images?.[0]?.url ?? result?.images?.[0]?.url;

        if (!url) return { success: false, error: 'No image returned from fal.ai edit' };
        return { success: true, url, imageUrl: url, output: url };
    } catch (err: any) {
        console.error('[flux-2-flex/edit] error:', err);
        return { success: false, error: err?.message ?? 'Image edit failed' };
    }
}

// ─── Enhancement — Flux Pro Kontext ────────────────────────────────────────────

const RESTORE_PROMPT = `Dramatically enhance and restore this image to pristine, studio-quality perfection:
- Aggressively remove all blur, haze, noise, and grain
- Sharpen all facial features, eyes, and skin textures flawlessly while keeping identities exactly the same
- Correct lighting, remove dullness, and add vibrant, natural contrast
- Fix any scratches, tears, or damage seamlessly
- The final image must look like it was shot recently on a high-end modern DSLR camera, extremely sharp and clear`;

/**
 * Contextual image restoration using Flux Pro Kontext.
 * Capable of deblurring, resolving damage, and optional colorization.
 * Cost: ~₹3.68/image.
 */
export async function enhanceImage(imageUrl: string, colorize: boolean = false): Promise<ImageResult> {
    try {
        const prompt = colorize
            ? RESTORE_PROMPT + "\n- Colorize black and white areas with historically accurate, natural colors"
            : RESTORE_PROMPT;

        const result = (await fal.subscribe("fal-ai/flux-pro/kontext", {
            input: {
                prompt,
                image_url: imageUrl,
                guidance_scale: 4,        // higher = follows prompt more strictly
                num_inference_steps: 28,
                output_format: "jpeg",
                safety_tolerance: "4",
            } as any,
        })) as any;

        const url: string | undefined =
            result?.data?.images?.[0]?.url ?? result?.images?.[0]?.url;

        if (!url) throw new Error('No image returned from Flux Pro Kontext');
        return { success: true, url, imageUrl: url, output: url };
    } catch (err: any) {
        console.error('[flux-pro/kontext] error:', err);
        return { success: false, error: err?.message ?? 'Enhancement failed' };
    }
}

// ─── Face Beautification removed per user request ────────────────────────────────────────────

// ─── Background Removal — bria ────────────────────────────────────────────────

/**
 * Removes the background from an image. Cost: $0.018 = ₹1.66/image.
 */
export async function removeBackground(imageUrl: string): Promise<ImageResult> {
    try {
        const result = (await fal.subscribe('fal-ai/bria/background/remove', {
            input: { image_url: imageUrl },
        })) as any;

        const url: string | undefined =
            result?.data?.image?.url ?? result?.image?.url;

        if (!url) throw new Error('No image returned from Bria');
        return { success: true, url, imageUrl: url, output: url };
    } catch (err: any) {
        console.error('[bria/bg-remove] error:', err);
        return { success: false, error: err?.message ?? 'Background removal failed' };
    }
}

// ─── Beautification — gfpgan ─────────────────────────────────────────────────

/**
 * Enhances facial details using GFPGAN. ~3s average. Cost: ₹0.31/image.
 * Falls back to fal-ai/face-enhancement if GFPGAN fails.
 */
export async function beautifyPortrait(imageUrl: string): Promise<ImageResult> {
    const extractUrl = (r: any): string | undefined =>
        r?.data?.image?.url ?? r?.image?.url ?? r?.images?.[0]?.url;

    try {
        const result = (await fal.subscribe('fal-ai/gfpgan', {
            input: { image_url: imageUrl },
            pollInterval: 2000,
        })) as any;

        const url = extractUrl(result);
        if (!url) throw new Error('No image returned from GFPGAN');
        return { success: true, url, imageUrl: url, output: url };
    } catch (primaryErr: any) {
        console.error('[gfpgan] trying face-enhancement fallback:', primaryErr);
        try {
            const fallback = (await fal.subscribe('fal-ai/face-enhancement', {
                input: { image_url: imageUrl },
                pollInterval: 2000,
            })) as any;

            const url = extractUrl(fallback);
            if (!url) return { success: false, error: 'No image from fallback beautification' };
            return { success: true, url, imageUrl: url, output: url };
        } catch (fallbackErr: any) {
            return { success: false, error: fallbackErr?.message ?? 'Beautification failed' };
        }
    }
}

// ─── Video Generation — kling-video/v2.1 ─────────────────────────────────────

interface VideoInput {
    prompt: string;
    image_url?: string;
    duration?: 5 | 10;
    aspect_ratio?: '16:9' | '9:16' | '1:1';
    negative_prompt?: string;
}

/**
 * Generates a video clip using Kling 2.1 Standard.
 */
export async function generateVideoWithFal(input: VideoInput): Promise<VideoResult> {
    const {
        prompt,
        image_url,
        duration = 5,
        aspect_ratio = '16:9',
        negative_prompt = 'blur, distort, low quality, watermark',
    } = input;

    const isImageToVideo = !!image_url;
    const endpoint = isImageToVideo
        ? 'fal-ai/kling-video/v2.1/standard/image-to-video'
        : 'fal-ai/kling-video/v2.1/standard/text-to-video';

    const falInput: Record<string, unknown> = {
        prompt,
        duration: String(duration),
        aspect_ratio,
        negative_prompt,
        cfg_scale: 0.5,
    };
    if (isImageToVideo) falInput.image_url = image_url;

    try {
        const result = (await fal.subscribe(endpoint, {
            input: falInput,
            pollInterval: 5000,
        })) as any;

        const url: string | undefined = result?.data?.video?.url ?? result?.video?.url;
        if (!url) return { success: false, error: 'No video returned from fal.ai' };
        return { success: true, url };
    } catch (err: any) {
        console.error('[kling-video] error:', err);
        return { success: false, error: err?.message ?? 'Video generation failed' };
    }
}
