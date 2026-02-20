import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSubscription, createOrder } from '@/lib/razorpay';
import { PRICING_TIERS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tier_id } = body;

    if (!tier_id || tier_id === 'free') {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const tier = PRICING_TIERS.find((t) => t.id === tier_id);
    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    // Create Razorpay order or subscription
    if (tier.interval === 'one-time') {
      // Lifetime - create order
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
    } else {
      // Subscription
      const subscriptionResult = await createSubscription({
        plan_id: tier.razorpay_plan_id!,
        customer_notify: 1,
        total_count: 12, // 12 months
        notes: {
          user_id: user.id,
          tier: tier_id,
        },
      });

      if (!subscriptionResult.success) {
        return NextResponse.json({ error: subscriptionResult.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: {
          type: 'subscription',
          subscription: subscriptionResult.subscription,
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        },
      });
    }
  } catch (error: any) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
