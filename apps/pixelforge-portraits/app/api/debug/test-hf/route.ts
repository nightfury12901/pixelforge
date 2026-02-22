import { NextRequest, NextResponse } from 'next/server';

// DEV ONLY — Tests HuggingFace models directly and returns raw responses
export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    const testImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png';

    // Fetch test image
    const imgRes = await fetch(testImageUrl);
    const imgData = new Uint8Array(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get('content-type') || 'image/png';

    const models = [
        'briaai/RMBG-1.4',
        'ZhengPeng7/BiRefNet',
        'skytnt/anime-seg',
        'Xenova/modnet',
        'briaai/RMBG-2.0',
    ];

    const results: Record<string, any> = {};

    for (const model of models) {
        try {
            const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    'Content-Type': contentType,
                },
                body: imgData,
            });

            const resContentType = res.headers.get('content-type') || '';
            let body: string;
            if (resContentType.includes('image')) {
                body = `[IMAGE ${resContentType} - ${res.headers.get('content-length')} bytes]`;
            } else {
                body = (await res.text()).slice(0, 300);
            }

            results[model] = {
                status: res.status,
                ok: res.ok,
                contentType: resContentType,
                body,
            };
        } catch (err: any) {
            results[model] = { error: err.message };
        }
    }

    return NextResponse.json({
        token_present: !!HF_TOKEN,
        token_prefix: HF_TOKEN?.slice(0, 10) + '...',
        results,
    });
}
