/**
 * app/api/tools/image-gen/route.ts
 *
 * General-purpose image generation — free for all tiers, no watermark.
 *
 * POST body:
 *   prompt:        string   — text description of desired image
 *   image_base64?: string   — optional base64 image (triggers img-guided gen)
 *   aspect_ratio?: string   — e.g. "1:1", "16:9", "3:4" (default: "auto")
 *
 * Model routing:
 *   With image → fal-ai/nano-banana-2/edit  (image-guided, Gemini Flash)
 *   Text only  → fal-ai/nano-banana-2       (text-to-image, Gemini Flash)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateImageNanaBanana2 } from '@/lib/api/fal';
import { deductCredits } from '@/lib/credits';

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // Auth check
        const supabase = createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse body
        const body = await request.json();
        const {
            prompt,
            image_base64,
            aspect_ratio,
        }: { prompt: string; image_base64?: string; aspect_ratio?: string } = body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
        }

        // Cap prompt length to prevent abuse
        const trimmedPrompt = prompt.trim().slice(0, 500);

        // Build image URL from base64 if provided
        let imageUrl: string | undefined;
        if (image_base64) {
            imageUrl = image_base64.startsWith('data:')
                ? image_base64
                : `data:image/jpeg;base64,${image_base64}`;
        }

        // Generate via nano-banana-2 (base for text, edit for image-guided)
        const result = await generateImageNanaBanana2(trimmedPrompt, imageUrl, aspect_ratio);

        if (!result.success || !result.url) {
            return NextResponse.json(
                { error: result.error ?? 'Image generation failed' },
                { status: 500 },
            );
        }

        // Record in generations table for History/Gallery (image_gen is free/uncapped)
        await deductCredits(user.id, 'image_gen', result.url);

        // Return in format the dashboard expects: data.images[]
        return NextResponse.json({
            data: {
                images: [result.url],
                enhanced_prompt: trimmedPrompt,
            },
        });

    } catch (err: any) {
        console.error('[image-gen/route] error:', err);
        return NextResponse.json(
            { error: err?.message ?? 'Image generation failed' },
            { status: 500 },
        );
    }
}
