/**
 * scripts/generate-all-masks.ts
 *
 * One-time script: generates B/W face masks for all portrait_templates that
 * don't yet have a mask_image, uploads to Supabase Storage, and records
 * the public URL in portrait_templates.mask_image.
 *
 * Run:
 *   npx tsx scripts/generate-all-masks.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' }); // Next.js stores secrets in .env.local
import { createClient } from '@supabase/supabase-js';
import { generateFaceMask } from '../lib/api/mask-generator';

// ─── Supabase admin client ────────────────────────────────────────────────────

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🎭 PixelForge mask generator — starting...\n');

    const { data: templates, error: fetchError } = await supabase
        .from('portrait_templates')
        .select('id, name, preview_image_url')
        .is('mask_image', null);

    if (fetchError) {
        console.error('❌ Failed to fetch templates:', fetchError.message);
        process.exit(1);
    }

    if (!templates || templates.length === 0) {
        console.log('✅ All templates already have masks. Nothing to do.');
        return;
    }

    console.log(`Found ${templates.length} template(s) without masks.\n`);

    for (const template of templates) {
        try {
            console.log(`⏳ Generating mask for: ${template.name} (${template.id})`);

            const maskBuffer = await generateFaceMask(template.preview_image_url as string);

            const storagePath = `masks/${template.id}-mask.png`;

            const { error: uploadError } = await supabase.storage
                .from('templates')
                .upload(storagePath, maskBuffer, { contentType: 'image/png', upsert: true });

            if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

            const { data: publicData } = supabase.storage
                .from('templates')
                .getPublicUrl(storagePath);

            const { error: updateError } = await supabase
                .from('portrait_templates')
                .update({ mask_image: publicData.publicUrl })
                .eq('id', template.id);

            if (updateError) throw new Error(`DB update failed: ${updateError.message}`);

            console.log(`✅ Done: ${template.name} → ${storagePath}\n`);
        } catch (err) {
            console.error(
                `❌ Failed for "${template.name}":`,
                err instanceof Error ? err.message : err,
            );
            console.log('   Skipping...\n');
        }
    }

    console.log('🎉 All masks generated!');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
