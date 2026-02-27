import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
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
    const log = (...args) => { lines.push(args.join(' ')); };

    // Full sample record
    const { data: sample } = await supabase.from('portrait_templates').select('*').limit(1);
    if (sample?.[0]) {
        log('=== COLUMNS ===');
        log(Object.keys(sample[0]).join(', '));
        log('\n=== SAMPLE RECORD ===');
        for (const [k, v] of Object.entries(sample[0])) {
            log(`${k}: ${JSON.stringify(v)?.slice(0, 150)}`);
        }
    }

    // All templates
    const { data: templates } = await supabase.from('portrait_templates').select('*').order('name');
    log('\n=== ALL TEMPLATES ===');
    for (const t of templates || []) {
        log(`[${t.is_published ? 'PUB' : 'HIDDEN'}] ${t.name}`);
        log(`  preview_image_url: ${t.preview_image_url}`);
        log(`  template_image: ${t.template_image}`);
        log(`  mask_image: ${t.mask_image}`);
        log(`  category: ${t.category}, tier: ${t.tier}`);
    }

    // Mask files
    const masksDir = join(rootDir, 'masks');
    const maskFiles = readdirSync(masksDir).filter(f => /\.(png|jpg|webp)$/i.test(f));
    log('\n=== MASK FILES ===');
    for (const f of maskFiles) log(`  ${f}`);

    // Storage buckets
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    log('\n=== STORAGE BUCKETS ===');
    if (bErr) { log('Error:', bErr.message); }
    else {
        for (const b of buckets || []) {
            log(`  ${b.name} (public: ${b.public})`);
            const { data: files } = await supabase.storage.from(b.name).list('', { limit: 10 });
            if (files) log(`    root: ${files.map(f => f.name).join(', ')}`);
            // list masks subfolder
            const { data: maskSubFiles } = await supabase.storage.from(b.name).list('masks', { limit: 5 });
            if (maskSubFiles?.length) log(`    masks/: ${maskSubFiles.map(f => f.name).slice(0, 5).join(', ')} ...`);
            // list templates subfolder
            const { data: tplSubFiles } = await supabase.storage.from(b.name).list('templates', { limit: 5 });
            if (tplSubFiles?.length) log(`    templates/: ${tplSubFiles.map(f => f.name).slice(0, 5).join(', ')} ...`);
        }
    }

    writeFileSync(join(rootDir, 'scripts', 'inspect-output.txt'), lines.join('\n'), 'utf-8');
    console.log('Output written to scripts/inspect-output.txt');
}

main().catch(console.error);
