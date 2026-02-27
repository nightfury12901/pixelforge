/**
 * scripts/restore-template-urls.js
 *
 * Restores specific template preview_image_url values that were incorrectly
 * overwritten. Uses the original hash-based filenames captured from the
 * diagnostic output before the overwrite.
 *
 * ONLY updates the templates listed in RESTORE_MAP — does NOT touch anything else.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sb = createClient(SUPABASE_URL, SERVICE_KEY);
const BASE = `${SUPABASE_URL}/storage/v1/object/public/templates/templates`;

// Exact original URLs captured from diagnostic output before overwrite
// name → original filename in Supabase storage
const RESTORE_MAP = {
    'Academic Lecturer Portrait': '1771526004913-phkawg.jpeg',
    'Ancient Hanuman': '1771518697444-jofr6e.png',
    'Anime Cel Shaded': '1771526023529-rb2c2o.jpeg',
    'Blessing Aura': '1771517862202-avxbt.png',
    'Blessing from Maa Saraswati': '1771524406015-8h2mx.png',
    'Boardroom Presence': '1771525997389-x4y1cg.jpeg',
    'Cosmic Protector Lord Vishnu': '1771519174195-ku8hto.png',
    'Creative Director Portrait': '1771526001134-d654zq.jpeg',
    'Cyberpunk Neon Glow': '1771526022021-n6hnu1.jpeg',
    'Divine Love': '1771518221645-oe4blj.png',
    'Loverboy': '1771515630927-qel548.png',
    'Midnight Ascend': '1771501308160-w7pxgr.png',
};

// Templates that were correctly fixed (leave untouched):
// - Valentine's Special → couple.png ✅
// - Holi Splash → holi.png ✅
// - Diwali Fireworks Terrace → diwali.png ✅
// - Golden Hour Breeze → beach.png ✅
// - Saree Elegance → saree.png ✅
// - Tropical Serenity → tropical.png ✅
// - Retro Bollywood → retro bollywood.png ✅
// - Watercolor Dreamscape → watercolor.png ✅

async function run() {
    const { data: templates, error } = await sb
        .from('portrait_templates')
        .select('id, name, preview_image_url');

    if (error) { console.error('Fetch error:', error.message); return; }

    let fixed = 0;
    for (const t of templates) {
        const filename = RESTORE_MAP[t.name];
        if (!filename) continue; // skip templates not in restore list

        const restoredUrl = `${BASE}/${filename}`;
        const { error: err } = await sb
            .from('portrait_templates')
            .update({ preview_image_url: restoredUrl })
            .eq('id', t.id);

        if (err) {
            console.error(`  ❌ "${t.name}": ${err.message}`);
        } else {
            console.log(`  ✅ Restored "${t.name}" → ${filename}`);
            fixed++;
        }
    }
    console.log(`\nRestored ${fixed} templates.`);

    // Show current state for templates NOT in the restore map
    console.log('\n--- Templates NOT restored (still need manual check) ---');
    for (const t of templates) {
        if (!RESTORE_MAP[t.name]) {
            console.log(`  - "${t.name}" → ${(t.preview_image_url || '').split('/').pop()}`);
        }
    }
}

run().catch(console.error);
