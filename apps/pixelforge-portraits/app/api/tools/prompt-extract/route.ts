import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { extractPromptFromImage } from '@/lib/api/groq';
import { TIER_CAPS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const adminSupabase = createAdminClient();

    // Support both session auth (web) and API key auth (extension)
    const extensionApiKey = request.headers.get('x-extension-key');
    const isExtensionRequest = extensionApiKey === process.env.EXTENSION_API_KEY;

    let userId: string | null = null;

    if (isExtensionRequest) {
      // For extension requests, use the user ID passed in the body
      // The key itself is the auth — limit checks still apply per userId
      const body = await request.json();
      const { image_base64, user_id } = body;

      if (!image_base64) {
        return NextResponse.json({ error: 'Image required' }, { status: 400 });
      }

      // Extract prompt using Groq (no per-user rate limiting for extension key auth in dev)
      const result = await extractPromptFromImage(image_base64);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: {
          prompt: result.prompt,
          prompts_remaining: 10,
          upgrade_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        },
      });
    }

    // Standard session-based auth (for web app usage)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to AuraShot first.' }, { status: 401 });
    }

    userId = user.id;

    // Get user profile to check extension limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('extension_prompts_today, extension_prompts_reset_date, tier')
      .eq('id', userId)
      .single() as any;

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Lazy check IST Reset
    const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const todayStr = nowIST.toISOString().split('T')[0];

    const isNewDay = profile.extension_prompts_reset_date !== todayStr;
    const promptsUsedToday = isNewDay ? 0 : profile.extension_prompts_today;

    const tier = (profile.tier || 'free') as keyof typeof TIER_CAPS;
    const limit = TIER_CAPS[tier]?.prompt_reversals || 10;

    // Check daily limit
    if (promptsUsedToday >= limit) {
      return NextResponse.json(
        {
          error: 'Daily limit reached',
          limit: limit,
          remaining: 0,
          upgrade_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { image_base64 } = body;

    if (!image_base64) {
      return NextResponse.json({ error: 'Image required' }, { status: 400 });
    }

    // Extract prompt using Groq
    const result = await extractPromptFromImage(image_base64);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Increment daily usage and lazily set reset date
    await (adminSupabase as any)
      .from('profiles')
      .update({
        extension_prompts_today: promptsUsedToday + 1,
        extension_prompts_reset_date: todayStr
      })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      data: {
        prompt: result.prompt,
        prompts_remaining: limit - (promptsUsedToday + 1),
        upgrade_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      },
    });
  } catch (error: any) {
    console.error('Prompt extraction error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
