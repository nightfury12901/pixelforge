import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: 'apps/pixelforge-portraits/.env.local' });

const token = process.env.HUGGINGFACE_API_TOKEN;
if (!token) {
    console.log('No token found');
    process.exit(1);
}

// 1x1 transparent png representation
const imgBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const imgBuffer = Buffer.from(imgBase64, 'base64');

const models = [
    'briaai/RMBG-1.4',
    'ZhengPeng7/BiRefNet',
    'schuler/RMBG-1.4',
    'mattmdjaga/segformer_b2_clothes'
];

async function test(model) {
    for (const domain of ['api-inference.huggingface.co', 'router.huggingface.co/hf-inference']) {
        try {
            const url = `https://${domain}/models/${model}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/octet-stream'
                },
                body: imgBuffer
            });
            console.log(`[${domain}] ${model} -> ${res.status}`);
            if (res.status === 200) {
                console.log(`SUCCESS with ${domain} ${model}`);
            } else {
                const t = await res.text();
                console.log(`   Response: ${t.slice(0, 100)}...`);
            }
        } catch (e) {
            console.log(`[${domain}] ${model} -> Error: ${e.message}`);
        }
    }
}

async function run() {
    for (const m of models) {
        await test(m);
    }
}

run();
