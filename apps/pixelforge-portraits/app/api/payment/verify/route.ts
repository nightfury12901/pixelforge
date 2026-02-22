import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { resetCreditsForTier } from '@/lib/credits';

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
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      tier,
      type,
    } = body;

    if (type !== 'order') {
      return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 });
    }

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Update user profile
    await (adminSupabase as any)
      .from('profiles')
      .update({
        tier,
      })
      .eq('id', user.id);

    // Reset credits for new tier
    await resetCreditsForTier(user.id, tier);

    // Record payment
    await (adminSupabase as any).from('payments').insert({
      user_id: user.id,
      razorpay_payment_id,
      razorpay_order_id,
      amount: 0, // We'll update this from webhook
      currency: 'INR',
      status: 'completed',
      tier,
      payment_type: 'one_time',
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
