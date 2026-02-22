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
    console.log('Starting DB Updates...');

    // Delete requested template
    const toDelete = ['Tide Wanderer'];
    for (const name of toDelete) {
        const { error } = await supabase.from('portrait_templates').delete().eq('name', name);
        if (error) {
            console.error(`Error deleting ${name}:`, error.message);
        } else {
            console.log(`Deleted template: ${name}`);
        }
    }

    console.log('Database script complete!');
}

run();
