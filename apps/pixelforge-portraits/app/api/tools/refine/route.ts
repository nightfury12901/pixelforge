import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { generatePortrait } from '@/lib/api/pollinations';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const FREE_EDITS = 4;
const CREDIT_PER_EXTRA_EDIT = 0.5;

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const adminSupabase = createAdminClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { current_prompt, instruction, edits_used, aspect_ratio = '1:1' } = await request.json();

        if (!current_prompt || !instruction) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Determine if this is a paid edit
        const isPaidEdit = edits_used >= FREE_EDITS;

        let profile: any = null;

        if (isPaidEdit) {
            // Check credits (0.5 credits)
            const { data: pData } = await (supabase as any)
                .from('profiles')
                .select('credits_remaining')
                .eq('id', user.id)
                .single();
            profile = pData;

            if (!profile || (profile.credits_remaining ?? 0) < CREDIT_PER_EXTRA_EDIT) {
                return NextResponse.json(
                    { error: 'Insufficient credits. You need 0.5 credits for additional edits.' },
                    { status: 402 }
                );
            }

            // Deduct 0.5 credits
            await (adminSupabase as any)
                .from('profiles')
                .update({ credits_remaining: profile.credits_remaining - CREDIT_PER_EXTRA_EDIT })
                .eq('id', user.id);
        }

        // Use Groq to modify the prompt based on the user's instruction
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an expert AI image prompt engineer. 
The user has a current image generation prompt and wants to make a specific change to it.
Your job is to take the original prompt and their instruction, and output a REVISED prompt that incorporates their change.
Keep what is good about the original prompt. Only apply the change they describe.
Output ONLY the new prompt text with no explanation, no quotes, no preamble.`,
                },
                {
                    role: 'user',
                    content: `Original prompt: "${current_prompt}"\n\nUser's edit instruction: "${instruction}"\n\nNew revised prompt:`,
                },
            ],
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            temperature: 0.7,
            max_tokens: 400,
        });

        const refinedPrompt = completion.choices[0]?.message?.content?.trim();

        if (!refinedPrompt) {
            return NextResponse.json({ error: 'Failed to refine prompt' }, { status: 500 });
        }

        // Now generate the edited image with Pollinations
        const result = await generatePortrait({
            prompt: refinedPrompt,
            aspect_ratio: aspect_ratio,
        });

        // result.output is an array of strings in our Pollinations implementation
        const finalUrl = Array.isArray(result.output) ? result.output[0] : null;

        if (!result.success) {
            // Refund the 0.5 credits if fal.ai fails
            if (isPaidEdit) {
                await (adminSupabase as any)
                    .from('profiles')
                    .update({ credits_remaining: profile.credits_remaining })
                    .eq('id', user.id);
            }
            return NextResponse.json({ error: result.error || 'Image refinement failed' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: {
                images: finalUrl ? [finalUrl] : [],
                refined_prompt: refinedPrompt,
                was_paid: isPaidEdit,
                credits_used: isPaidEdit ? CREDIT_PER_EXTRA_EDIT : 0,
            },
        });

    } catch (error: any) {
        console.error('Refine error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
