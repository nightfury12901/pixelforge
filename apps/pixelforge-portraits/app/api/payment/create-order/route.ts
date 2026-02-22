import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { createOrder } from '@/lib/razorpay';
import { PRICING_TIERS } from '@/lib/constants';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { tier_id, promoCode } = body;

    if (!tier_id || tier_id === 'free') {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const tier = PRICING_TIERS.find((t) => t.id === tier_id);
    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    // Apply Promo Code PIXEL100 -> 100% Discount logic
    if (promoCode && promoCode.toUpperCase() === 'PIXEL100') {
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('credits_remaining')
        .eq('id', user.id)
        .single();

      const newCredits = (profile?.credits_remaining || 0) + tier.credits;

      await (adminSupabase as any)
        .from('profiles')
        .update({
          credits_remaining: newCredits,
          tier: tier.id === 'pro' ? 'pro' : (tier.id === 'creator' ? 'pro' : 'free') // If they got a paid pack free, bump tier
        })
        .eq('id', user.id);

      // Record the transaction
      await (adminSupabase as any).from('transactions').insert({
        user_id: user.id,
        amount: 0,
        currency: 'INR',
        tier: tier.id,
        status: 'completed',
        razorpay_payment_id: 'PROMO_PIXEL100'
      });

      return NextResponse.json({
        success: true,
        data: {
          type: 'free_claim',
          message: 'Promo code applied successfully!'
        }
      });
    }

    // Create Razorpay order
    const orderResult = await createOrder(tier.price, 'INR', {
      user_id: user.id,
      tier: tier_id,
    });

    if (!orderResult.success) {
      return NextResponse.json({ error: orderResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        type: 'order',
        order: orderResult.order,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
