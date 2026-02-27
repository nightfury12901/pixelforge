'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Wand2, Eraser, ScanSearch,
    History, Settings, LogOut, Crown, ImagePlus, Video, Megaphone
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { AdUnit } from '@/components/AdUnit';

const tools = [
    {
        id: 'portraits',
        label: 'Portraits',
        icon: Sparkles,
        href: '/dashboard/portraits',
        color: '#8b5cf6',
        glow: 'rgba(139,92,246,0.4)',
        description: 'AI Portraits',
    },
    {
        id: 'image-gen',
        label: 'Image Gen',
        icon: ImagePlus,
        href: '/dashboard/image-gen',
        color: '#ec4899',
        glow: 'rgba(236,72,153,0.4)',
        description: 'Text to Image',
    },

    {
        id: 'enhance',
        label: 'Enhance',
        icon: Wand2,
        href: '/dashboard/enhance',
        color: '#3b82f6',
        glow: 'rgba(59,130,246,0.4)',
        description: '4K Upscale',
    },
    {
        id: 'background',
        label: 'Remove BG',
        icon: Eraser,
        href: '/dashboard/background',
        color: '#22c55e',
        glow: 'rgba(34,197,94,0.4)',
        description: 'Background',
    },
    {
        id: 'extract',
        label: 'Extract',
        icon: ScanSearch,
        href: '/dashboard/extract',
        color: '#f97316',
        glow: 'rgba(249,115,22,0.4)',
        description: 'Extract Prompt',
    },
];

const nav = [
    { label: 'History', icon: History, href: '/dashboard/history' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export function StudioSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [tier, setTier] = useState<string | null>(null);

    useEffect(() => {
        const fetchTier = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('tier').eq('id', user.id).single();
                setTier(data?.tier || 'free');
            }
        };
        fetchTier();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success('Logged out');
        router.push('/');
        router.refresh();
    };

    const activeTool = tools.find(t => pathname.startsWith(t.href) && t.href !== '/dashboard/portraits') ||
        (pathname === '/dashboard/portraits' ? tools[0] : null);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[72px] h-screen bg-studio-surface border-r border-studio-border shrink-0 py-4 z-20">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center justify-center mb-6 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-glow-violet transition-all duration-300 group-hover:scale-110">
                        <span className="text-white font-bold text-sm">PF</span>
                    </div>
                </Link>

                {/* Divider */}
                <div className="w-8 h-px bg-white/[0.06] mx-auto mb-4" />

                {/* Tools */}
                <nav className="flex flex-col items-center gap-1 px-2 flex-1">
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        const isActive = pathname.startsWith(tool.href);
                        return (
                            <Link key={tool.id} href={tool.href} className="w-full">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl cursor-pointer transition-all duration-200 group ${isActive
                                        ? 'bg-white/[0.08]'
                                        : 'hover:bg-white/[0.04]'
                                        }`}
                                    style={isActive ? {
                                        boxShadow: `0 0 16px ${tool.glow}20`,
                                    } : {}}
                                >
                                    {/* Active indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                                            style={{ background: tool.color }}
                                        />
                                    )}

                                    <Icon
                                        className="h-5 w-5 transition-all duration-200"
                                        style={{ color: isActive ? tool.color : 'rgba(255,255,255,0.4)' }}
                                    />
                                    <span
                                        className="text-[9px] font-medium tracking-wide transition-all duration-200"
                                        style={{ color: isActive ? tool.color : 'rgba(255,255,255,0.35)' }}
                                    >
                                        {tool.label}
                                    </span>

                                    {/* Tooltip */}
                                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-studio-panel border border-white/[0.08] rounded-lg text-xs text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-studio z-50">
                                        {tool.description}
                                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-studio-panel" />
                                    </div>
                                </motion.div>
                            </Link>
                        );
                    })}

                    {/* Divider */}
                    <div className="w-8 h-px bg-white/[0.06] my-2" />

                    {/* Nav items */}
                    {nav.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.label} href={item.href} className="w-full">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl cursor-pointer transition-all duration-200 group relative ${isActive ? 'bg-white/[0.06] text-white/80' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="text-[9px] font-medium tracking-wide">{item.label}</span>

                                    {/* Tooltip */}
                                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-studio-panel border border-white/[0.08] rounded-lg text-xs text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-studio z-50">
                                        {item.label}
                                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-studio-panel" />
                                    </div>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom: Upgrade + Logout */}
                <div className="flex flex-col items-center gap-2 px-2 mt-auto">
                    {/* Free Tier AdSense Sidebar Ad */}
                    <div className="w-[60px] mx-auto overflow-hidden">
                        <AdUnit slotId="SIDEBAR_NAV" format="rectangle" isFreeTier={tier === 'free'} className="!my-2 scale-75 origin-bottom" />
                    </div>

                    <Link href="/pricing" className="w-full">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl cursor-pointer hover:bg-white/[0.04] transition-all group relative"
                        >
                            <Crown className="h-5 w-5 text-yellow-400/60 group-hover:text-yellow-400 transition-colors" />
                            <span className="text-[9px] font-medium text-white/30 group-hover:text-white/60 tracking-wide">Pro</span>
                            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-studio-panel border border-white/[0.08] rounded-lg text-xs text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-studio z-50">
                                Upgrade to Pro
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-studio-panel" />
                            </div>
                        </motion.div>
                    </Link>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl cursor-pointer hover:bg-red-500/10 transition-all w-full group relative"
                    >
                        <LogOut className="h-4 w-4 text-white/20 group-hover:text-red-400 transition-colors" />
                        <span className="text-[9px] font-medium text-white/20 group-hover:text-red-400 tracking-wide">Exit</span>
                    </motion.button>
                </div>
            </aside>

            {/* Mobile Bottom Dock */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-studio-surface/95 backdrop-blur-xl border-t border-studio-border px-2 py-2 flex items-center justify-around">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = pathname.startsWith(tool.href);
                    return (
                        <Link key={tool.id} href={tool.href}>
                            <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${isActive ? 'bg-white/[0.08]' : ''
                                }`}>
                                <Icon
                                    className="h-5 w-5"
                                    style={{ color: isActive ? tool.color : 'rgba(255,255,255,0.4)' }}
                                />
                                <span className="text-[10px]" style={{ color: isActive ? tool.color : 'rgba(255,255,255,0.4)' }}>
                                    {tool.label}
                                </span>
                            </div>
                        </Link>
                    );
                })}
                {nav.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.label} href={item.href}>
                            <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${isActive ? 'bg-white/[0.08] text-white/80' : 'text-white/30'
                                }`}>
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px]">{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
