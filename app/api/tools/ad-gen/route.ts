import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkCredits, deductCredits } from '@/lib/credits';
import { checkRateLimit } from '@/lib/ratelimit';
import Groq from 'groq-sdk';
import { generatePortrait } from '@/lib/api/huggingface';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient() as any;
        const adminSupabase = createAdminClient() as any;

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single();
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

        const rateLimit = await checkRateLimit(user.id, profile.tier);
        if (!rateLimit.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

        const { ad_text, ad_image_base64, target_product } = await request.json();

        if (!target_product) return NextResponse.json({ error: 'Target product is required' }, { status: 400 });
        if (!ad_text && !ad_image_base64) return NextResponse.json({ error: 'Provide either ad text or an ad image' }, { status: 400 });

        const creditsCheck = await checkCredits(user.id);
        if (!creditsCheck.hasCredits) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });

        const deductResult = await deductCredits(user.id, 'thumbnail'); // Using thumbnail cost for now
        if (!deductResult.success) return NextResponse.json({ error: deductResult.error }, { status: 400 });

        // Step 1: Analyze Reference Ad & Extract Optimized Prompt
        let messages: any[] = [
            {
                role: 'system',
                content: `You are an expert advertising copywriter and AI prompt engineer. The user is providing a reference ad (either text or image) and wants to sell THEIR product: "${target_product}".
        Analyze the psychological hooks, lighting, composition, and aesthetic of the reference ad.
        Then, generate a HIGHLY OPTIMIZED, cinematic AI image prompt that mimics that successful ad style but features the user's target product.
        DO NOT explain. ONLY output the raw midjourney/flux-style image prompt.`
            }
        ];

        if (ad_image_base64) {
            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: `Reference Ad Image attached. Target Product to advertise: ${target_product}` },
                    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${ad_image_base64}` } }
                ]
            });
        } else {
            messages.push({
                role: 'user',
                content: `Reference Ad Text: "${ad_text}"\n\nTarget Product to advertise: "${target_product}"`
            });
        }

        const completion = await groq.chat.completions.create({
            messages,
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            temperature: 0.7,
            max_tokens: 300,
        });

        const optimizedPrompt = completion.choices[0]?.message?.content;
        if (!optimizedPrompt) throw new Error("Failed to generate ad prompt");

        // Step 2: Generate the Image using HuggingFace
        const result = await generatePortrait({
            prompt: optimizedPrompt.trim(),
            num_outputs: 1,
            aspect_ratio: '16:9',
            num_inference_steps: 4,
        });

        if (!result.success) {
            await adminSupabase.from('profiles').update({ credits_remaining: deductResult.remaining + 1 }).eq('id', user.id);
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // Step 3: Save record
        await adminSupabase.from('generations').insert({
            user_id: user.id,
            operation_type: 'ad_gen', // Might need to add to DB enum later if strictly typed
            prompt: optimizedPrompt.trim(),
            status: 'completed',
            output_image_url: result.output && result.output.length > 0 ? result.output[0] : null,
            credits_used: 1,
            metadata: { target_product, source: ad_image_base64 ? 'image' : 'text' }
        });

        return NextResponse.json({
            success: true,
            data: {
                images: result.output,
                prompt: optimizedPrompt.trim(),
            },
        });

    } catch (error: any) {
        console.error('Ad Gen error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
