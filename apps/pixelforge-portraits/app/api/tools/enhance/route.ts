import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient, createClientFromToken } from '@/lib/supabase/server';
import { checkCredits, deductCredits } from '@/lib/credits';
import { enhanceImage } from '@/lib/api/pollinations';
import { checkRateLimit } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient();

    // Support both cookie auth (browser) and Bearer token auth (Postman/curl)
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const supabase = bearerToken ? createClientFromToken(bearerToken) : createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let { data: profile } = await (supabase as any)
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single();

    // Auto-create profile if missing (user signed up before DB trigger was set up)
    if (!profile) {
      const { data: newProfile } = await (adminSupabase as any)
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          tier: 'free',
          credits_remaining: 2,
          total_credits_used: 0,
        })
        .select('tier')
        .single();
      profile = newProfile;
    }

    if (!profile) {
      return NextResponse.json({ error: 'Could not create profile' }, { status: 500 });
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(user.id, profile.tier);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', reset: rateLimit.reset },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { image_url } = body;

    if (!image_url) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    // Check credits
    const creditsCheck = await checkCredits(user.id);
    if (!creditsCheck.hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits', remaining: 0 },
        { status: 402 }
      );
    }

    // Deduct credits
    const deductResult = await deductCredits(user.id, 'enhance');
    if (!deductResult.success) {
      return NextResponse.json({ error: deductResult.error }, { status: 400 });
    }

    // Create generation record
    const { data: generation } = await (adminSupabase as any)
      .from('generations')
      .insert({
        user_id: user.id,
        operation_type: 'enhance',
        input_image_url: image_url,
        status: 'processing',
        credits_used: 1,
      })
      .select()
      .single();

    // Enhance image
    enhanceImageAsync(generation!.id, user.id, image_url);

    return NextResponse.json({
      success: true,
      data: {
        generation_id: generation!.id,
        status: 'processing',
        credits_remaining: deductResult.remaining,
      },
    });
  } catch (error: any) {
    console.error('Enhancement error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function enhanceImageAsync(generationId: string, userId: string, imageUrl: string) {
  const adminSupabase = createAdminClient();
  const startTime = Date.now();

  try {
    const result = await enhanceImage(imageUrl);

    if (!result.success || !result.output) {
      throw new Error(result.error || 'Enhancement failed');
    }

    const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;

    await (adminSupabase as any)
      .from('generations')
      .update({
        output_image_url: outputUrl,
        status: 'completed',
        processing_time_ms: Date.now() - startTime,
      })
      .eq('id', generationId);
  } catch (error: any) {
    console.error('Async enhancement error:', error);

    await (adminSupabase as any)
      .from('generations')
      .update({
        status: 'failed',
        error_message: error.message,
        processing_time_ms: Date.now() - startTime,
      })
      .eq('id', generationId);
  }
}
