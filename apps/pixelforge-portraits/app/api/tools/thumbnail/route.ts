import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkCredits, deductCredits } from '@/lib/credits';
import { generatePortrait } from '@/lib/api/pollinations';
import { checkRateLimit } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();
        const adminSupabase = createAdminClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting check
        const { data: profile } = await (supabase as any).from('profiles').select('tier').eq('id', user.id).single();
        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const rateLimit = await checkRateLimit(user.id, profile.tier);
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Rate limit exceeded', limit: rateLimit.limit, remaining: rateLimit.remaining },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { prompt, aspect_ratio = '1:1', batch_size = 1 } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Check Credits (cost is 1 for thumbnail/image gen)
        const creditsCheck = await checkCredits(user.id);
        if (!creditsCheck.hasCredits) {
            return NextResponse.json({ error: 'Insufficient credits', remaining: 0 }, { status: 402 });
        }

        const deductResult = await deductCredits(user.id, 'thumbnail');
        if (!deductResult.success) {
            return NextResponse.json({ error: deductResult.error }, { status: 400 });
        }

        // Create generation record
        const { data: generation } = await (adminSupabase as any)
            .from('generations')
            .insert({
                user_id: user.id,
                operation_type: 'thumbnail',
                status: 'processing',
                credits_used: 1,
            })
            .select()
            .single();

        // Call Pollinations API
        const result = await generatePortrait({
            prompt,
            aspect_ratio,
            num_outputs: batch_size,
        });

        if (!result.success || !result.output) {
            // Refund on failure
            await (adminSupabase as any).rpc('increment', { row_id: user.id, x: 1 });
            if (generation) {
                await (adminSupabase as any).from('generations').update({ status: 'failed', error_message: result.error }).eq('id', generation.id);
            }
            return NextResponse.json({ error: result.error || 'Generation failed' }, { status: 500 });
        }

        const finalUrls = Array.isArray(result.output) ? result.output : [result.output];

        if (generation) {
            await (adminSupabase as any).from('generations').update({
                output_image_url: finalUrls[0],
                status: 'completed',
            }).eq('id', generation.id);
        }

        return NextResponse.json({
            success: true,
            data: {
                images: finalUrls,
                enhanced_prompt: prompt,
            },
        });

    } catch (error: any) {
        console.error('Thumbnail generation error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
