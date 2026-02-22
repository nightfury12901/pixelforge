import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface CreateSubscriptionOptions {
  plan_id: string;
  customer_notify: number;
  total_count: number;
  notes?: Record<string, string>;
}

export async function createSubscription(
  options: CreateSubscriptionOptions
): Promise<{ success: boolean; subscription?: any; error?: string }> {
  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: options.plan_id,
      customer_notify: options.customer_notify as any,
      total_count: options.total_count,
      notes: options.notes,
    });

    return { success: true, subscription };
  } catch (error: any) {
    console.error('Razorpay subscription creation error:', error);
    return { success: false, error: error.message };
  }
}

export async function createOrder(
  amount: number,
  currency: string = 'INR',
  notes?: Record<string, string>
): Promise<{ success: boolean; order?: any; error?: string }> {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      notes,
    });

    return { success: true, order };
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return { success: false, error: error.message };
  }
}

export function verifyPaymentSignature(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): boolean {
  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === razorpay_signature;
}

export function verifySubscriptionSignature(
  razorpay_subscription_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): boolean {
  const body = razorpay_payment_id + '|' + razorpay_subscription_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === razorpay_signature;
}

export async function cancelSubscription(
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await razorpay.subscriptions.cancel(subscriptionId);
    return { success: true };
  } catch (error: any) {
    console.error('Razorpay subscription cancellation error:', error);
    return { success: false, error: error.message };
  }
}
