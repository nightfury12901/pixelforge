/**
 * Seed script — uploads local template images to Supabase Storage
 * and inserts them into the portrait_templates table.
 *
 * Usage:  node scripts/seed-templates.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envFile = fs.readFileSync(path.resolve(__dirname, '..', '.env.local'), 'utf-8');
for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    process.env[key] = val;
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── LinkedIn templates (professional) ───
const linkedinTemplates = [
    { file: '1-linkedin.jpeg', name: 'Ultra Professional Studio Headshot', prompt: '{subject} standing in a clean modern corporate studio with soft even lighting, tailored charcoal suit and crisp white shirt, no logos, shallow depth of field, crisp natural skin tones, soft key light from camera left, slight fill light from camera right, eye-level DSLR look, 85mm lens f/2.0, no text, professional LinkedIn portfolio quality.' },
    { file: '2-linkedin.jpeg', name: 'Executive Office Portrait', prompt: '{subject} in a modern glass office with a neutral background, crossing arms confidently, tailored navy suit, soft warm rim light, balanced fill light, deep contrast, subtle cityscape bokeh, 50mm lens f/2.8, ultra-realistic detail, corporate branding style.' },
    { file: '3-linkedin.jpeg', name: 'Startup Founder Creative Look', prompt: '{subject} in a high-end creative workspace, smart casual blazer, clean desk behind, natural window lighting, subtle rim highlight, shallow depth of field, sharp face detail, professional editorial look, no watermark.' },
    { file: '4-linkedin.jpeg', name: 'Boardroom Presence', prompt: '{subject} seated at a long boardroom table, serious analytical gaze, matte background with subtle office reflectors, soft shadows, DSLR 85mm f/2.2, natural skin texture, corporate confidence aesthetic.' },
    { file: '5-linkedin.jpeg', name: 'Minimal White Background Headshot', prompt: '{subject} neutral gray background, tailored black blazer, soft even lighting, subtle catch lights in eyes, professional portrait studio style, 85mm f/1.8, clean sharp focus, no bokeh artifacts.' },
    { file: '6-linkedin.jpeg', name: 'Finance Professional Look', prompt: '{subject} in classic navy blazer, white shirt, deep blue gradient background, soft cinematic lighting, 50mm lens f/2.0, subtle rim light, intense but approachable gaze, LinkedIn Ready.' },
    { file: '7-linkedin.jpeg', name: 'Creative Director Portrait', prompt: '{subject} relaxed stylish jacket over tee, modern brick wall background washed softly, artistic studio light, deep shadow separation, DSLR 35mm f/2.8, ultra-realistic, no styling artifacts.' },
    { file: '8-linkedin.jpeg', name: 'Academic Lecturer Portrait', prompt: '{subject} in front of soft bookshelf background, warm lighting, jean jacket + collared shirt, DSLR 50mm f/2.2, intelligent thoughtful expression, editorial classroom vibe.' },
    { file: '9-linkedin.jpeg', name: 'Luxury Branding Professional', prompt: '{subject} black tailored suit with subtle texture, low contrast black background, soft box key, fill from right, 85mm f/1.8, ultra-smooth skin, magazine editorial vibe.' },
    { file: '10-linkedin.jpeg', name: 'Young Professional Ambient Light', prompt: '{subject} casual blazer over white tee, environment with subtle office lights, even cinematic fill, 50mm f/2.2, skin pores visible, true-to-life tones, corporate lifestyle portrait.' },
];

// ─── Arts templates (artistic) ───
const artsTemplates = [
    { file: 'arts1.jpeg', name: 'Renaissance Oil Painting', prompt: '{subject} in classical Renaissance pose, cracked oil canvas texture, Rembrandt lighting, 50mm lens framing, warm deep shadows, ultra-realistic brushstroke aesthetic.' },
    { file: "arts2'.jpeg", name: 'Cyberpunk Neon Glow', prompt: '{subject} amid futuristic neon city, dramatic rim lighting, high contrast, wet reflective streets, deep purple + cyan accents, 35mm cinematic look.' },
    { file: 'arts3.jpeg', name: 'Anime Cel Shaded', prompt: '{subject} in stylized anime portrait, expressive eyes, smooth cel shading, bright but soft lighting, pastel gradient background, high detail 2D render.' },
    { file: 'arts4.jpeg', name: 'Street Graffiti Mural', prompt: '{subject} stylized as urban graffiti mural, spray-paint texture, bold color blocking, rough wall surface realism, dynamic shadow contour.' },
    { file: 'arts5.jpeg', name: 'Watercolor Dreamscape', prompt: '{subject} gentle watercolor texture, soft pastel washes, subtle paper grain, muted environment, dreamy and ethereal quality.' },
    { file: 'arts6.jpeg', name: 'Film Noir Monochrome', prompt: '{subject} black-and-white noir portrait, dramatic shadows, cigarette smoke ring, classic 1940s vibes, 50mm lens film grain.' },
    { file: 'arts8.jpeg', name: 'Pop Art Explosion', prompt: '{subject} vibrant pop art portrait, bold halftone dots, flat vivid blocks of color, commercial poster style.' },
];

async function uploadAndInsert(filePath, template, category) {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpeg`;
    const storagePath = `templates/${fileName}`;

    // Read file
    const fileBuffer = fs.readFileSync(filePath);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('templates')
        .upload(storagePath, fileBuffer, { contentType: 'image/jpeg', upsert: false });

    if (uploadError) {
        console.error(`  ❌ Upload failed for ${template.name}:`, uploadError.message);
        return false;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('templates').getPublicUrl(storagePath);

    // Insert into DB
    const { error: dbError } = await supabase.from('portrait_templates').insert({
        name: template.name,
        description: template.name,
        preview_image_url: urlData.publicUrl,
        prompt_template: template.prompt,
        category,
        tier: 'free',
        aspect_ratio: category === 'professional' ? '3:4' : '9:16',
        is_trending: false,
        is_new: true,
        is_published: true,
        popularity_score: 0,
        usage_count: 0,
    });

    if (dbError) {
        console.error(`  ❌ DB insert failed for ${template.name}:`, dbError.message);
        return false;
    }

    console.log(`  ✅ ${template.name}`);
    return true;
}

async function main() {
    const rootDir = path.resolve(__dirname, '..');

    console.log('\n📸 Seeding LinkedIn (Professional) templates...\n');
    for (const t of linkedinTemplates) {
        const filePath = path.join(rootDir, 'Linkedin', t.file);
        if (!fs.existsSync(filePath)) { console.log(`  ⏭️  Skipped (not found): ${t.file}`); continue; }
        await uploadAndInsert(filePath, t, 'professional');
    }

    console.log('\n🎨 Seeding Arts (Artistic) templates...\n');
    for (const t of artsTemplates) {
        const filePath = path.join(rootDir, 'arts', t.file);
        if (!fs.existsSync(filePath)) { console.log(`  ⏭️  Skipped (not found): ${t.file}`); continue; }
        await uploadAndInsert(filePath, t, 'artistic');
    }

    console.log('\n🎉 Done!\n');
}

main().catch(console.error);
