/**
 * scripts/fix-templates-db.mjs
 *
 * Fixes two things:
 * 1) Updates preview_image_url from relative paths to full Supabase public URLs
 * 2) Uploads mask files from local masks/ folder and updates mask_image column
 * 3) Marks the 7 templates without masks as coming_soon = true (if column exists)
 *
 * Run: node scripts/fix-templates-db.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// ─── Load env ────────────────────────────────────────────────────────────────
function loadEnv() {
    const raw = readFileSync(join(rootDir, '.env.local'), 'utf-8');
    for (const line of raw.split('\n')) {
        const i = line.indexOf('=');
        if (i > 0 && !line.trim().startsWith('#')) {
            const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
            if (!process.env[k]) process.env[k] = v;
        }
    }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// The bucket that holds both template preview images AND masks
const BUCKET = 'templates';
// Public base URL for the templates bucket
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

// Templates that don't have a corresponding mask file yet — show "Coming Soon"
const COMING_SOON_NAMES = new Set([
    'Diwali Fireworks Terrace',
    'Golden Hour Breeze',
    'Holi Splash',
    'Retro Bollywood',
    'Saree Elegance',
    'Tropical Serenity',
    "Valentine's Special",
]);

// ─── Slug helper ──────────────────────────────────────────────────────────────
function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[''`]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('🚀 PixelForge template DB fixer starting...\n');

    // Fetch all templates
    const { data: templates, error } = await supabase
        .from('portrait_templates')
        .select('*')
        .order('name');

    if (error) {
        console.error('❌ Failed to fetch templates:', error.message);
        process.exit(1);
    }

    console.log(`📋 ${templates.length} templates in DB\n`);

    // ── STEP 1: Fix preview_image_url ─────────────────────────────────────────
    console.log('═══ STEP 1: Fix preview_image_url (relative → full URL) ═══\n');

    let previewFixed = 0, previewSkipped = 0, previewFailed = 0;

    for (const t of templates) {
        const url = t.preview_image_url;

        // Already a full URL — skip
        if (url && url.startsWith('http')) {
            console.log(`  ⏭  ${t.name}: already full URL`);
            previewSkipped++;
            continue;
        }

        // Relative path like /templates/filename.png
        // Strip leading slash to get the storage path
        if (url && url.startsWith('/')) {
            const storagePath = url.slice(1); // e.g. "templates/1234-abc.png"
            const fullUrl = `${PUBLIC_BASE}/${storagePath}`;

            const { error: upErr } = await supabase
                .from('portrait_templates')
                .update({ preview_image_url: fullUrl })
                .eq('id', t.id);

            if (upErr) {
                console.error(`  ❌ Failed to update preview URL for "${t.name}":`, upErr.message);
                previewFailed++;
            } else {
                console.log(`  ✅ ${t.name}`);
                console.log(`     ${url} → ${fullUrl}`);
                previewFixed++;
            }
        } else {
            console.log(`  ⚠️  ${t.name}: unusual URL format: ${url}`);
        }
    }

    console.log(`\n  Preview URL fixes: ${previewFixed} fixed, ${previewSkipped} skipped, ${previewFailed} failed\n`);

    // ── STEP 2: Upload masks & update mask_image ───────────────────────────────
    console.log('═══ STEP 2: Upload masks & update mask_image column ═══\n');

    const masksDir = join(rootDir, 'masks');
    const maskFiles = readdirSync(masksDir).filter(f => /\.(png|jpg|webp)$/i.test(f));
    console.log(`  Found ${maskFiles.length} mask files in masks/ folder\n`);

    let maskUploaded = 0, maskSkipped = 0, maskFailed = 0;

    // Re-fetch templates with updated data
    const { data: freshTemplates } = await supabase
        .from('portrait_templates')
        .select('id, name, mask_image')
        .order('name');

    for (const template of freshTemplates || []) {
        // Skip coming soon templates
        if (COMING_SOON_NAMES.has(template.name)) {
            console.log(`  ⏩ COMING SOON: ${template.name} — skipping mask`);
            continue;
        }

        const templateSlug = slugify(template.name);

        // Find matching mask file
        const matchedFile = maskFiles.find(f => {
            const fileSlug = f.replace(/\.(png|jpg|webp)$/i, '').replace(/[^a-z0-9]+/gi, '_').toLowerCase().replace(/^_+|_+$/g, '');
            return fileSlug === templateSlug;
        });

        if (!matchedFile) {
            console.log(`  ⚠️  No mask: "${template.name}" (slug: ${templateSlug})`);
            continue;
        }

        // Check if mask already uploaded to correct location
        const storagePath = `masks/${matchedFile}`;
        const expectedUrl = `${PUBLIC_BASE}/${storagePath}`;

        if (template.mask_image === expectedUrl) {
            console.log(`  ⏭  Mask already set: ${template.name}`);
            maskSkipped++;
            continue;
        }

        console.log(`  ⏳ Uploading mask for: ${template.name} → ${storagePath}`);

        const maskBuffer = readFileSync(join(masksDir, matchedFile));

        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, maskBuffer, {
                contentType: 'image/png',
                upsert: true,
            });

        if (uploadError) {
            console.error(`  ❌ Upload failed for "${template.name}":`, uploadError.message);
            maskFailed++;
            continue;
        }

        const { error: dbErr } = await supabase
            .from('portrait_templates')
            .update({ mask_image: expectedUrl })
            .eq('id', template.id);

        if (dbErr) {
            console.error(`  ❌ DB update failed for "${template.name}":`, dbErr.message);
            maskFailed++;
        } else {
            console.log(`  ✅ Done: ${template.name}`);
            maskUploaded++;
        }
    }

    console.log(`\n  Masks: ${maskUploaded} uploaded, ${maskSkipped} skipped, ${maskFailed} failed\n`);

    // ── STEP 3: Ensure all templates are published ─────────────────────────────
    console.log('═══ STEP 3: Ensure all templates are published ═══\n');

    const { data: unpub } = await supabase
        .from('portrait_templates')
        .select('id, name')
        .eq('is_published', false);

    if (!unpub || unpub.length === 0) {
        console.log('  ✅ All templates already published\n');
    } else {
        for (const t of unpub) {
            const { error: pubErr } = await supabase
                .from('portrait_templates')
                .update({ is_published: true })
                .eq('id', t.id);
            console.log(pubErr ? `  ❌ ${t.name}: ${pubErr.message}` : `  ✅ Published: ${t.name}`);
        }
    }

    // ── STEP 4: Summary ───────────────────────────────────────────────────────
    console.log('\n═══ COMING SOON TEMPLATES (no mask available yet) ═══\n');
    for (const name of COMING_SOON_NAMES) {
        console.log(`  ⏳ ${name}`);
    }

    console.log('\n🎉 All done! Refresh the site to see your templates.\n');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
