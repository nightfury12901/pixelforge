import { Sparkles } from 'lucide-react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import Link from 'next/link';

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center bg-[#09090b] overflow-hidden">
            {/* Background Gradients & Animated Orbs */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(167,139,250,0.15)_0%,transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(232,121,249,0.1)_0%,transparent_50%)] pointer-events-none" />

            {/* Floating Orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] animate-pulse-glow pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />

            <div className="container mx-auto px-4 py-16 flex flex-col lg:flex-row items-center gap-16 relative z-10">

                {/* ── Left: Text ── */}
                <div className="flex-1 max-w-2xl animate-fadeInUp">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-8 hover:bg-white/10 transition-colors cursor-pointer">
                        <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
                        ✦ AI Portrait Studio for Indian Creators
                    </div>

                    <h1 className="text-6xl md:text-[80px] font-bold text-white leading-[1.05] mb-6 tracking-tight font-display">
                        Turn Any Selfie Into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 block mt-2 animate-pulse-glow">Stunning AI Portrait</span>
                    </h1>

                    <p className="text-xl text-white/60 mb-10 max-w-xl leading-relaxed">
                        Pick from 25+ trending styles — Bollywood, Professional, Artistic & more. Download in seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-12">
                        <Link href="/auth/signup" className="flex-1 sm:flex-none">
                            <button className="w-full h-14 px-8 rounded-xl text-black bg-white hover:bg-white/90 font-semibold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                <Sparkles className="h-5 w-5" />
                                Get Started Free
                            </button>
                        </Link>
                        <Link href="/pricing" className="flex-1 sm:flex-none">
                            <button className="w-full h-14 px-8 rounded-xl text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 font-medium transition-all hover:scale-105 active:scale-95 flex items-center justify-center text-lg">
                                View Pricing
                            </button>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6 text-sm font-medium text-white/50">
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-lg hover:bg-white/10 transition-colors cursor-default">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                            25+ Styles
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-lg hover:bg-white/10 transition-colors cursor-default">
                            <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
                            HD Quality
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-lg hover:bg-white/10 transition-colors cursor-default">
                            <span>🇮🇳</span>
                            Made for India
                        </div>
                    </div>
                </div>

                {/* ── Right: Image Slider ── */}
                <div className="flex-1 w-full max-w-xl relative animate-fadeInUp lg:animate-none" style={{ animationDelay: '0.2s' }}>
                    <div className="absolute -inset-4 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-3xl blur-[80px] opacity-20 animate-pulse-glow" />

                    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0E0E12] shadow-2xl animate-float">
                        <div className="absolute top-4 right-4 z-20 flex gap-2 pointer-events-none">
                            <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white/90 border border-white/10 shadow-lg">
                                Before
                            </div>
                            <div className="bg-violet-500/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white border border-violet-400/30 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                                AuraShot Result
                            </div>
                        </div>

                        <ReactCompareSlider
                            boundsPadding={0}
                            itemOne={<ReactCompareSliderImage src="/before.jpeg" alt="Your Selfie" className="w-full h-full object-cover object-top" />}
                            itemTwo={<ReactCompareSliderImage src="/after.jpeg" alt="AuraShot Result" className="w-full h-full object-cover object-top" />}
                            position={50}
                            style={{ width: '100%', height: '100%', minHeight: '500px' }}
                            className="w-full aspect-[3/4] sm:aspect-[4/5]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
