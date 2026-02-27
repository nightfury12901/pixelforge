/**
 * app/api/generate-public/route.ts
 *
 * Public (unauthenticated) image generation for the landing page demo.
 * Uses Pollinations Klein 9B (klein-large) via private token.
 *
 * POST body: { prompt: string }
 * Returns: { imageUrl: string }  — direct Pollinations URL (signed with token, private=true)
 *
 * No credits charged. Rate-limited by keeping POLLINATIONS_TOKEN private server-side.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { prompt } = await req.json();

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
        }

        const token = process.env.POLLINATIONS_TOKEN;

        // Build portrait-optimised prompt
        const portraitPrompt =
            `hyperrealistic portrait photo, ${prompt.trim()}, ` +
            `professional studio lighting, sharp face, 8k, photographic, cinematic`;

        let imageBase64: string;
        let contentType = 'image/jpeg';

        if (token) {
            // ── Premium path: Klein 9B via gen.pollinations.ai (new API) ──────────
            const url = new URL('https://gen.pollinations.ai/image/' + encodeURIComponent(portraitPrompt));
            url.searchParams.set('model', 'klein-large');
            url.searchParams.set('width', '768');
            url.searchParams.set('height', '1024');
            url.searchParams.set('nologo', 'true');
            url.searchParams.set('private', 'true');
            url.searchParams.set('seed', String(Math.floor(Math.random() * 999999)));
            url.searchParams.set('key', token);   // also pass as query param (Belt + suspenders)

            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` },
                signal: AbortSignal.timeout(45_000),
            });
            if (!res.ok) throw new Error(`Pollinations klein-large returned ${res.status}`);

            const buf = await res.arrayBuffer();
            imageBase64 = Buffer.from(buf).toString('base64');
            contentType = res.headers.get('content-type') ?? 'image/jpeg';
        } else {
            // ── Free fallback: flux model via legacy API (no token needed) ─────────
            console.warn('[generate-public] POLLINATIONS_TOKEN not set, using free flux fallback');
            const encoded = encodeURIComponent(portraitPrompt);
            const fallbackUrl = `https://image.pollinations.ai/prompt/${encoded}?model=flux&width=768&height=1024&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;

            const res = await fetch(fallbackUrl, { signal: AbortSignal.timeout(40_000) });
            if (!res.ok) throw new Error(`Pollinations flux fallback returned ${res.status}`);

            const buf = await res.arrayBuffer();
            imageBase64 = Buffer.from(buf).toString('base64');
            contentType = res.headers.get('content-type') ?? 'image/jpeg';
        }

        return NextResponse.json({
            imageUrl: `data:${contentType};base64,${imageBase64}`,
        });
    } catch (err: any) {
        console.error('[generate-public]', err);
        return NextResponse.json(
            { error: err?.message ?? 'Generation failed' },
            { status: 500 },
        );
    }
}
