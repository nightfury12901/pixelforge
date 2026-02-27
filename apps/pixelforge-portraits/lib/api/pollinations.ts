/**
 * lib/api/pollinations.ts
 *
 * Pollinations.ai integration — text-to-image ONLY.
 * Cost: FREE.
 *
 * NOT used for portraits. Portrait generation uses fal-ai/ideogram/character/edit.
 * This file is used by:
 *   - image-gen tool (text-only path, no face)
 *   - refine tool (legacy prompt refinement)
 */

// ─── Text-to-image ────────────────────────────────────────────────────────────

/**
 * Returns a Pollinations CDN image URL for the given text prompt.
 * No fetch needed — the URL is itself the image endpoint.
 */
export async function generateImageWithPollinations(
    prompt: string,
    width = 1024,
    height = 1024,
): Promise<string> {
    const encoded = encodeURIComponent(prompt);
    return (
        `https://image.pollinations.ai/prompt/${encoded}` +
        `?model=flux&width=${width}&height=${height}&nologo=true`
    );
}

// ─── Legacy generatePortrait — used by refine/route.ts ───────────────────────

interface LegacyPortraitOptions {
    prompt: string;
    aspect_ratio?: string;
    num_outputs?: number;
    image?: string;
}

/**
 * Returns Pollinations text-to-image URLs.
 * Used by: app/api/tools/refine/route.ts (prompt-refinement + re-generate flow)
 *
 * @deprecated For portrait generation use generatePortraitWithIdeogram instead.
 */
export async function generatePortrait(
    options: LegacyPortraitOptions,
): Promise<{ success: boolean; output?: string[]; error?: string }> {
    try {
        const numOutputs = options.num_outputs ?? 1;

        let width = 768;
        let height = 1024;

        if (options.aspect_ratio === '16:9') { width = 1024; height = 576; }
        else if (options.aspect_ratio === '9:16') { width = 576; height = 1024; }
        else if (options.aspect_ratio === '1:1') { width = 1024; height = 1024; }

        const encoded = encodeURIComponent(options.prompt);
        const outputs = Array.from({ length: numOutputs }, () => {
            const seed = Math.floor(Math.random() * 1_000_000);
            return (
                `https://image.pollinations.ai/prompt/${encoded}` +
                `?model=flux&width=${width}&height=${height}&seed=${seed}&nologo=true`
            );
        });

        return { success: true, output: outputs };
    } catch (err: any) {
        return { success: false, error: err?.message ?? 'Pollinations generation failed' };
    }
}
