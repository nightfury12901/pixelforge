import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function loadEnv() {
    const envPath = join(rootDir, '.env.local');
    const raw = readFileSync(envPath, 'utf-8');
    for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
    }
}

loadEnv();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    // Get all columns - select *
    const { data, error } = await supabase
        .from('portrait_templates')
        .select('*')
        .limit(2);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log('Available columns:', Object.keys(data[0]).join(', '));
        console.log('\nSample record:', JSON.stringify(data[0], null, 2));
    }

    // Count total
    const { count } = await supabase.from('portrait_templates').select('*', { count: 'exact', head: true });
    console.log('\nTotal templates:', count);

    // List all with name and is_published
    const { data: all } = await supabase.from('portrait_templates').select('id, name, is_published').order('name');
    console.log('\nAll templates:');
    for (const t of all || []) {
        console.log(`  ${t.is_published ? '✅' : '❌'} ${t.name}`);
    }
}

main().catch(console.error);
