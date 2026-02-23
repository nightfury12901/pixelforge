import { InferenceClient } from '@huggingface/inference';

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
        console.log('Starting remote background removal via HuggingFace...');

        // Fetch image data to send locally
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

        // Use direct fetch to bypass the SDK router bug for RMBG-1.4 (and use the new HF router domain)
        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/briaai/RMBG-1.4",
            {
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/octet-stream",
                },
                method: "POST",
                body: imageBlob,
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HF API Error: ${response.status} ${errText}`);
        }

        const buf = await response.arrayBuffer();
        const base64 = uint8ArrayToBase64(new Uint8Array(buf));
        console.log('Remote background removal completed successfully');
        return { success: true, output: `data:image/png;base64,${base64}` };
    } catch (error: any) {
        console.error('Background removal error:', error);
        return { success: false, error: error.message };
    }
}
