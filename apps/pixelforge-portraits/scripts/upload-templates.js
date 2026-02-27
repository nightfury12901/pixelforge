/**
 * scripts/upload-templates.js
 *
 * Uploads all images from public/templates/ to Supabase storage bucket "templates"
 * and updates the portrait_templates table to use the correct public URLs.
 *
 * Run with:
 *   $env:NEXT_PUBLIC_SUPABASE_URL="..."
 *   $env:SUPABASE_SERVICE_ROLE_KEY="..."
 *   node scripts/upload-templates.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars are required.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const TEMPLATES_DIR = path.join(__dirname, '..', 'public', 'templates');
const BUCKET = 'templates';

async function uploadAll() {
    const files = fs.readdirSync(TEMPLATES_DIR).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
    console.log(`Found ${files.length} images to upload:`, files);

    for (const f of files) {
        const filePath = path.join(TEMPLATES_DIR, f);
        const buffer = fs.readFileSync(filePath);
        const storagePath = `templates/${f}`;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, buffer, { upsert: true, contentType: 'image/png' });

        if (error) {
            console.error(`  ❌ Upload failed for ${f}:`, error.message);
        } else {
            const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
            console.log(`  ✅ Uploaded ${f} → ${publicUrl}`);
        }
    }

    console.log('\nAll uploads done! Now updating DB records...\n');

    // Fetch all templates
    const { data: templates, error: fetchErr } = await supabase
        .from('portrait_templates')
        .select('id, name, preview_image_url');

    if (fetchErr) {
        console.error('Could not fetch templates:', fetchErr.message);
        return;
    }

    for (const t of templates) {
        const templateName = (t.name || '').toLowerCase().replace(/ /g, ' ');
        // Try to match a file by name
        const match = files.find(f => {
            const base = path.basename(f, path.extname(f)).toLowerCase();
            return base === templateName;
        });

        if (!match) {
            console.log(`  ⚠️  No matching file found for template: "${t.name}"`);
            continue;
        }

        const newUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/templates/${match}`;
        const { error: updateErr } = await supabase
            .from('portrait_templates')
            .update({ preview_image_url: newUrl })
            .eq('id', t.id);

        if (updateErr) {
            console.error(`  ❌ DB update failed for "${t.name}":`, updateErr.message);
        } else {
            console.log(`  ✅ Updated "${t.name}" → ${newUrl}`);
        }
    }

    console.log('\nAll done!');
}

uploadAll().catch(console.error);
