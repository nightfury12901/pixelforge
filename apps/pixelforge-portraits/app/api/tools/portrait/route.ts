/**
 * app/api/tools/portrait/route.ts
 *
 * POST body:
 *   userFaceBase64:    string   — raw base64 (no data URI prefix)
 *   templateId?:       string   — preset template ID from DB  (Mode A)
 *   customImageBase64? string   — Creator+ only scene image   (Mode B)
 *   prompt?:           string   — override prompt for Mode B
 *
 * Model routing (Mode A):
 *   7 Artistic templates (anime, oil painting, etc.) → fal-ai/nano-banana-2/edit
 *   ALL other templates                              → fal-ai/ideogram/v3/edit (mask inpaint)
 *   Non-artistic with no mask                       → blocked (coming soon)
 *
 * Cost: $0.05–$0.12 = ₹4.60–₹11
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { checkCredits, deductCredits, getCreditsRemaining } from '@/lib/credits';
import {
  generatePortraitIdeogramV3,
  generatePortraitNanaBanana2,
  ARTISTIC_TEMPLATE_NAMES,
} from '@/lib/api/fal';
import { analyzeFaceFeatures, buildEnrichedPrompt } from '@/lib/api/face-analysis';
import { generateFaceMask, uploadTempMaskToSupabase } from '@/lib/api/mask-generator';
import { applyWatermark } from '@/lib/watermark';

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ── 1. Auth ──────────────────────────────────────────────────────────────
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Profile / tier ────────────────────────────────────────────────────
    const adminDb = createAdminClient() as any;

    const { data: profile, error: profileError } = await adminDb
      .from('profiles')
      .select('tier, credits_reset_date, created_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const tier: string = profile.tier ?? 'free';

    // ── 3. Credit check ──────────────────────────────────────────────────────
    const creditCheck = await checkCredits(user.id, 'portrait');
    if (!creditCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Portrait credits exhausted. Upgrade to continue.',
          used: creditCheck.used,
          limit: creditCheck.limit,
        },
        { status: 403 },
      );
    }

    // ── 4. Parse body ────────────────────────────────────────────────────────
    const body = await request.json();
    const {
      userFaceBase64,
      templateId,
      customImageBase64,
      prompt: customPrompt,
    }: {
      userFaceBase64: string;
      templateId?: string;
      customImageBase64?: string;
      prompt?: string;
    } = body;

    if (!userFaceBase64) {
      return NextResponse.json({ error: 'userFaceBase64 is required' }, { status: 400 });
    }

    // ── 5. Determine mode ────────────────────────────────────────────────────
    let templateImageUrl: string = '';
    let maskImageUrl: string = '';
    let basePrompt: string = '';
    let resolvedTemplateId: string | undefined;
    let useIdeogramModel = true;   // true → ideogram/v3/edit (default), false → nano-banana-2/edit
    let templateAspectRatio = '2:3';

    if (templateId) {
      // ── Mode A: Preset template ─────────────────────────────────────────
      const { data: template, error: templateError } = await adminDb
        .from('portrait_templates')
        .select('id, name, preview_image_url, mask_image, prompt_template, aspect_ratio')
        .eq('id', templateId)
        .single();

      if (templateError || !template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      const templateName: string = template.name as string;
      const isArtistic = ARTISTIC_TEMPLATE_NAMES.has(templateName);
      const hasMask = !!template.mask_image;

      // Routing:
      // - Artistic templates           → nano-banana-2/edit (art style transfer)
      // - Non-artistic WITH mask       → ideogram/character/edit (face inpainting)
      // - Non-artistic WITHOUT mask    → fall back to nano-banana-2/edit (no coming soon)
      const useNanaBanana = isArtistic || !hasMask;
      useIdeogramModel = !useNanaBanana;

      templateImageUrl = template.preview_image_url as string;
      maskImageUrl = (template.mask_image as string) ?? '';
      basePrompt = template.prompt_template as string;
      templateAspectRatio = (template.aspect_ratio as string) ?? '2:3';
      resolvedTemplateId = templateId;

    } else if (customImageBase64) {
      // ── Mode B: Custom image upload (Creator+ only) ─────────────────────
      if (tier === 'free' || tier === 'starter') {
        return NextResponse.json(
          { error: 'Custom image upload is a Creator+ feature. Upgrade to unlock.' },
          { status: 403 },
        );
      }

      templateImageUrl = `data:image/jpeg;base64,${customImageBase64}`;

      // Generate mask on-the-fly
      const maskBuffer = await generateFaceMask(templateImageUrl);
      maskImageUrl = await uploadTempMaskToSupabase(maskBuffer, user.id);

      basePrompt =
        customPrompt ??
        'Person in a professional cinematic setting, high quality, realistic lighting, editorial photography style.';

    } else {
      return NextResponse.json(
        { error: 'Provide either templateId or customImageBase64.' },
        { status: 400 },
      );
    }

    // ── 6. Build user face URL ────────────────────────────────────────────────
    const userFaceUrl = userFaceBase64.startsWith('data:')
      ? userFaceBase64
      : `data:image/jpeg;base64,${userFaceBase64}`;

    // ── 7. Face feature analysis ──────────────────────────────────────────────
    const features = await analyzeFaceFeatures(userFaceBase64);
    const enrichedPrompt = buildEnrichedPrompt(basePrompt, features);
    const userDescription = features
      ? Object.entries(features as unknown as Record<string, string>)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
      : 'a person';

    // ── 8. Portrait generation (routed by template type) ──────────────────
    let rawImageUrl: string;

    if (useIdeogramModel) {
      // Non-artistic template: mask-based face inpaint via ideogram/v3/edit
      console.log('[portrait/route] → ideogram/v3/edit (professional/lifestyle)');
      if (!maskImageUrl) {
        return NextResponse.json(
          { error: 'Template is missing a mask. Please contact support.' },
          { status: 500 },
        );
      }
      const result = await generatePortraitIdeogramV3({
        userFaceUrl,
        templateImageUrl,
        maskUrl: maskImageUrl,
        prompt: enrichedPrompt,
      });
      rawImageUrl = result.imageUrl;
    } else {
      // Artistic template: art-style transfer via nano-banana-2/edit
      console.log('[portrait/route] → nano-banana-2/edit (artistic style transfer)');
      const result = await generatePortraitNanaBanana2({
        userFaceUrl,
        templateImageUrl,
        templatePrompt: basePrompt,
        userDescription,
        aspectRatio: templateAspectRatio,
      });
      rawImageUrl = result.imageUrl;
    }

    // ── 9. Watermark (free tier only) ─────────────────────────────────────────
    let finalImageUrl: string;

    if (tier === 'free') {
      const imageRes = await fetch(rawImageUrl);
      if (!imageRes.ok) throw new Error('Failed to fetch generated image for watermarking');
      const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
      const watermarked = await applyWatermark(imageBuffer);
      finalImageUrl = `data:image/png;base64,${watermarked.toString('base64')}`;
    } else {
      finalImageUrl = rawImageUrl;
    }

    // ── 10. Deduct credit (only after successful generation) ────────────────
    await deductCredits(user.id, 'portrait', finalImageUrl, resolvedTemplateId);

    // ── 11. Return ───────────────────────────────────────────────────────────
    const creditsRemaining = await getCreditsRemaining(user.id);

    return NextResponse.json({
      imageUrl: finalImageUrl,
      creditsRemaining,
    });

  } catch (err: any) {
    console.error('[portrait/route] unhandled error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Portrait generation failed' },
      { status: 500 },
    );
  }
}
