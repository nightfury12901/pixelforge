/**
 * lib/api/face-analysis.ts
 *
 * Analyzes a selfie and extracts face features using GROQ Llama Vision
 * (llama-3.2-11b-vision-preview) — fast, free (key already in .env), reliable.
 *
 * Falls back to safe defaults on any error.
 */

import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FaceFeatures {
    /** e.g. "full thick beard" | "stubble" | "clean shaven" */
    beard: string;
    /** e.g. "wearing glasses" | "no glasses" */
    glasses: string;
    /** e.g. "short black hair" | "curly brown hair" */
    hair: string;
    /** e.g. "warm brown skin" | "fair skin" | "dark brown skin" */
    skinTone: string;
    /** e.g. "man" | "woman" */
    gender: string;
}

const SAFE_DEFAULTS: FaceFeatures = {
    beard: 'clean shaven',
    glasses: 'no glasses',
    hair: 'short hair',
    skinTone: 'neutral skin tone',
    gender: 'person',
};

const SYSTEM_PROMPT =
    "You are a face feature extractor. Look at this person's face and " +
    'return ONLY a JSON object with these exact keys: beard, glasses, ' +
    'hair, skinTone, gender. Keep values short (3-5 words max). ' +
    'Return valid JSON only. No extra text. No apologies. No markdown.';

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Analyzes a selfie and returns structured face features.
 * Uses GROQ Llama 3.2 Vision (free, no extra API key needed).
 *
 * @param imageBase64 Raw base64 string (with OR without data URI prefix).
 */
export async function analyzeFaceFeatures(imageBase64: string): Promise<FaceFeatures> {
    // Normalize to full data URI
    const dataUri = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.2-11b-vision-preview',
            max_tokens: 200,
            temperature: 0,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: { url: dataUri },
                        },
                        {
                            type: 'text',
                            text: 'Extract face features as JSON.',
                        },
                    ],
                },
            ],
        });

        const text = response.choices[0]?.message?.content?.trim() ?? '';

        // Strip any accidental markdown fences
        const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

        const parsed = JSON.parse(jsonText) as FaceFeatures;

        // Validate all required keys are present
        const required: (keyof FaceFeatures)[] = ['beard', 'glasses', 'hair', 'skinTone', 'gender'];
        for (const key of required) {
            if (typeof parsed[key] !== 'string' || parsed[key].length === 0) {
                throw new Error(`Missing key: ${key}`);
            }
        }

        console.log('[face-analysis] GROQ features:', parsed);
        return parsed;
    } catch (err) {
        console.warn('[face-analysis] GROQ call failed, using safe defaults:', err);
        return SAFE_DEFAULTS;
    }
}

/**
 * Prepends face feature description to a template prompt.
 */
export function buildEnrichedPrompt(
    templatePrompt: string,
    features: FaceFeatures,
): string {
    return (
        `${features.gender} with ${features.beard}, ` +
        `${features.glasses}, ${features.hair}, ` +
        `${features.skinTone}. ${templatePrompt}`
    );
}
