import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const adminSupabase = createAdminClient();

    // Handle different webhook events
    switch (event.event) {
      case 'subscription.charged':
        // Subscription payment successful
        const subscriptionId = event.payload.subscription.entity.id;
        const paymentId = event.payload.payment.entity.id;
        const amount = event.payload.payment.entity.amount;

        // Update payment record
        await (adminSupabase as any)
          .from('payments')
          .update({ amount: amount / 100, status: 'completed' })
          .eq('razorpay_subscription_id', subscriptionId);

        break;

      case 'subscription.cancelled':
        // Subscription cancelled
        const cancelledSubId = event.payload.subscription.entity.id;

        await (adminSupabase as any)
          .from('profiles')
          .update({ subscription_status: 'cancelled' })
          .eq('razorpay_subscription_id', cancelledSubId);

        break;

      case 'payment.failed':
        // Payment failed
        const failedPaymentId = event.payload.payment.entity.id;

        await (adminSupabase as any)
          .from('payments')
          .update({ status: 'failed' })
          .eq('razorpay_payment_id', failedPaymentId);

        break;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
