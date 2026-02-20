import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newTemplates = [
    { name: 'Golden Hour Breeze', category: 'lifestyle', tier: 'free', aspect_ratio: '3:4', prompt_template: 'A beach girl walking barefoot along the shoreline during golden hour. Her hair dances in the sea breeze, and the sunlight kisses her skin with a warm, cinematic glow. Gentle waves reflect orange and pink hues as she smiles naturally toward the lens. Style: Cinematic | Golden Hour | Natural | Warm | Lifestyle', preview_image_url: 'https://unstop.com/images/logo.png', description: 'Cinematic sunrise/sunset vibe on the beach.' },
    { name: 'Tropical Serenity', category: 'lifestyle', tier: 'free', aspect_ratio: '3:4', prompt_template: 'A girl in a white sundress stands near a palm tree, soft shadows falling across her face. The horizon glows with pastel skies, and her gentle expression feels calm and alive, like a dreamy vlog moment. Style: Soft Pastel | Dreamy | Minimal | Tropical | Calm', preview_image_url: 'https://unstop.com/images/logo.png', description: 'Calm, tropical, pastel vibe.' },
    { name: 'Tide Wanderer', category: 'lifestyle', tier: 'starter', aspect_ratio: '3:4', prompt_template: 'A man walks shirtless by the tide, jeans rolled up, sunlight reflecting on wet sand. His confident expression and cinematic lighting create a lifestyle-magazine energy. Style: Cinematic | Confident | Natural | Lifestyle | Warm', preview_image_url: 'https://unstop.com/images/logo.png', description: 'Confident beach lifestyle.' },
    { name: 'Glamorous 28th Birthday', category: 'trending', tier: 'pro', aspect_ratio: '3:4', prompt_template: 'Elegant woman holding a chocolate cake under a warm spotlight, wearing a glittering black gown and silver crown. Cinematic, modern vibe.', preview_image_url: 'https://unstop.com/images/logo.png', description: 'Spotlight glowing birthday.' },
    { name: 'Retro Bollywood', category: 'professional', tier: 'starter', aspect_ratio: '3:4', prompt_template: 'Dashing South Indian man with beard, yellow-tinted sunglasses, white three-piece suit, seated on a red convertible. Bright blue sky, ocean, and cityscape background.', preview_image_url: 'https://unstop.com/images/logo.png', description: 'Vintage South Indian movie poster feel.' },
    { name: 'Saree Elegance', category: 'indian', tier: 'free', aspect_ratio: '3:4', prompt_template: 'A beautiful girl wearing a flowing silk saree, traditional Indian jewelry, and soft makeup, standing in a vintage Bollywood studio setting. Cinematic lighting, vibrant fabric details, portrait photography, 9:16, Instagram aesthetic. Keep original facial features.', preview_image_url: 'https://unstop.com/images/logo.png', description: 'Classic Indian saree elegance.' },
    { name: 'Father-Daughter Bench', category: 'lifestyle', tier: 'starter', aspect_ratio: '3:4', prompt_template: 'Sitting together on a wooden bench in a sunlit garden, smiling warmly at each other. Golden-hour lighting, cinematic depth of field, 85mm lens. Exact same faces as uploaded image.', preview_image_url: 'https://unstop.com/images/logo.png', description: 'Heartwarming family bonding.' },
    { name: 'Diwali Fireworks Terrace', category: 'indian', tier: 'pro', aspect_ratio: '3:4', prompt_template: 'Hyper-realistic 4K cinematic portrait. Man in white kurta holds lit firecracker; woman in bright yellow embroidered lehenga choli holds a glittering firecracker. Diwali night, terrace with fireworks and glowing diyas. Identical faces to reference photo.', preview_image_url: 'https://unstop.com/images/logo.png', description: 'Festive night with fireworks.' },
    { name: 'Pixie Cut', category: 'lifestyle', tier: 'free', aspect_ratio: '3:4', prompt_template: 'Keep exact face, body, pose, outfit, and background from uploaded image, but change the hairstyle to a pixie cut. Natural, realistic, consistent with lighting and head shape.', preview_image_url: 'https://unstop.com/images/logo.png', description: 'Preview a pixie cut hairstyle.' },
    { name: 'Retro Red Dress Rose', category: 'artistic', tier: 'pro', aspect_ratio: '9:16', prompt_template: 'Deep red dress, golden-hour side light, one long-stemmed red rose near chest, gentle affectionate gaze, soft bokeh, 90s romantic movie aesthetic. 9:16, ultra-realistic.', preview_image_url: 'https://unstop.com/images/logo.png', description: '90s romantic movie poster style.' }
];

async function seed() {
    console.log('Seeding new templates...');
    const { data, error } = await supabase
        .from('portrait_templates')
        .insert(newTemplates)
        .select();

    if (error) {
        console.error('Error inserting templates:', error.message);
    } else {
        console.log('Successfully inserted', data ? data.length : 0, 'templates.');
    }
}

seed();
