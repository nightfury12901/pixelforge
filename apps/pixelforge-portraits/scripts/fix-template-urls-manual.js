/**
 * scripts/fix-template-urls-manual.js
 *
 * Manually maps template names to local image files for those that
 * don't match by name.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sb = createClient(SUPABASE_URL, SERVICE_KEY);
const BUCKET = 'templates';
const BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/templates`;

// Manual mapping: template name (exact) → local filename
const MANUAL_MAP = {
    'Divine Love': 'couple.png',
    'Valentine\'s Special': 'couple.png',
    'Loverboy': 'couple.png',
    'Holi Splash': 'holi.png',
    'Still Among Chaos': 'holi.png',
    'Embers of the Fallen': 'neon.png',
    'Cyberpunk Neon Glow': 'neon.png',
    'Midnight Ascend': 'neon.png',
    'Film Noir Monochrome': 'watercolor.png',
    'Pop Art Explosion': 'popart.png',
    'Street Graffiti Mural': 'neon.png',
    'Anime Cel Shaded': 'mughal.png',
    'Blessing Aura': 'bollywood.png',
    'Blessing from Maa Saraswati': 'bollywood.png',
    'Ancient Hanuman': 'mughal.png',
    'Cosmic Protector Lord Vishnu': 'mughal.png',
    'Retro Bollywood': 'retro bollywood.png',
    'Startup Founder Creative Look': 'linkedin.png',
    'Boardroom Presence': 'linkedin.png',
    'Creative Director Portrait': 'linkedin.png',
    'Academic Lecturer Portrait': 'linkedin.png',
    'Young Professional Ambient Light': 'linkedin.png',
    'Minimal White Background Headshot': 'studio.png',
    'Golden Hour Breeze': 'beach.png',
    'Tropical Serenity': 'tropical.png',
    'Saree Elegance': 'saree.png',
    'Diwali Fireworks Terrace': 'diwali.png',
    'Watercolor Dreamscape': 'watercolor.png',
};

async function run() {
    const { data: templates, error } = await sb
        .from('portrait_templates')
        .select('id, name, preview_image_url');

    if (error) { console.error('Fetch error:', error.message); return; }

    for (const t of templates) {
        const url = t.preview_image_url || '';
        const filename = url.split('/').pop();
        const isBroken = !url || /^\d{13}/.test(filename);

        if (!isBroken) {
            console.log(`  ✅ OK — "${t.name}"`);
            continue;
        }

        const file = MANUAL_MAP[t.name];
        if (!file) {
            console.log(`  ⚠️  Still no mapping for "${t.name}" — using studio.png`);
            const { error: e } = await sb.from('portrait_templates')
                .update({ preview_image_url: `${BASE}/studio.png` })
                .eq('id', t.id);
            console.log(e ? `  ❌ ${e.message}` : `  🔄 Fixed with studio.png fallback`);
            continue;
        }

        const newUrl = `${BASE}/${file}`;
        const { error: updateErr } = await sb
            .from('portrait_templates')
            .update({ preview_image_url: newUrl })
            .eq('id', t.id);

        if (updateErr) {
            console.error(`  ❌ "${t.name}": ${updateErr.message}`);
        } else {
            console.log(`  🔄 Fixed "${t.name}" → ${file}`);
        }
    }
    console.log('\nAll done!');
}

run().catch(console.error);
