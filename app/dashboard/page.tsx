'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { Sparkles, Wand2, Eraser, ScanSearch, Zap, TrendingUp, Clock, ImagePlus, Video } from 'lucide-react';
import Link from 'next/link';

const tools = [
    {
        id: 'portraits',
        label: 'AI Portraits',
        description: 'Create stunning portraits from 25+ trending styles',
        icon: Sparkles,
        href: '/dashboard/portraits',
        color: '#8b5cf6',
        glow: 'rgba(139,92,246,0.3)',
        gradient: 'from-violet-600/20 to-purple-900/10',
        border: 'border-violet-500/20',
        badge: '25+ Styles',
    },
    {
        id: 'image-gen',
        label: 'Image Generate',
        description: 'Generate any image from your text prompt',
        icon: ImagePlus,
        href: '/dashboard/image-gen',
        color: '#ec4899',
        glow: 'rgba(236,72,153,0.3)',
        gradient: 'from-pink-600/20 to-rose-900/10',
        border: 'border-pink-500/20',
        badge: 'AI Magic',
    },
    {
        id: 'video',
        label: 'AI Video',
        description: 'Animate portraits or create 10s cinematic clips',
        icon: Video,
        href: '/dashboard/video',
        color: '#a855f7',
        glow: 'rgba(168,85,247,0.3)',
        gradient: 'from-purple-600/20 to-fuchsia-900/10',
        border: 'border-purple-500/20',
        badge: 'fal.ai',
    },
    {
        id: 'enhance',
        label: 'AI Enhance',
        description: 'Upscale any image to 4K with super resolution',
        icon: Wand2,
        href: '/dashboard/enhance',
        color: '#3b82f6',
        glow: 'rgba(59,130,246,0.3)',
        gradient: 'from-blue-600/20 to-blue-900/10',
        border: 'border-blue-500/20',
        badge: '4K Quality',
    },
    {
        id: 'background',
        label: 'Remove BG',
        description: 'Instantly remove backgrounds with one click',
        icon: Eraser,
        href: '/dashboard/background',
        color: '#22c55e',
        glow: 'rgba(34,197,94,0.3)',
        gradient: 'from-green-600/20 to-green-900/10',
        border: 'border-green-500/20',
        badge: 'Instant',
    },
    {
        id: 'extract',
        label: 'Extract Prompt',
        description: 'Reverse-engineer any image into an AI prompt',
        icon: ScanSearch,
        href: '/dashboard/extract',
        color: '#f97316',
        glow: 'rgba(249,115,22,0.3)',
        gradient: 'from-orange-600/20 to-orange-900/10',
        border: 'border-orange-500/20',
        badge: 'AI Powered',
    },
];

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

            {/* Tool Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
                {tools.map((tool, i) => {
                    const Icon = tool.icon;
                    return (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <Link href={tool.href}>
                                <div
                                    className={`group relative overflow-hidden rounded-2xl border ${tool.border} bg-gradient-to-br ${tool.gradient} p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02]`}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${tool.glow}`;
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                    }}
                                >
                                    {/* Background orb */}
                                    <div
                                        className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
                                        style={{ background: tool.color }}
                                    />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{ background: `${tool.color}20`, border: `1px solid ${tool.color}30` }}
                                            >
                                                <Icon className="h-5 w-5" style={{ color: tool.color }} />
                                            </div>
                                            <span
                                                className="text-[10px] font-semibold px-2 py-1 rounded-full"
                                                style={{ background: `${tool.color}15`, color: tool.color }}
                                            >
                                                {tool.badge}
                                            </span>
                                        </div>

                                        <h3 className="text-sm font-semibold text-white mb-1">{tool.label}</h3>
                                        <p className="text-xs text-white/50 leading-relaxed">{tool.description}</p>

                                        <div className="mt-3 flex items-center gap-1 text-xs font-medium" style={{ color: tool.color }}>
                                            Open Studio
                                            <svg className="h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
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
