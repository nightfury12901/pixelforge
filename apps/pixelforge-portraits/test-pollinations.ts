import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function run() {
    const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY;
    const prompt = encodeURIComponent('A dramatic futuristic portrait in a cyberpunk city');
    const testImageUrl = encodeURIComponent('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1288&auto=format&fit=crop');

    // Test the specific URL structure. If seedImage doesn't exist, it might just ignore it.
    const url = `https://gen.pollinations.ai/image/${prompt}?model=flux&width=512&height=512&seed=1&seedImage=${testImageUrl}`;

    console.log('Sending request...');

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${POLLINATIONS_API_KEY}`
        }
    });

    if (!response.ok) {
        console.error('Error:', response.statusText);
        return;
    }

    const buffer = await response.arrayBuffer();
    console.log(`Success! Received ${buffer.byteLength} bytes.`);
}

run();
