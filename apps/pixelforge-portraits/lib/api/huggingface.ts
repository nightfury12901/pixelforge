import { InferenceClient } from '@huggingface/inference';
import removeBackgroundLocal from '@imgly/background-removal-node';

const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN!;
const client = new InferenceClient(HF_TOKEN);

export interface PortraitGenerationOptions {
    prompt: string;
    image?: string;
    num_outputs?: number;
    aspect_ratio?: string;
    output_format?: string;
    guidance_scale?: number;
    num_inference_steps?: number;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

async function imageUrlToBlob(imageUrl: string): Promise<Blob> {
    const res = await fetch(imageUrl);
    return res.blob();
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
            const result = await client.textToImage({
                model: 'black-forest-labs/FLUX.1-schnell',
                inputs: options.prompt,
                parameters: {
                    guidance_scale: options.guidance_scale || 0,
                    num_inference_steps: options.num_inference_steps || 4,
                    width,
                    height,
                },
            }) as unknown as Blob;
            const buf = await result.arrayBuffer();
            const base64 = uint8ArrayToBase64(new Uint8Array(buf));
            return `data:image/jpeg;base64,${base64}`;
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
        const imageBlob = await imageUrlToBlob(imageUrl);

        const result = await client.imageToImage({
            model: 'caidas/swin2SR-classical-sr-x2-64',
            inputs: imageBlob,
        });

        const buf = await result.arrayBuffer();
        const base64 = uint8ArrayToBase64(new Uint8Array(buf));
        return { success: true, output: `data:image/png;base64,${base64}` };
    } catch (error: any) {
        console.error('Enhancement error:', error);
        return { success: false, error: error.message };
    }
}

export async function removeBackground(imageUrl: string) {
    try {
        console.log('Starting local background removal...');

        // Fetch image data ourselves — URLs may redirect to HTML
        let imageBlob: Blob;
        if (imageUrl.startsWith('data:')) {
            const res = await fetch(imageUrl);
            imageBlob = await res.blob();
        } else {
            const res = await fetch(imageUrl, {
                headers: { 'Accept': 'image/*' },
            });
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('text/html')) {
                throw new Error('URL returned HTML instead of an image. Use a direct image URL or base64 data URI.');
            }
            imageBlob = await res.blob();
        }

        // Run background removal locally — no API key needed
        // First call downloads the model (~40MB), subsequent calls are fast
        const resultBlob = await removeBackgroundLocal(imageBlob);

        const buf = await resultBlob.arrayBuffer();
        const base64 = uint8ArrayToBase64(new Uint8Array(buf));
        console.log('Background removal completed successfully');
        return { success: true, output: `data:image/png;base64,${base64}` };
    } catch (error: any) {
        console.error('Background removal error:', error);
        return { success: false, error: error.message };
    }
}
