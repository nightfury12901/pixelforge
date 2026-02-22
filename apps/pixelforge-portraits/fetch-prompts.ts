import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase
        .from('portrait_templates')
        .select('name, prompt_template');

    if (error) {
        console.error('Error fetching templates:', error);
        return;
    }

    const namesToLookFor = [
        'Golden Hour Breeze',
        'Tropical Serenity',
        'Tide Wanderer',
        'Glamorous 28th Birthday',
        'Retro Bollywood',
        'Saree Elegance',
        'Father-Daughter Bench',
        'Diwali Fireworks Terrace',
        'Pixie Cut',
        'Retro Red Dress Rose'
    ];

    const matched = data.filter(t => namesToLookFor.includes(t.name));

    fs.writeFileSync('prompts_output.json', JSON.stringify(matched, null, 2), 'utf8');
    console.log('Wrote to prompts_output.json');
}

run();
