'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

const stats = [
    { value: '10K+', label: 'Creators' },
    { value: '25+', label: 'AI Styles' },
    { value: '4K', label: 'Quality' },
    { value: '4.8★', label: 'Rating' },
];

const tools = [
    { label: 'AI Portraits', color: '#8b5cf6' },
    { label: 'BG Remove', color: '#22c55e' },
    { label: 'Enhance 4K', color: '#3b82f6' },
    { label: 'Prompt Extract', color: '#f97316' },
];

export function Hero() {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-studio-bg">
            {/* Ambient orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="orb w-[600px] h-[600px] -top-32 -left-32 bg-violet-600/10" />
                <div className="orb w-[500px] h-[500px] top-1/2 -right-32 bg-blue-600/8" />
                <div className="orb w-[400px] h-[400px] bottom-0 left-1/3 bg-pink-600/6" />
                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <div className="container mx-auto px-4 py-24 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Creative Studio for Indian Creators
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-white leading-[1.08] mb-6 tracking-tight"
                    >
                        Create Viral{' '}
                        <span className="text-gradient">AI Portraits</span>
                        <br />in Seconds
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Transform your selfies into stunning AI portraits with 25+ Instagram-trending styles.
                        Background remover, 4K enhancer & prompt extractor included.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
                    >
                        <Link href="/auth/signup">
                            <button
                                className="group h-13 px-8 py-3.5 rounded-2xl text-white font-semibold text-base flex items-center gap-2 transition-all duration-200"
                                style={{
                                    background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                                    boxShadow: '0 0 30px rgba(139,92,246,0.4)',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 40px rgba(139,92,246,0.6)')}
                                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 30px rgba(139,92,246,0.4)')}
                            >
                                <Sparkles className="h-4 w-4" />
                                Start Creating Free
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </Link>
                        <Link href="/pricing">
                            <button className="h-13 px-8 py-3.5 rounded-2xl text-white/60 font-medium text-base flex items-center gap-2 border border-white/[0.08] hover:border-white/[0.15] hover:text-white/80 hover:bg-white/[0.04] transition-all duration-200">
                                View Pricing
                            </button>
                        </Link>
                    </motion.div>

                    {/* Tool pills */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap items-center justify-center gap-2 mb-14"
                    >
                        {tools.map((tool) => (
                            <div
                                key={tool.label}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                                style={{
                                    background: `${tool.color}10`,
                                    borderColor: `${tool.color}25`,
                                    color: tool.color,
                                }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: tool.color }} />
                                {tool.label}
                            </div>
                        ))}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/[0.08] text-white/30">
                            <Shield className="h-3 w-3" />
                            Free Chrome Extension
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-4 gap-4 max-w-lg mx-auto"
                    >
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                                <div className="text-xs text-white/30">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Preview mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="mt-20 max-w-5xl mx-auto"
                >
                    <div
                        className="rounded-2xl overflow-hidden border border-white/[0.08]"
                        style={{ boxShadow: '0 0 80px rgba(139,92,246,0.15), 0 40px 80px rgba(0,0,0,0.6)' }}
                    >
                        {/* Fake browser bar */}
                        <div className="bg-studio-surface border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                                <div className="w-3 h-3 rounded-full bg-green-500/40" />
                            </div>
                            <div className="flex-1 bg-white/[0.04] rounded-lg px-3 py-1 text-xs text-white/20 text-center">
                                pixelforge.ai/dashboard
                            </div>
                        </div>
                        {/* Studio preview */}
                        <div className="bg-studio-bg p-6 flex gap-4 min-h-[280px]">
                            {/* Fake sidebar */}
                            <div className="w-14 bg-studio-surface rounded-xl border border-white/[0.06] flex flex-col items-center py-4 gap-3">
                                {[
                                    { color: '#8b5cf6' }, { color: '#3b82f6' }, { color: '#22c55e' }, { color: '#f97316' }
                                ].map((t, i) => (
                                    <div key={i} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${t.color}15`, border: `1px solid ${t.color}25` }}>
                                        <div className="w-3 h-3 rounded-sm" style={{ background: t.color, opacity: 0.6 }} />
                                    </div>
                                ))}
                            </div>
                            {/* Fake canvas */}
                            <div className="flex-1 rounded-xl border border-white/[0.06] bg-[#0A0A0F] flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
                                <div className="text-center relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-3">
                                        <Sparkles className="h-7 w-7 text-violet-400/60" />
                                    </div>
                                    <p className="text-white/30 text-sm">Your canvas awaits</p>
                                </div>
                            </div>
                            {/* Fake controls */}
                            <div className="w-48 bg-studio-surface rounded-xl border border-white/[0.06] p-4 space-y-3">
                                {[80, 60, 45, 90].map((w, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="h-2 rounded bg-white/[0.06]" style={{ width: `${w}%` }} />
                                        <div className="h-1.5 rounded-full bg-white/[0.04]">
                                            <div className="h-full rounded-full bg-violet-500/40" style={{ width: `${w - 20}%` }} />
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-4 h-9 rounded-xl bg-violet-600/30 border border-violet-500/20" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
