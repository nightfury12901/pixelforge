'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Crown, User, Zap, Calendar, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Profile } from '@/lib/types';

const tierColors: Record<string, string> = {
    free: '#6b7280',
    starter: '#3b82f6',
    pro: '#8b5cf6',
    lifetime: '#f59e0b',
};

export default function SettingsPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            let { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            // Auto-create profile if missing (user signed up before DB trigger)
            if (!data) {
                await supabase.from('profiles').upsert({
                    id: user.id,
                    email: user.email,
                    tier: 'free',
                    credits_remaining: 2,
                    total_credits_used: 0,
                });
                const { data: fresh } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                data = fresh;
            }
            if (data) setProfile(data);
            setLoading(false);
        }
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success('Logged out');
        router.push('/');
        router.refresh();
    };

    if (loading) {
        return (
            <div className="p-6 space-y-4 max-w-2xl">
                {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl skeleton" />)}
            </div>
        );
    }

    const tierColor = tierColors[profile?.tier || 'free'];

    return (
        <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-2xl space-y-5">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                        <Settings className="h-4 w-4 text-white/60" />
                    </div>
                    <h1 className="text-lg font-semibold text-white">Settings</h1>
                </div>
                <p className="text-white/40 text-sm ml-11">Manage your account and subscription</p>
            </motion.div>

            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="glass rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="h-4 w-4 text-white/40" />
                        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Profile</h2>
                    </div>
                    <div className="space-y-3">
                        {[
                            { icon: User, label: 'Name', value: profile?.full_name || '—' },
                            { icon: Mail, label: 'Email', value: profile?.email || '—' },
                            { icon: Calendar, label: 'Member since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : '—' },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex justify-between items-center py-2.5 border-b border-white/[0.05] last:border-0">
                                <div className="flex items-center gap-2">
                                    <Icon className="h-3.5 w-3.5 text-white/25" />
                                    <span className="text-sm text-white/40">{label}</span>
                                </div>
                                <span className="text-sm font-medium text-white/80">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Subscription Card */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="glass rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Crown className="h-4 w-4 text-white/40" />
                        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Subscription</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2.5 border-b border-white/[0.05]">
                            <span className="text-sm text-white/40">Current Plan</span>
                            <span className="text-sm font-semibold px-3 py-1 rounded-full capitalize" style={{ background: `${tierColor}20`, color: tierColor, border: `1px solid ${tierColor}30` }}>
                                {profile?.tier}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-white/[0.05]">
                            <div className="flex items-center gap-2">
                                <Zap className="h-3.5 w-3.5 text-white/25" />
                                <span className="text-sm text-white/40">Credits Remaining</span>
                            </div>
                            <span className="text-sm font-semibold text-white/80">{profile?.credits_remaining ?? '—'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-white/25" />
                                <span className="text-sm text-white/40">Credits Reset</span>
                            </div>
                            <span className="text-sm font-medium text-white/80">
                                {profile?.credits_reset_date ? new Date(profile.credits_reset_date).toLocaleDateString('en-IN') : '—'}
                            </span>
                        </div>
                    </div>

                    {profile?.tier === 'free' && (
                        <button
                            onClick={() => router.push('/pricing')}
                            className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}
                        >
                            <Crown className="h-4 w-4" />
                            Upgrade to Pro
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="glass rounded-2xl p-5">
                    <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Account</h2>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-red-400/70 hover:text-red-400 transition-colors py-2 px-3 rounded-xl hover:bg-red-500/10"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
