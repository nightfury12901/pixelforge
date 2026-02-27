import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient, createClientFromToken } from '@/lib/supabase/server';
import { checkCredits, deductCredits } from '@/lib/credits';
import { enhanceImage } from '@/lib/api/fal';
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
    const { image_url, colorize = false } = body;

    if (!image_url) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    // Check credits
    const creditsCheck = await checkCredits(user.id, 'enhance');
    if (!creditsCheck.hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient limits for enhancement. Upgrade pack.', remaining: creditsCheck.remaining },
        { status: 402 }
      );
    }

    // Run Flux Pro Kontext synchronously
    console.log('[enhance] calling flux-pro/kontext for user', user.id, 'colorize:', colorize);
    const result = await enhanceImage(image_url, colorize);

    if (!result.success || !result.imageUrl) {
      return NextResponse.json(
        { error: result.error || 'Enhancement failed' },
        { status: 500 }
      );
    }

    // Deduct credit after success
    await deductCredits(user.id, 'enhance');

    // Create generation record (non-blocking, standard columns only)
    (adminSupabase as any).from('generations').insert({
      user_id: user.id,
      operation_type: 'enhance',
    }).then(({ error }: any) => {
      if (error) console.warn('[enhance] insert warning:', error.message);
    });

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: result.imageUrl,
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
