
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
        const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY;
        const numOutputs = options.num_outputs || 1;

        let width = 768;
        let height = 1024;

        if (options.aspect_ratio === '16:9') { width = 1024; height = 576; }
        else if (options.aspect_ratio === '9:16') { width = 576; height = 1024; }
        else if (options.aspect_ratio === '1:1') { width = 1024; height = 1024; }

        const generateSingle = async (index: number) => {
            // Using Pollinations klein-large model
            // Add a random seed to prompt or URL if generating multiple to get variety
            const seed = Math.floor(Math.random() * 1000000);
            const encodedPrompt = encodeURIComponent(options.prompt);
            const url = `https://gen.pollinations.ai/image/${encodedPrompt}?model=klein-large&width=${width}&height=${height}&seed=${seed}&nologo=true`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${POLLINATIONS_API_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error(`Pollinations API error: ${response.statusText}`);
            }

            // By converting the generated image directly to base64, we bypass ALL frontend 
            // Next.js CORs, caching, or unconfigured host issues.
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;

            return base64;
        };

        const promises = Array.from({ length: numOutputs }, (_, i) => generateSingle(i));
        const outputs = await Promise.all(promises);

        return { success: true, output: outputs };
    } catch (error: any) {
        console.error('Portrait generation error:', error);
        return { success: false, error: error.message };
    }
}

// For enhancement and background removal, we'll fallback to HuggingFace or Local
// as Pollinations is primarily for text-to-image.
import { enhanceImage as hfEnhance, removeBackground as hfRemove } from './huggingface';

export async function enhanceImage(imageUrl: string) {
    return hfEnhance(imageUrl);
}

export async function removeBackground(imageUrl: string) {
    return hfRemove(imageUrl);
}
