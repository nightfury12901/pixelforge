/**
 * lib/credits.ts
 *
 * Dynamic credit enforcement — counts from `generations` table rows.
 * NO credits_remaining column. Usage is counted live.
 *
 * Cost reference ($1 = ₹92):
 *   portrait        $0.10 = ₹9.20  (ideogram/character/edit)
 *   enhance               = ₹0.41  (esrgan ~4s avg)
 *   bg_remove       $0.018= ₹1.66  (bria)
 *   beautify              = ₹0.31  (gfpgan ~3s avg)
 *   prompt_reversal $0.001= ₹0.09  (gpt-4o-mini vision)
 */

import { createClient } from '@supabase/supabase-js';

// ─── Admin client ─────────────────────────────────────────────────────────────

function getAdminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type OperationType =
  | 'portrait'
  | 'enhance'
  | 'bg_remove'
  | 'background_remove'   // alias used by older routes
  | 'beautify'
  | 'prompt_reversal'
  | 'image_gen';

export type Tier = 'free' | 'starter' | 'creator' | 'pro';

/** Returned by checkCredits() — includes both new and legacy field names. */
export interface CreditStatus {
  allowed: boolean;
  hasCredits: boolean;    // alias for `allowed` — kept for backward compat
  used: number;
  limit: number;
  remaining: number;      // limit - used
}

export type CreditsSummary = Record<OperationType, CreditStatus>;

// ─── Tier caps ────────────────────────────────────────────────────────────────

export const TIER_CAPS: Record<Tier, Record<OperationType, number>> = {
  free: {
    portrait: 3,   // lifetime
    enhance: 0,
    bg_remove: 0,
    background_remove: 0,
    beautify: 0,
    prompt_reversal: 10,  // per day (midnight IST reset)
    image_gen: 0,   // free feature — uncapped, checked separately
  },
  starter: {
    portrait: 5,
    enhance: 5,
    bg_remove: 10,
    background_remove: 10,
    beautify: 0,
    prompt_reversal: 20,
    image_gen: 0,
  },
  creator: {
    portrait: 15,
    enhance: 15,
    bg_remove: 25,
    background_remove: 25,
    beautify: 10,
    prompt_reversal: 50,
    image_gen: 0,
  },
  pro: {
    portrait: 40,
    enhance: 40,
    bg_remove: 60,
    background_remove: 60,
    beautify: 30,
    prompt_reversal: 100,
    image_gen: 0,
  },
};

// ─── Date helpers ──────────────────────────────────────────────────────────────

/** Midnight IST = yesterday 18:30 UTC (UTC+5:30 → subtract 5h30m). */
function getMidnightIST(): Date {
  const now = new Date();
  const d = new Date(now);
  d.setUTCHours(18, 30, 0, 0);
  if (d > now) d.setUTCDate(d.getUTCDate() - 1);
  return d;
}

/** Normalise bg_remove → background_remove for DB queries. (Live DB constraint) */
function normaliseOp(op: OperationType): string {
  return op === 'bg_remove' ? 'background_remove' : op;
}

// ─── checkCredits ─────────────────────────────────────────────────────────────

/**
 * Check credits for a specific operation.
 * @param userId       Auth user id
 * @param operationType  Which operation to check
 */
export async function checkCredits(
  userId: string,
  operationType: OperationType,
): Promise<CreditStatus>;

/**
 * Check credits for ALL operations at once.
 * @param userId  Auth user id (no second arg)
 */
export async function checkCredits(userId: string): Promise<CreditsSummary>;

// Implementation
export async function checkCredits(
  userId: string,
  operationType?: OperationType,
): Promise<CreditStatus | CreditsSummary> {
  if (!operationType) {
    // Return summary for all ops
    const ops: OperationType[] = [
      'portrait', 'enhance', 'bg_remove', 'beautify', 'prompt_reversal', 'image_gen',
    ];
    const results = await Promise.all(ops.map((op) => _checkSingle(userId, op)));
    const summary: Partial<CreditsSummary> = {};
    ops.forEach((op, i) => { summary[op] = results[i]; });
    // Also expose background_remove as alias
    summary['background_remove'] = summary['bg_remove']!;
    return summary as CreditsSummary;
  }
  return _checkSingle(userId, operationType);
}

async function _checkSingle(userId: string, operationType: OperationType): Promise<CreditStatus> {
  const db = getAdminDb();

  const { data: profile, error } = await db
    .from('profiles')
    .select('tier, credits_reset_date, created_at')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return { allowed: false, hasCredits: false, used: 0, limit: 0, remaining: 0 };
  }

  const tier = (profile.tier ?? 'free') as Tier;
  const limit = TIER_CAPS[tier][operationType] ?? 0;

  // image_gen is free/uncapped — always allowed
  if (operationType === 'image_gen') {
    return { allowed: true, hasCredits: true, used: 0, limit: 999, remaining: 999 };
  }

  if (limit === 0) {
    return { allowed: false, hasCredits: false, used: 0, limit: 0, remaining: 0 };
  }

  // Determine counting window
  let since: string;
  if (operationType === 'portrait' && tier === 'free') {
    since = profile.created_at as string;
  } else if (operationType === 'prompt_reversal') {
    since = getMidnightIST().toISOString();
  } else {
    since = profile.credits_reset_date as string;
  }

  const dbOp = normaliseOp(operationType);

  const { count } = await db
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('operation_type', dbOp)
    .gte('created_at', since);

  const used = count ?? 0;
  const remaining = Math.max(0, limit - used);
  const allowed = remaining > 0;

  return { allowed, hasCredits: allowed, used, limit, remaining };
}

// ─── deductCredits ────────────────────────────────────────────────────────────

/**
 * Records a successful generation in the `generations` table.
 * Call ONLY after the AI model has returned a result.
 *
 * @returns { success, remaining?, error? }
 */
export async function deductCredits(
  userId: string,
  operationType: OperationType,
  outputUrl?: string,      // Save the generated image URL for history
  templateId?: string,
): Promise<{ success: boolean; remaining?: number; error?: string }> {
  const db = getAdminDb();
  const dbOp = normaliseOp(operationType);

  const { error } = await db.from('generations').insert({
    user_id: userId,
    operation_type: dbOp,
    template_id: templateId ?? null,
    output_image_url: outputUrl ?? null,
  });

  if (error) {
    console.error('deductCredits: insert error', error.message);
    return { success: false, error: error.message };
  }

  const status = await _checkSingle(userId, operationType);
  return { success: true, remaining: status.remaining };
}

// ─── getCreditsRemaining ──────────────────────────────────────────────────────

export async function getCreditsRemaining(userId: string): Promise<CreditsSummary> {
  return checkCredits(userId) as Promise<CreditsSummary>;
}

// ─── resetCreditsForTier ──────────────────────────────────────────────────────

export async function resetCreditsForTier(userId: string, tier: string): Promise<void> {
  const db = getAdminDb();
  await db
    .from('profiles')
    .update({ tier, credits_reset_date: new Date().toISOString() })
    .eq('id', userId);
}

// ─── canAccessTemplate ────────────────────────────────────────────────────────

export function canAccessTemplate(userTier: string, templateTier: string): boolean {
  const hierarchy: Record<string, number> = {
    free: 0, starter: 1, creator: 2, pro: 3,
  };
  return (hierarchy[userTier] ?? 0) >= (hierarchy[templateTier] ?? 0);
}
