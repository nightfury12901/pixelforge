import { client } from "@gradio/client";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    try {
        const app = await client("jbilcke-hf/background-removal-api");
        console.log("Endpoints:", app.config.endpoints.map(e => ({ name: e.name_or_api_name, docs: e.docs })));
    } catch (e) {
        console.error(`Error:`, e.message);
    }
}
test();
