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

    const updates = [
        { name: 'Bollywood Glamour', preview_image_url: '/templates/bollywood.png' },
        { name: 'LinkedIn Professional', preview_image_url: '/templates/linkedin.png' },
        { name: 'Royal Mughal', preview_image_url: '/templates/mughal.png' },
        { name: 'Neon Cyberpunk', preview_image_url: '/templates/neon.png' },
        { name: 'Watercolor Dream', preview_image_url: '/templates/watercolor.png' },
        { name: 'Desi Wedding', preview_image_url: '/templates/wedding.png' },
        { name: 'Studio Headshot', preview_image_url: '/templates/studio.png' },
        { name: 'Pop Art', preview_image_url: '/templates/popart.png' }
    ];

    for (const update of updates) {
        const { error } = await supabase
            .from('portrait_templates')
            .update({ preview_image_url: update.preview_image_url })
            .eq('name', update.name);

        if (error) {
            console.error(`Error updating ${update.name}:`, error.message);
        } else {
            console.log(`Updated template: ${update.name}`);
        }
    }

    console.log('Database script complete!');
}

run();
