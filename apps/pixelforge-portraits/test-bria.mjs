import { client } from "@gradio/client";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const imgBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const imgBuffer = Buffer.from(imgBase64, 'base64');
const blob = new Blob([imgBuffer], { type: 'image/png' });

const token = process.env.HUGGINGFACE_API_TOKEN;

async function run() {
    try {
        const app = await client("contactfuzeiii/briaai-RMBG-1.4", { hf_token: token });
        console.log("Endpoints:", app.config.endpoints.map(e => ({ name: e.name_or_api_name })));

        console.log("Predicting...");
        const result = await app.predict("/predict", [blob]);
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
