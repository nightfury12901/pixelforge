import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { checkCredits, deductCredits, canAccessTemplate } from '@/lib/credits';
import { getTemplateById, trackTemplateUsage } from '@/lib/templates';
import { generatePortrait } from '@/lib/api/huggingface';
import { checkRateLimit } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile for tier and rate limiting
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(user.id, profile.tier);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          reset: rateLimit.reset,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { template_id, image_base64 } = body;

    if (!template_id || !image_base64) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get template
    const template = await getTemplateById(template_id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check template access
    if (!canAccessTemplate(profile.tier, template.tier)) {
      return NextResponse.json(
        { error: 'Upgrade required to use this template' },
        { status: 403 }
      );
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
    const deductResult = await deductCredits(user.id, 'portrait', template_id);
    if (!deductResult.success) {
      return NextResponse.json({ error: deductResult.error }, { status: 400 });
    }

    // Create generation record
    const { data: generation, error: createError } = await adminSupabase
      .from('generations')
      .insert({
        user_id: user.id,
        operation_type: 'portrait',
        template_id,
        status: 'processing',
        credits_used: 1,
      })
      .select()
      .single();

    if (createError || !generation) {
      return NextResponse.json({ error: 'Failed to create generation' }, { status: 500 });
    }

    // Track template usage
    await trackTemplateUsage(template_id, user.id);

    // Generate portrait asynchronously
    generatePortraitAsync(
      generation.id,
      user.id,
      template.prompt_template,
      image_base64,
      profile.tier
    );

    return NextResponse.json({
      success: true,
      data: {
        generation_id: generation.id,
        status: 'processing',
        message: 'Portrait generation started',
        credits_remaining: deductResult.remaining,
      },
    });
  } catch (error: any) {
    console.error('Portrait generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Async function to handle portrait generation
async function generatePortraitAsync(
  generationId: string,
  userId: string,
  promptTemplate: string,
  imageBase64: string,
  tier: string
) {
  const adminSupabase = createAdminClient();
  const startTime = Date.now();

  try {
    // Determine output quality based on tier
    const aspectRatio = tier === 'pro' || tier === 'lifetime' ? '3:4' : '3:4';
    const numInferenceSteps = tier === 'pro' || tier === 'lifetime' ? 35 : 28;

    // Generate with Replicate
    const result = await generatePortrait({
      prompt: promptTemplate,
      image: `data:image/jpeg;base64,${imageBase64}`,
      num_outputs: 1,
      aspect_ratio: aspectRatio,
      output_format: 'webp',
      guidance_scale: 3.5,
      num_inference_steps: numInferenceSteps,
    });

    if (!result.success || !result.output) {
      throw new Error(result.error || 'Generation failed');
    }

    const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;

    // Update generation record
    await adminSupabase
      .from('generations')
      .update({
        output_image_url: outputUrl,
        status: 'completed',
        processing_time_ms: Date.now() - startTime,
      })
      .eq('id', generationId);
  } catch (error: any) {
    console.error('Async generation error:', error);

    // Update generation with error
    await adminSupabase
      .from('generations')
      .update({
        status: 'failed',
        error_message: error.message,
        processing_time_ms: Date.now() - startTime,
      })
      .eq('id', generationId);

    // Refund credit
    await adminSupabase.rpc('increment', {
      row_id: userId,
      x: 1,
    });
  }
}
