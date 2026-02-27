/**
 * app/api/payment/webhook/route.ts
 *
 * Razorpay webhook handler for AuraShot one-time payment tiers.
 *
 * Razorpay paise → tier mapping:
 *   14900 → starter  (₹149)
 *   29900 → creator  (₹299)
 *   79900 → pro      (₹799)
 *
 * On payment.captured:
 *   1. Verify HMAC-SHA256 signature
 *   2. Derive tier from payment amount
 *   3. Update profiles: tier + credits_reset_date = now()
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

type Tier = 'starter' | 'creator' | 'pro';

const AMOUNT_TO_TIER: Record<number, Tier> = {
  14900: 'starter',
  29900: 'creator',
  79900: 'pro',
};

function getAdminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // ── Verify HMAC-SHA256 signature ─────────────────────────────────────────
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[webhook] RAZORPAY_WEBHOOK_SECRET not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('[webhook] Signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      payload: {
        payment: {
          entity: {
            id: string;
            order_id: string;
            amount: number;
            notes?: { userId?: string };
          };
        };
      };
    };

    // ── Handle payment.captured only ─────────────────────────────────────────
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload.payment.entity;
      const amount = payment.amount;  // in paise
      const orderId = payment.order_id;

      const newTier = AMOUNT_TO_TIER[amount];
      if (!newTier) {
        console.error(`[webhook] Unknown payment amount: ${amount} paise`);
        return NextResponse.json({ error: 'Unknown payment amount' }, { status: 400 });
      }

      const db = getAdminDb();

      // Resolve userId from order notes (set at order creation time)
      const userId: string | undefined = payment.notes?.userId;

      if (!userId) {
        // Fallback: look up by order_id in a payments table if it exists
        const { data: paymentRow } = await db
          .from('payments')
          .select('user_id')
          .eq('razorpay_order_id', orderId)
          .maybeSingle();

        if (!paymentRow?.user_id) {
          console.error(`[webhook] Cannot resolve userId for order ${orderId}`);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await upgradeProfile(db, paymentRow.user_id as string, newTier, payment.id, orderId);
      } else {
        await upgradeProfile(db, userId, newTier, payment.id, orderId);
      }
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('[webhook] Unhandled error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Webhook processing failed' },
      { status: 500 },
    );
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function upgradeProfile(
  db: ReturnType<typeof getAdminDb>,
  userId: string,
  tier: Tier,
  paymentId: string,
  orderId: string,
): Promise<void> {
  const now = new Date().toISOString();

  const { error } = await db
    .from('profiles')
    .update({ tier, credits_reset_date: now })
    .eq('id', userId);

  if (error) {
    throw new Error(`Profile update failed: ${error.message}`);
  }

  // Optional: mark payment as completed if payments table exists
  await db
    .from('payments')
    .update({ status: 'completed', razorpay_payment_id: paymentId })
    .eq('razorpay_order_id', orderId);

  console.log(`[webhook] User ${userId} upgraded to ${tier} (payment ${paymentId})`);
}
