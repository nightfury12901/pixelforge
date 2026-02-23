'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { Sparkles, Wand2, Eraser, ScanSearch, Zap, TrendingUp, Clock, ImagePlus, Video } from 'lucide-react';
import Link from 'next/link';



export default function DashboardPage() {
    const [profile, setProfile] = useState<any>(null);
    const [recentCount, setRecentCount] = useState(0);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data) setProfile(data);
            const { count } = await supabase.from('generations').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
            setRecentCount(count || 0);
        }
        load();
    }, []);

    return (
        <div className="min-h-screen p-6 md:p-8 pb-24 md:pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {profile?.full_name ? `Hey, ${profile.full_name.split(' ')[0]} 👋` : 'Your Studio'}
                        </h1>
                        <p className="text-white/40 text-sm mt-0.5">What will you create today?</p>
                    </div>
                    {/* Stats row */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="glass-sm px-4 py-2 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-violet-400" />
                            <span className="text-sm font-semibold text-white">{profile?.credits_remaining ?? '—'}</span>
                            <span className="text-xs text-white/40">credits</span>
                        </div>
                        <div className="glass-sm px-4 py-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-400" />
                            <span className="text-sm font-semibold text-white">{recentCount}</span>
                            <span className="text-xs text-white/40">creations</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Premium Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto mt-4">

                {/* 1. AI Portraits (Col 7) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-12 lg:col-span-7 flex">
                    <Link href="/dashboard/portraits" className="w-full">
                        <div className="group relative h-[380px] overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f11] hover:border-blue-500/30 transition-all duration-500 flex flex-col">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="p-8 relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">AI Portraits</h3>
                                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">25+ Styles</span>
                                </div>
                                <p className="text-sm text-white/50 max-w-sm mt-3 leading-relaxed">Create stunning studio-quality portraits using advanced stylized generative models.</p>
                            </div>

                            <div className="mt-auto px-8 flex justify-center items-end gap-3 h-[200px] overflow-hidden relative z-10 w-full">
                                <div className="hidden sm:block w-1/3 h-[85%] rounded-t-xl border border-white/10 overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-500 shadow-xl opacity-80 group-hover:opacity-100 relative">
                                    <div className="absolute inset-0 bg-blue-900/40 mix-blend-overlay z-10"></div>
                                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" alt="Style 1" />
                                </div>
                                <div className="w-full sm:w-1/3 h-full rounded-t-xl border border-white/10 overflow-hidden transform group-hover:-translate-y-4 transition-transform duration-500 shadow-2xl relative z-20">
                                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" alt="Style 2" />
                                </div>
                                <div className="hidden sm:block w-1/3 h-[85%] rounded-t-xl border border-white/10 overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-500 shadow-xl opacity-80 group-hover:opacity-100 relative">
                                    <div className="absolute inset-0 bg-cyan-900/40 mix-blend-overlay z-10"></div>
                                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" alt="Style 3" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* 2. Image Gen (Col 5) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="md:col-span-12 lg:col-span-5 flex">
                    <Link href="/dashboard/image-gen" className="w-full">
                        <div className="group relative h-[380px] overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f11] hover:border-cyan-500/30 transition-all duration-500 flex flex-col">
                            <div className="absolute inset-0 bg-gradient-to-bl from-cyan-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="p-8 relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                        <ImagePlus className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Image Gen</h3>
                                </div>
                                <p className="text-sm text-white/50 max-w-sm mt-3 leading-relaxed">Turn your text prompts into highly detailed, photorealistic images instantly.</p>
                            </div>

                            <div className="mt-auto relative z-10 h-[200px] mx-8 mb-0 rounded-t-2xl border-t border-x border-white/10 overflow-hidden shadow-2xl group-hover:-translate-y-2 transition-transform duration-500">
                                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="AI Gen" />
                                <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md rounded-lg p-3 border border-white/10 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                                    <div className="h-2 w-3/4 bg-white/20 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* 3. AI Enhance (Col 5) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-12 lg:col-span-5 flex">
                    <Link href="/dashboard/enhance" className="w-full">
                        <div className="group relative h-[380px] overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f11] hover:border-indigo-500/30 transition-all duration-500 flex flex-col">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="p-8 relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                        <Wand2 className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">AI Enhance</h3>
                                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400">4K Upscale</span>
                                </div>
                                <p className="text-sm text-white/50 max-w-sm mt-3 leading-relaxed">Instantly restore old photos, remove noise, and upscale to 4K crystalline resolution.</p>
                            </div>

                            <div className="mt-auto px-8 h-[200px] relative z-10 w-full mb-0">
                                <div className="w-full h-full rounded-t-2xl border-t border-x border-white/10 overflow-hidden relative shadow-2xl group-hover:-translate-y-2 transition-transform duration-500 group-hover:shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                                    <img src="https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&w=800&q=80" alt="Upscaled" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 w-1/2 overflow-hidden border-r-2 border-white/50">
                                        <img src="https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&w=800&q=80" alt="Blurry" className="w-full h-full object-cover max-w-[200%] blur-[6px] contrast-75 brightness-75 scale-105" />
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-white/30">
                                        <div className="w-1 h-4 bg-white/70 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* 4. Remove BG (Col 7) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="md:col-span-12 lg:col-span-7 flex">
                    <Link href="/dashboard/background" className="w-full">
                        <div className="group relative h-[380px] overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f11] hover:border-emerald-500/30 transition-all duration-500 flex flex-col md:flex-row">
                            <div className="absolute inset-0 bg-gradient-to-l from-emerald-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="p-8 relative z-10 md:w-[45%] flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <Eraser className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Remove BG</h3>
                                </div>
                                <p className="text-sm text-white/50 mt-3 leading-relaxed">Extract subjects tightly and flawlessly. Say goodbye to manual masking and clipping paths.</p>
                            </div>

                            <div className="md:w-[55%] relative h-[250px] md:h-full flex justify-end items-end md:pr-8 md:pb-0 px-8 pb-8">
                                <div className="hidden sm:block absolute bottom-4 md:bottom-[-20px] right-[20%] w-[60%] md:w-[70%] h-[75%] md:h-[80%] rounded-2xl border border-white/10 overflow-hidden transform group-hover:rotate-6 group-hover:translate-x-6 transition-transform duration-500 opacity-30 group-hover:opacity-50 relative z-10 shadow-xl">
                                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80" alt="Original" className="w-full h-full object-cover" />
                                </div>
                                <div className="w-full sm:w-[80%] md:w-[85%] h-full md:h-[85%] rounded-2xl md:rounded-t-2xl md:rounded-b-none border border-emerald-500/20 bg-[#18181b] overflow-hidden transform group-hover:-translate-y-4 group-hover:-translate-x-4 transition-all duration-500 shadow-2xl relative z-20" style={{ backgroundImage: 'radial-gradient(#3f3f46 1px, transparent 1px)', backgroundSize: '12px 12px' }}>
                                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80" alt="Removed BG" className="w-full h-full object-cover mix-blend-screen opacity-90 brightness-110" />
                                    <div className="absolute top-4 left-4 bg-emerald-500/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-medium shadow-lg">Transparent</div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* 5. Extract Prompt (Col 12) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-12">
                    <Link href="/dashboard/extract" className="block">
                        <div className="group relative h-[280px] sm:h-[180px] overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f11] hover:border-blue-500/30 transition-all duration-500 flex flex-col sm:flex-row items-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="p-8 sm:pr-0 sm:w-1/3 relative z-10 w-full text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <ScanSearch className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Extract Prompt</h3>
                                </div>
                                <p className="text-sm text-white/50 mt-2 max-w-xs mx-auto sm:mx-0 leading-relaxed">Reverse-engineer any image into a highly detailed AI text prompt.</p>
                            </div>

                            <div className="flex-1 relative h-full w-full flex items-center justify-center gap-6 sm:gap-12 px-8 overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-white/10 shrink-0 relative group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-shadow">
                                    <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" alt="Art" />
                                    {/* Scanning line effect */}
                                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,1)] scale-y-[2]"></div>
                                </div>
                                <div className="hidden sm:block flex-1 max-w-sm space-y-3">
                                    <div className="h-2.5 bg-white/10 rounded-full w-full" />
                                    <div className="h-2.5 bg-white/10 rounded-full w-5/6" />
                                    <div className="h-2.5 bg-white/10 rounded-full w-4/6" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>

            </div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 max-w-5xl"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-white/30" />
                    <h2 className="text-sm font-medium text-white/40">Recent Activity</h2>
                </div>
                {recentCount === 0 ? (
                    <div className="glass rounded-2xl p-8 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                            <Sparkles className="h-6 w-6 text-white/20" />
                        </div>
                        <p className="text-white/30 text-sm">No creations yet — pick a tool above to start</p>
                    </div>
                ) : (
                    <Link href="/dashboard/history">
                        <div className="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/[0.06] transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white/80">{recentCount} total creations</p>
                                    <p className="text-xs text-white/30">View full history</p>
                                </div>
                            </div>
                            <svg className="h-4 w-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                )}
            </motion.div>
        </div>
    );
}
