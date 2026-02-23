import { client } from "@gradio/client";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    try {
        const app = await client("not-lain/background-removal");
        console.log("Endpoints:", app.config.endpoints.map(e => e.name_or_api_name));
    } catch (e) {
        console.error(`Error:`, e.message);
    }
}
test();
