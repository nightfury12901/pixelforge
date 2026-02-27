'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Crown, Loader2 } from 'lucide-react';
import { PRICING_TIERS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import toast from 'react-hot-toast';

export function Pricing() {
    const [loading, setLoading] = useState<string | null>(null);
    const [promoCode, setPromoCode] = useState('');
    const router = useRouter();

    const handleSubscribe = async (tier: any) => {
        try {
            setLoading(tier.id);
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast('Please sign in to purchase.', { icon: '🔒' });
                router.push('/auth/signup?next=/pricing');
                return;
            }

            const res = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier_id: tier.id, promoCode }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to initialize checkout');

            if (data.data.type === 'free_claim') {
                toast.success(data.data.message || 'Pack unlocked for free!');
                router.push('/dashboard/portraits');
                router.refresh();
                return;
            }

            const order = data.data.order;
            const key = data.data.key;

            const options = {
                key,
                amount: order.amount,
                currency: order.currency,
                name: 'AuraShot',
                description: `Purchase ${tier.name}`,
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        toast.loading('Verifying payment...', { id: 'verify' });
                        const verifyRes = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                tier: tier.id,
                                type: 'order'
                            })
                        });

                        const verifyData = await verifyRes.json();
                        if (!verifyRes.ok) throw new Error(verifyData.error || 'Verification failed');

                        toast.success('Payment successful! Credits added.', { id: 'verify' });
                        router.push('/dashboard/portraits');
                        router.refresh();
                    } catch (err: any) {
                        console.error('Verify error', err);
                        toast.error(err.message || 'Payment verification failed', { id: 'verify' });
                    }
                },
                theme: {
                    color: '#8b5cf6'
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast.error(response.error.description);
            });
            rzp.open();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Check out error');
        } finally {
            setLoading(null);
        }
    };
    return (
        <section id="pricing" className="py-24 bg-[#0A0A0F] relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="container mx-auto px-4">
                <div className="text-center mb-14">
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Pricing</span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-white">Simple, Transparent Pricing</h2>
                    <p className="text-lg text-white/40 max-w-2xl mx-auto mb-8">
                        Start free. Upgrade when you need more. Cancel anytime.
                    </p>

                    <div className="max-w-xs mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Promo code (optional)"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                            />
                            {promoCode === 'PIXEL100' && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded uppercase">
                                    Free Pack Applied
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {PRICING_TIERS.map((tier) => (
                        <div
                            key={tier.id}
                            className={cn(
                                'relative rounded-2xl p-5 border transition-all duration-200',
                                tier.popular
                                    ? 'border-violet-500/40 bg-gradient-to-b from-violet-500/10 to-violet-500/[0.03]'
                                    : 'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05]'
                            )}
                            style={tier.popular ? { boxShadow: '0 0 30px rgba(139,92,246,0.15)' } : {}}
                        >
                            {tier.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-5">
                                <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
                                <p className="text-xs text-white/40 mb-4">{tier.description}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">
                                        {tier.price === 0 ? 'Free' : `₹${tier.price}`}
                                    </span>
                                    {tier.interval && tier.interval !== 'one-time' && (
                                        <span className="text-white/30 text-sm">/{tier.interval}</span>
                                    )}
                                    {tier.interval === 'one-time' && (
                                        <span className="text-white/30 text-xs">one-time</span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-2.5 mb-6">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-xs">
                                        <Check className="h-3.5 w-3.5 text-violet-400 mt-0.5 shrink-0" />
                                        <span className="text-white/60">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe(tier)}
                                disabled={loading === tier.id}
                                className={cn(
                                    'w-full rounded-xl h-10 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2',
                                    tier.popular
                                        ? 'bg-violet-600 hover:bg-violet-500 text-white'
                                        : 'bg-white/[0.06] hover:bg-white/[0.10] text-white/70 border border-white/[0.08]'
                                )}
                                style={tier.popular ? { boxShadow: '0 0 16px rgba(139,92,246,0.3)' } : {}}
                            >
                                {loading === tier.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-white/70" />
                                ) : (
                                    <>
                                        {'Buy Pack'}
                                        {tier.id === 'pro' && <Crown className="h-3.5 w-3.5" />}
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
