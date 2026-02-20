import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export interface PortraitGenerationOptions {
  prompt: string;
  image?: string; // base64 or URL
  num_outputs?: number;
  aspect_ratio?: string;
  output_format?: string;
  guidance_scale?: number;
  num_inference_steps?: number;
}

export async function generatePortrait(options: PortraitGenerationOptions) {
  try {
    const output = await replicate.run('black-forest-labs/flux-dev', {
      input: {
        prompt: options.prompt,
        image: options.image,
        num_outputs: options.num_outputs || 1,
        aspect_ratio: options.aspect_ratio || '3:4',
        output_format: options.output_format || 'webp',
        guidance_scale: options.guidance_scale || 3.5,
        num_inference_steps: options.num_inference_steps || 28,
        output_quality: 90,
      },
    });

    return { success: true, output };
  } catch (error: any) {
    console.error('Replicate portrait generation error:', error);
    return { success: false, error: error.message };
  }
}

export async function enhanceImage(imageUrl: string) {
  try {
    const output = await replicate.run('nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b', {
      input: {
        image: imageUrl,
        scale: 2,
        face_enhance: true,
      },
    });

    return { success: true, output };
  } catch (error: any) {
    console.error('Replicate enhancement error:', error);
    return { success: false, error: error.message };
  }
}

export async function removeBackground(imageUrl: string) {
  try {
    const output = await replicate.run('cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003', {
      input: {
        image: imageUrl,
      },
    });

    return { success: true, output };
  } catch (error: any) {
    console.error('Replicate background removal error:', error);
    return { success: false, error: error.message };
  }
}

export async function getPredictionStatus(predictionId: string) {
  try {
    const prediction = await replicate.predictions.get(predictionId);
    return { success: true, prediction };
  } catch (error: any) {
    console.error('Replicate status check error:', error);
    return { success: false, error: error.message };
  }
}
