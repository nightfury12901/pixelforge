import { createAdminClient } from './supabase/server';
import { OPERATION_COSTS } from './constants';

// Use admin client for all credit operations so they work with both
// cookie auth (browser) and Bearer token auth (Postman/API calls)
function getDb() {
  return createAdminClient() as any;
}

export async function checkCredits(
  userId: string
): Promise<{ hasCredits: boolean; remaining: number; tier: string }> {
  const db = getDb();

  const { data: profile, error } = await db
    .from('profiles')
    .select('credits_remaining, tier')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error('checkCredits error:', error?.message, 'userId:', userId);
    return { hasCredits: false, remaining: 0, tier: 'free' };
  }

  return {
    hasCredits: profile.credits_remaining > 0,
    remaining: profile.credits_remaining,
    tier: profile.tier,
  };
}

export async function deductCredits(
  userId: string,
  operation: keyof typeof OPERATION_COSTS,
  templateId?: string
): Promise<{ success: boolean; remaining: number; error?: string }> {
  const db = getDb();

  const creditsToDeduct = OPERATION_COSTS[operation];

  const { data: profile, error: fetchError } = await db
    .from('profiles')
    .select('credits_remaining, tier')
    .eq('id', userId)
    .single();

  if (fetchError || !profile) {
    return { success: false, remaining: 0, error: 'Profile not found' };
  }

  if (profile.credits_remaining < creditsToDeduct) {
    return {
      success: false,
      remaining: profile.credits_remaining,
      error: 'Insufficient credits',
    };
  }

  const { error: updateError } = await db
    .from('profiles')
    .update({ credits_remaining: profile.credits_remaining - creditsToDeduct })
    .eq('id', userId);

  if (updateError) {
    return { success: false, remaining: profile.credits_remaining, error: updateError.message };
  }

  // Log transaction (best-effort, don't fail if table missing)
  try {
    await db.from('credit_transactions').insert({
      user_id: userId,
      credits_used: creditsToDeduct,
      operation_type: operation,
      template_id: templateId,
    });
  } catch (_) { }

  return {
    success: true,
    remaining: profile.credits_remaining - creditsToDeduct,
  };
}

export async function addCredits(
  userId: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  const db = getDb();

  const { data: profile } = await db
    .from('profiles')
    .select('credits_remaining')
    .eq('id', userId)
    .single();

  if (!profile) return { success: false, error: 'Profile not found' };

  const { error } = await db
    .from('profiles')
    .update({ credits_remaining: profile.credits_remaining + amount })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function resetCreditsForTier(
  userId: string,
  tier: 'free' | 'starter' | 'pro' | 'lifetime'
): Promise<{ success: boolean; error?: string }> {
  const db = getDb();

  const creditAmounts = { free: 2, starter: 50, pro: 200, lifetime: 100 };

  const { error } = await db
    .from('profiles')
    .update({
      credits_remaining: creditAmounts[tier],
      credits_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export function canAccessTemplate(userTier: string, templateTier: string): boolean {
  const tierHierarchy: Record<string, number> = {
    free: 0,
    starter: 1,
    pro: 2,
    lifetime: 2,
  };

  return tierHierarchy[userTier] >= tierHierarchy[templateTier];
}
