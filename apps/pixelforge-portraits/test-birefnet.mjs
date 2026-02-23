import { client } from "@gradio/client";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const imgBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const imgBuffer = Buffer.from(imgBase64, 'base64');
const blob = new Blob([imgBuffer], { type: 'image/png' });

const token = process.env.HUGGINGFACE_API_TOKEN;

async function run() {
    try {
        const app = await client("ZhengPeng7/BiRefNet_demo", { hf_token: token });
        const endpoints = app.config.endpoints;
        const predictUrl = endpoints.length > 0 ? (endpoints[0].name_or_api_name || Object.keys(endpoints)[0]) : "/predict";
        console.log("Using endpoint:", predictUrl);

        const result = await app.predict(predictUrl, [blob]);
        console.log(JSON.stringify(result, null, 2));

    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
