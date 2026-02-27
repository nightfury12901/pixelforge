/**
 * lib/watermark.ts
 *
 * Applies a subtle "AuraShot.ai" watermark to the bottom-right corner
 * of an image buffer using sharp.
 *
 * Used for free-tier portrait outputs only.
 */

import sharp from 'sharp';

/**
 * Composites a semi-transparent "AuraShot.ai" text watermark
 * onto the bottom-right corner of the supplied image buffer.
 *
 * @param imageBuffer  Raw image bytes (any format sharp can read).
 * @returns            PNG buffer with watermark applied.
 */
export async function applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width ?? 1024;
    const height = metadata.height ?? 1024;

    const fontSize = Math.max(14, Math.floor(Math.min(width, height) * 0.03));
    const padding = 10;

    // Approximate text width: ~0.55× fontSize per character × 13 chars ("AuraShot.ai")
    const textWidth = Math.ceil(fontSize * 0.6 * 13);
    const textHeight = Math.ceil(fontSize * 1.4);

    const textX = width - textWidth - padding;
    const textY = height - padding;

    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <text
    x="${textX}"
    y="${textY}"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${fontSize}px"
    font-weight="bold"
    fill="rgba(255,255,255,0.6)"
  >AuraShot.ai</text>
</svg>`;

    return sharp(imageBuffer)
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .png()
        .toBuffer();
}
