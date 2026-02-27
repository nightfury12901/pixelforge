const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/templates/templates`;

const MAP = {
    'Still Among Chaos': '1771502242394-wrqjrs.png',
    'Executive Office Portrait': '1771525994148-wz09kw.jpeg',
    'Ultra Professional Studio Headshot': '1771525985761-9hrnch.jpeg',
    'Flute with Krishna': '1771516974302-qm29sr.png',
    'Luxury Branding Professional': '1771526011107-d0jvfp.jpeg',
};

async function run() {
    const { data } = await sb.from('portrait_templates').select('id, name');
    for (const t of data) {
        const file = MAP[t.name];
        if (!file) continue;
        const { error } = await sb.from('portrait_templates')
            .update({ preview_image_url: `${BASE}/${file}` })
            .eq('id', t.id);
        console.log(error ? `❌ ${t.name}: ${error.message}` : `✅ ${t.name} → ${file}`);
    }
}
run().catch(console.error);
