import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTA() {
    return (
        <section className="py-24 bg-[#0E0E12] relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="container mx-auto px-4">
                <div
                    className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border border-violet-500/20 text-center px-8 py-16 md:px-16 md:py-20"
                    style={{
                        background: 'linear-gradient(135deg, rgba(109,40,217,0.3) 0%, rgba(139,92,246,0.15) 50%, rgba(59,130,246,0.15) 100%)',
                        boxShadow: '0 0 60px rgba(139,92,246,0.2)',
                    }}
                >
                    {/* Orbs */}
                    <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="h-6 w-6 text-violet-400" />
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                            Ready to Go Viral?
                        </h2>
                        <p className="text-lg text-white/50 max-w-xl mx-auto mb-8">
                            Join 10,000+ Indian creators making stunning AI portraits.
                            Start with 2 free credits — no credit card needed.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/auth/signup">
                                <button
                                    className="h-13 px-8 py-3.5 rounded-2xl text-white font-semibold text-base flex items-center gap-2 transition-all duration-200"
                                    style={{
                                        background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                                        boxShadow: '0 0 30px rgba(139,92,246,0.5)',
                                    }}
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Start Creating Free
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </Link>
                            <Link href="/pricing">
                                <button className="h-13 px-8 py-3.5 rounded-2xl text-white/60 font-medium text-base border border-white/[0.12] hover:border-white/[0.2] hover:text-white/80 hover:bg-white/[0.04] transition-all duration-200">
                                    Compare Plans
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
