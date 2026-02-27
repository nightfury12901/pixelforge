'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
    {
        q: 'How does AuraShot work?',
        a: 'Upload any selfie or portrait photo, choose from 25+ AI styles, and our AI generates a stunning portrait in under 30 seconds.',
    },
    {
        q: 'Is my data safe?',
        a: 'Absolutely. Your photos are encrypted in transit and at rest. We never share your images with third parties. Processed images are automatically deleted after 24 hours.',
    },
    {
        q: 'What is the Chrome extension?',
        a: 'Our free Chrome extension lets you extract AI prompts from any image on the web. Right-click any image and get the AI prompt that could recreate it.',
    },
    {
        q: 'Can I use the portraits commercially?',
        a: 'Yes! All portraits generated with Starter, Pro, or Lifetime plans can be used commercially — on social media, marketing materials, business profiles, and more.',
    },
    {
        q: 'What happens when I run out of credits?',
        a: 'Free users get 2 credits per month. Upgrade to Starter (50/month) or Pro (200/month). Credits reset monthly. Lifetime plan gives 100 credits/month forever.',
    },
    {
        q: 'Do you support UPI and Indian payment methods?',
        a: 'Yes! We use Razorpay which supports UPI, debit/credit cards, net banking, and all major Indian payment methods. All prices are in INR.',
    },
    {
        q: 'Can I cancel my subscription anytime?',
        a: "Yes, cancel anytime from your dashboard settings. You'll continue to have access until the end of your billing period.",
    },
];

export function FAQ() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section id="faq" className="py-24 bg-[#0E0E12] relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="container mx-auto px-4">
                <div className="text-center mb-14">
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">FAQ</span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-white">Frequently Asked Questions</h2>
                </div>

                <div className="max-w-2xl mx-auto space-y-2">
                    {faqs.map((faq, i) => (
                        <div key={i}>
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                className={cn(
                                    'w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-150',
                                    open === i
                                        ? 'bg-violet-500/10 border border-violet-500/20'
                                        : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]'
                                )}
                            >
                                <span className="font-medium text-white/80 pr-4 text-sm">{faq.q}</span>
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 text-white/30 shrink-0 transition-transform duration-150',
                                        open === i && 'rotate-180 text-violet-400'
                                    )}
                                />
                            </button>
                            {open === i && (
                                <div className="px-4 py-3 text-white/40 text-sm leading-relaxed border-x border-b border-violet-500/10 rounded-b-xl bg-violet-500/[0.03]">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
