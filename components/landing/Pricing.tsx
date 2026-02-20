import Link from 'next/link';
import { Check, Crown } from 'lucide-react';
import { PRICING_TIERS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-[#0A0A0F] relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="container mx-auto px-4">
                <div className="text-center mb-14">
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Pricing</span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-white">Simple, Transparent Pricing</h2>
                    <p className="text-lg text-white/40 max-w-2xl mx-auto">
                        Start free. Upgrade when you need more. Cancel anytime.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
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

                            <Link href={tier.id === 'free' ? '/auth/signup' : '/pricing'}>
                                <button
                                    className={cn(
                                        'w-full rounded-xl h-10 text-sm font-semibold transition-all duration-200',
                                        tier.popular
                                            ? 'bg-violet-600 hover:bg-violet-500 text-white'
                                            : 'bg-white/[0.06] hover:bg-white/[0.10] text-white/70 border border-white/[0.08]'
                                    )}
                                    style={tier.popular ? { boxShadow: '0 0 16px rgba(139,92,246,0.3)' } : {}}
                                >
                                    {tier.id === 'free' ? 'Get Started' : 'Subscribe'}
                                    {tier.id === 'lifetime' && <Crown className="inline ml-1.5 h-3.5 w-3.5" />}
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
