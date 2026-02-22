import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function run() {
    const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY;
    const testImageUrl = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1288&auto=format&fit=crop';

    console.log('Testing Chat completions vision for image-to-image...');

    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${POLLINATIONS_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "openai", // Trying default model that might support vision
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Transform this portrait into a futuristic cyberpunk character, maintaining their exact facial identity. Return ONLY the generated image URL." },
                        { type: "image_url", image_url: { url: testImageUrl } }
                    ]
                }
            ]
        })
    });

    if (!response.ok) {
        console.error('Error:', response.statusText);
        return;
    }

    const json = await response.json();
    console.log(JSON.stringify(json, null, 2));
}

run();
