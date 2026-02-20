import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkCredits, deductCredits } from '@/lib/credits';
import { generateImageWithFal } from '@/lib/api/fal';
import { enhancePrompt } from '@/lib/api/groq';
import { checkRateLimit } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const adminSupabase = createAdminClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('tier')
            .eq('id', user.id)
            .single();

        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

        const rateLimit = await checkRateLimit(user.id, profile.tier);
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded', reset: rateLimit.reset },
                { status: 429 }
            );
        }

        const { prompt, aspect_ratio = '16:9', batch_size = 1, _skip_credit_deduct = false } = await request.json();

        if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

        // Enhance prompt
        const enhancedResponse = await enhancePrompt(prompt);
        const finalPrompt = enhancedResponse.success ? enhancedResponse.prompt! : prompt;

        // Check credits (skip for free refine edits)
        if (!_skip_credit_deduct) {
            const creditsCheck = await checkCredits(user.id);
            if (!creditsCheck.hasCredits) {
                return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
            }

            const deductResult = await deductCredits(user.id, 'thumbnail');
            if (!deductResult.success) {
                return NextResponse.json({ error: deductResult.error }, { status: 400 });
            }
        }

        // Generate image via fal.ai (FLUX schnell)
        const result = await generateImageWithFal(finalPrompt, aspect_ratio);

        if (!result.success) {
            // No refund needed if credit was skipped
            try {
                if (!_skip_credit_deduct) {
                    await (adminSupabase as any).from('profiles').update({ credits_remaining: profile.credits_remaining }).eq('id', user.id);
                }
            } catch (e) { }
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // Save record
        await (adminSupabase as any).from('generations').insert({
            user_id: user.id,
            operation_type: 'thumbnail',
            prompt: finalPrompt,
            status: 'completed',
            output_image_url: result.url || null,
            credits_used: 1,
            metadata: { batch_size, aspect_ratio, original_prompt: prompt }
        });

        return NextResponse.json({
            success: true,
            data: {
                images: result.url ? [result.url] : [],
                enhanced_prompt: finalPrompt,
            },
        });

    } catch (error: any) {
        console.error('Thumbnail generation error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
