import { fal } from '@fal-ai/client';

// Initialize fal.ai client with API key
fal.config({ credentials: process.env.FAL_KEY });

// ─── Types ──────────────────────────────────────────────────────────────────

interface ImageResult {
    success: boolean;
    url?: string;
    error?: string;
}

interface VideoResult {
    success: boolean;
    url?: string;
    error?: string;
}

// ─── Image Generation (FLUX Schnell via fal.ai) ──────────────────────────────

export async function generateImageWithFal(
    prompt: string,
    aspect_ratio: string = '16:9'
): Promise<ImageResult> {
    try {
        const sizeMap: Record<string, string> = {
            '1:1': 'square_hd',
            '16:9': 'landscape_16_9',
            '9:16': 'portrait_16_9',
            '4:3': 'landscape_4_3',
            '3:4': 'portrait_4_3',
        };
        const image_size = sizeMap[aspect_ratio] || 'square_hd';

        const result = await fal.subscribe('fal-ai/flux/schnell', {
            input: { prompt, num_inference_steps: 8, image_size: image_size as any },
        }) as any;

        const url = result?.data?.images?.[0]?.url || result?.images?.[0]?.url;
        if (!url) return { success: false, error: 'No image returned from fal.ai' };
        return { success: true, url };
    } catch (error: any) {
        console.error('fal.ai image gen error:', error);
        return { success: false, error: error?.message || 'Image generation failed' };
    }
}

// ─── Image Editing (SeeDream v4.5) ───────────────────────────────────────────

export async function editImageWithFal(
    image_url: string,
    prompt: string
): Promise<ImageResult> {
    try {
        const result = await fal.subscribe('fal-ai/bytedance/seedream/v4/edit', {
            input: { image_urls: [image_url], prompt } as any,
        }) as any;

        const url = result?.data?.images?.[0]?.url || result?.images?.[0]?.url;
        if (!url) return { success: false, error: 'No image returned from fal.ai edit' };
        return { success: true, url };
    } catch (error: any) {
        console.error('fal.ai image edit error:', error);
        return { success: false, error: error?.message || 'Image edit failed' };
    }
}

// ─── Video Generation (Kling 2.1 Standard) ───────────────────────────────────

interface VideoInput {
    prompt: string;
    image_url?: string;
    duration?: 5 | 10;
    aspect_ratio?: '16:9' | '9:16' | '1:1';
    negative_prompt?: string;
}

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

    try {
        const falInput: Record<string, any> = {
            prompt,
            duration: String(duration),
            aspect_ratio,
            negative_prompt,
            cfg_scale: 0.5,
        };
        if (isImageToVideo) falInput.image_url = image_url;

        const result = await fal.subscribe(endpoint, {
            input: falInput,
            pollInterval: 5000,
        }) as any;

        const url = result?.data?.video?.url || result?.video?.url;
        if (!url) return { success: false, error: 'No video returned from fal.ai' };
        return { success: true, url };
    } catch (error: any) {
        console.error('fal.ai video gen error:', error);
        return { success: false, error: error?.message || 'Video generation failed' };
    }
}

// ─── Refactored APIs for Tools ───────────────────────────────────────────────

export interface PortraitGenerationOptions {
    prompt: string;
    image?: string;
    num_outputs?: number;
    aspect_ratio?: string;
    output_format?: string;
    guidance_scale?: number;
    num_inference_steps?: number;
}

export async function generatePortrait(options: PortraitGenerationOptions) {
    try {
        const numOutputs = options.num_outputs || 1;

        let width = 768;
        let height = 1024;

        if (options.aspect_ratio === '16:9') { width = 1024; height = 576; }
        else if (options.aspect_ratio === '9:16') { width = 576; height = 1024; }
        else if (options.aspect_ratio === '1:1') { width = 1024; height = 1024; }

        const generateSingle = async () => {
            // If we have an image, we should ideally use image-to-image. For now, we use flux/schnell
            // but pass the prompt. Schnell text-to-image:
            const result = await fal.subscribe('fal-ai/flux/schnell', {
                input: {
                    prompt: options.prompt,
                    num_inference_steps: options.num_inference_steps || 4,
                    image_size: { width, height }
                },
            }) as any;

            const url = result?.data?.images?.[0]?.url || result?.images?.[0]?.url;
            return url;
        };

        const promises = Array.from({ length: numOutputs }, () => generateSingle());
        const outputs = await Promise.all(promises);

        return { success: true, output: outputs };
    } catch (error: any) {
        console.error('Portrait generation error:', error);
        return { success: false, error: error.message };
    }
}

export async function enhanceImage(imageUrl: string) {
    try {
        const result = await fal.subscribe('fal-ai/clarity-upscaler', {
            input: {
                image_url: imageUrl,
                scale: 2,
            } as any,
        }) as any;

        const url = result?.data?.image?.url || result?.image?.url || result?.images?.[0]?.url;
        if (!url) throw new Error('No image returned from Fal enhancement');
        return { success: true, output: url };
    } catch (error: any) {
        console.error('Enhancement error:', error);
        return { success: false, error: error.message };
    }
}

export async function removeBackground(imageUrl: string) {
    try {
        const result = await fal.subscribe('fal-ai/bria/background/remove', {
            input: {
                image_url: imageUrl,
            },
        }) as any;

        const url = result?.data?.image?.url || result?.image?.url;
        if (!url) throw new Error('No image returned from Fal bg removal');
        return { success: true, output: url };
    } catch (error: any) {
        console.error('Background removal error:', error);
        return { success: false, error: error.message };
    }
}
