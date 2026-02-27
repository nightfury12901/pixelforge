/**
 * scripts/fix-template-urls.js
 *
 * Fetches all portrait_templates from the DB and updates any broken
 * preview_image_url entries (old hash-based uploads) to point at the
 * correctly-named images in Supabase storage.
 *
 * Naming convention:
 *   - The image filename in storage is "templates/<templatename_lowercase>.png"
 *   - We only update rows whose current URL still has a timestamp-hash filename
 *     (e.g. 1771526004913-phkawg.jpeg) OR is completely missing.
 *
 * Run with the env file values exported in the shell.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Error: env vars missing.');
    process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY);
const BUCKET = 'templates';
const TEMPLATES_DIR = path.join(__dirname, '..', 'public', 'templates');

// Get all local image filenames
const localFiles = fs.readdirSync(TEMPLATES_DIR).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));

// Normalise a name to match file basename
function toFilename(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
}

function findBestMatch(templateName) {
    const norm = toFilename(templateName);
    return localFiles.find(f => {
        const base = path.basename(f, path.extname(f)).toLowerCase();
        // exact match first
        if (base === norm) return true;
        // check if any word in the filename is in the template name
        return base.split(' ').some(w => w.length > 3 && norm.includes(w));
    });
}

async function run() {
    const { data: templates, error } = await sb
        .from('portrait_templates')
        .select('id, name, preview_image_url');

    if (error) { console.error('Fetch error:', error.message); return; }

    for (const t of templates) {
        const url = t.preview_image_url || '';
        const filename = url.split('/').pop();
        const isBroken = !url || /^\d{13}/.test(filename); // old timestamp hashes start with 13-digit unix ms

        if (!isBroken) {
            console.log(`  ✅ OK — "${t.name}" (${filename})`);
            continue;
        }

        const match = findBestMatch(t.name);
        if (!match) {
            console.log(`  ⚠️  No file for "${t.name}" — skipping`);
            continue;
        }

        const newUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/templates/${match}`;
        const { error: updateErr } = await sb
            .from('portrait_templates')
            .update({ preview_image_url: newUrl })
            .eq('id', t.id);

        if (updateErr) {
            console.error(`  ❌ Update failed for "${t.name}":`, updateErr.message);
        } else {
            console.log(`  🔄 Fixed "${t.name}" → ${match}`);
        }
    }
    console.log('\nDone!');
}

run().catch(console.error);
