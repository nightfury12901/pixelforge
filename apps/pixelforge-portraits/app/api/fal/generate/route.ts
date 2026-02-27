import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateImageNanaBanana2 } from '@/lib/api/fal';

export async function POST(req: NextRequest) {
    try {
        // ── Auth check — prevents unauthenticated cost burn on fal.ai ──────────
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { prompt } = body;

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Cap prompt length — prevents abuse / prompt injection
        const trimmedPrompt = prompt.trim().slice(0, 500);

        const result = await generateImageNanaBanana2(trimmedPrompt);

        if (!result.success || !result.url) {
            return NextResponse.json(
                { error: result.error || 'Failed to generate image' },
                { status: 500 }
            );
        }

        return NextResponse.json({ imageUrl: result.url });

    } catch (error) {
        console.error('Error generating image:', error);
        return NextResponse.json(
            { error: 'Internal server error while generating image' },
            { status: 500 }
        );
    }
}
