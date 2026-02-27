import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTA() {
    return (
        <section className="py-24 bg-[#09090b] relative border-t border-white/5">
            <div className="container mx-auto px-4">
                <div
                    className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden bg-[#121214] border border-white/10 text-center px-8 py-16 md:px-16 md:py-20 animate-fadeInUp"
                >
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-display tracking-tight">
                            Your Best Portrait is One Click Away
                        </h2>
                        <p className="text-lg text-white/50 max-w-xl mx-auto mb-8 leading-relaxed">
                            Join thousands of Indian creators already using AuraShot.
                        </p>

                        <div className="flex justify-center">
                            <Link href="/auth/signup">
                                <button className="h-14 px-10 rounded-xl text-black bg-white hover:bg-white/90 font-semibold transition-colors flex items-center gap-2 text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    <Sparkles className="h-5 w-5" />
                                    Create My Portrait Free <span aria-hidden="true">&rarr;</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
