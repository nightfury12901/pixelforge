/**
 * scripts/generate-all-masks.mjs
 *
 * One-time script: generates black/white face masks for all templates that
 * don't yet have a mask_image, uploads them to Supabase Storage, and records
 * the public URL in the templates.mask_image column.
 *
 * Run:
 *   node --loader ts-node/esm scripts/generate-all-masks.mjs
 *
 * Prerequisites:
 *   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   FAL_KEY in .env.local
 *   opencv4nodejs and sharp installed
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { generateFaceMask } from '../lib/api/mask-generator.ts';

// ─── Supabase admin client ────────────────────────────────────────────────────

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🎭 PixelForge mask generator — starting...\n');

    // Fetch all templates without a mask
    const { data: templates, error: fetchError } = await supabase
        .from('portrait_templates')
        .select('id, name, template_image')
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

            // Generate mask buffer
            const maskBuffer = await generateFaceMask(template.template_image);

            // Upload to Supabase Storage
            const storagePath = `masks/${template.id}-mask.png`;

            const { error: uploadError } = await supabase.storage
                .from('templates')
                .upload(storagePath, maskBuffer, {
                    contentType: 'image/png',
                    upsert: true,
                });

            if (uploadError) {
                throw new Error(`Storage upload failed: ${uploadError.message}`);
            }

            // Get public URL
            const { data: publicData } = supabase.storage
                .from('templates')
                .getPublicUrl(storagePath);

            const publicUrl = publicData.publicUrl;

            // Update templates table
            const { error: updateError } = await supabase
                .from('portrait_templates')
                .update({ mask_image: publicUrl })
                .eq('id', template.id);

            if (updateError) {
                throw new Error(`DB update failed: ${updateError.message}`);
            }

            console.log(`✅ Done: ${template.name} → ${storagePath}\n`);

        } catch (err) {
            console.error(`❌ Failed for template "${template.name}":`, err instanceof Error ? err.message : err);
            console.log('   Skipping and continuing...\n');
        }
    }

    console.log('🎉 All masks generated!');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
