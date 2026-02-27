import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

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

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const lines = [];
    const log = (...args) => lines.push(args.join(' '));

    const { data: templates } = await supabase
        .from('portrait_templates')
        .select('id, name, preview_image_url, mask_image, is_published')
        .order('name');

    let fullPreview = 0, relativePreview = 0, noPreview = 0;
    let hasMask = 0, noMask = 0;

    log('=== VERIFICATION RESULTS ===\n');
    for (const t of templates || []) {
        const isFullUrl = t.preview_image_url?.startsWith('http');
        const hasMaskImg = !!t.mask_image;
        if (!t.preview_image_url) noPreview++;
        else if (isFullUrl) fullPreview++;
        else relativePreview++;
        if (hasMaskImg) hasMask++; else noMask++;

        log(`${t.is_published ? '✅' : '❌'} ${t.name}`);
        log(`  preview: ${t.preview_image_url?.slice(0, 80)}...`);
        log(`  mask:    ${t.mask_image ? t.mask_image.slice(0, 80) + '...' : '(none)'}`);
    }

    log('\n=== SUMMARY ===');
    log(`Total templates: ${templates?.length}`);
    log(`Full URL previews: ${fullPreview}`);
    log(`Relative URL previews (BROKEN): ${relativePreview}`);
    log(`No preview URL: ${noPreview}`);
    log(`Has mask: ${hasMask}`);
    log(`No mask: ${noMask}`);

    writeFileSync(join(rootDir, 'scripts', 'verify-output.txt'), lines.join('\n'), 'utf-8');
    console.log('Written to scripts/verify-output.txt');
}

main().catch(console.error);
