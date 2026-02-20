import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { generateVideoWithFal } from '@/lib/api/fal';
import { OPERATION_COSTS } from '@/lib/constants';
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
            .select('tier, credits_remaining')
            .eq('id', user.id)
            .single();

        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

        // Rate limit check
        const rateLimit = await checkRateLimit(user.id, profile.tier);
        if (!rateLimit.success) {
            return NextResponse.json({ error: 'Rate limit exceeded', reset: rateLimit.reset }, { status: 429 });
        }

        const { prompt, image_url, duration = 5, aspect_ratio = '16:9' } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Calculate credit cost
        const creditCost = duration >= 10 ? OPERATION_COSTS.video_10s : OPERATION_COSTS.video_5s;

        if ((profile.credits_remaining ?? 0) < creditCost) {
            return NextResponse.json(
                { error: `Not enough credits. This video costs ${creditCost} credits. You have ${profile.credits_remaining ?? 0}.` },
                { status: 402 }
            );
        }

        // Deduct credits upfront
        await (adminSupabase as any)
            .from('profiles')
            .update({ credits_remaining: profile.credits_remaining - creditCost })
            .eq('id', user.id);

        // Generate video via fal.ai / Kling 2.1
        const result = await generateVideoWithFal({
            prompt,
            image_url: image_url || undefined,
            duration: duration as 5 | 10,
            aspect_ratio: aspect_ratio as '16:9' | '9:16' | '1:1',
        });

        if (!result.success) {
            // Refund credits on failure
            await (adminSupabase as any)
                .from('profiles')
                .update({ credits_remaining: profile.credits_remaining })
                .eq('id', user.id);
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // Save to history
        await (adminSupabase as any).from('generations').insert({
            user_id: user.id,
            operation_type: 'video',
            prompt,
            status: 'completed',
            output_image_url: result.url,
            credits_used: creditCost,
            metadata: { duration, aspect_ratio, mode: image_url ? 'image-to-video' : 'text-to-video' },
        });

        return NextResponse.json({
            success: true,
            data: {
                video_url: result.url,
                credits_used: creditCost,
                credits_remaining: profile.credits_remaining - creditCost,
            },
        });

    } catch (error: any) {
        console.error('Video generation error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
