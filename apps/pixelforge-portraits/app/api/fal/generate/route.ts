import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const pollinationsKey = process.env.POLLINATIONS_API_KEY;
        if (!pollinationsKey) {
            return NextResponse.json(
                { error: 'POLLINATIONS_API_KEY is not configured.' },
                { status: 500 }
            );
        }

        const seed = Math.floor(Math.random() * 1000000);
        const encodedPrompt = encodeURIComponent(prompt);
        // Using Pollinations flux model
        const imageUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=klein-large&width=768&height=1024&seed=${seed}&nologo=true`;

        // Verify the URL works
        const response = await fetch(imageUrl, {
            headers: {
                'Authorization': `Bearer ${pollinationsKey}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Pollinations API error:', errorText);
            return NextResponse.json({ error: 'Failed to generate image from Pollinations API' }, { status: response.status });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;

        return NextResponse.json({ imageUrl: base64 });

    } catch (error) {
        console.error('Error generating image:', error);
        return NextResponse.json(
            { error: 'Internal server error while generating image' },
            { status: 500 }
        );
    }
}
