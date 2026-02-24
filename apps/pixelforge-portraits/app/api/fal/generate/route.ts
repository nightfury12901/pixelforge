import { NextResponse } from 'next/server';
import { generateImageWithFal } from '@/lib/api/fal';

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const result = await generateImageWithFal(prompt, '3:4');

        if (!result.success || !result.url) {
            return NextResponse.json(
                { error: result.error || 'Failed to generate image from Fal API' },
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
