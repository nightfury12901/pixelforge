/**
 * Upload the Timeless Authority mask and any others that need manual matching.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
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
const BUCKET = 'templates';
const PUBLIC_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

// Manual mappings: [template name, local mask filename]
const MANUAL_MASKS = [
    ['Timeless Authority', 'timelessauthority.png'],
];

async function main() {
    for (const [name, file] of MANUAL_MASKS) {
        console.log(`\nProcessing: ${name} → ${file}`);

        // Get template
        const { data: tpls } = await supabase
            .from('portrait_templates')
            .select('id, name, mask_image')
            .eq('name', name);

        if (!tpls || tpls.length === 0) {
            console.log(`  ⚠️  Template not found: ${name}`);
            continue;
        }

        const t = tpls[0];
        const storagePath = `masks/${file}`;
        const expectedUrl = `${PUBLIC_BASE}/${storagePath}`;

        if (t.mask_image === expectedUrl) {
            console.log(`  ⏭  Already set`);
            continue;
        }

        const maskBuffer = readFileSync(join(rootDir, 'masks', file));

        const { error: uploadErr } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, maskBuffer, { contentType: 'image/png', upsert: true });

        if (uploadErr) {
            console.error(`  ❌ Upload failed:`, uploadErr.message);
            continue;
        }

        const { error: dbErr } = await supabase
            .from('portrait_templates')
            .update({ mask_image: expectedUrl })
            .eq('id', t.id);

        if (dbErr) {
            console.error(`  ❌ DB update failed:`, dbErr.message);
        } else {
            console.log(`  ✅ Done: mask_image set to ${storagePath}`);
        }
    }

    console.log('\n✅ All manual masks processed!');
}

main().catch(console.error);
