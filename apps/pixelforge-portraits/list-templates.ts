import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: templates, error } = await supabase.from('portrait_templates').select('id, name, preview_image_url');
    if (error) {
        console.error(error);
        return;
    }
    console.log("Templates in DB:");
    for (const t of templates) {
        console.log(`- ${t.name} -> ${t.preview_image_url}`);
    }
}

run();
