import { client } from "@gradio/client";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const imgBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const imgBuffer = Buffer.from(imgBase64, 'base64');
const blob = new Blob([imgBuffer], { type: 'image/png' });

const token = process.env.HUGGINGFACE_API_TOKEN;

async function test(spaceName) {
    try {
        const app = await client(spaceName, { hf_token: token });
        console.log(`[${spaceName}] Connected to Gradio Space`);
        const result = await app.predict(Object.keys(app.config.endpoints)[0] || "/predict", [blob]);
        console.log(`[${spaceName}] Prediction complete. Result type:`, typeof result);
        console.log(`[${spaceName}] Success!`);
    } catch (e) {
        console.error(`[${spaceName}] Error:`, e.message);
    }
}

async function run() {
    await test("ZhengPeng7/BiRefNet_demo");
    await test("not-lain/background-removal");
}
run();
