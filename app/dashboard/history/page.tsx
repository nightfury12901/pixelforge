'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { Download, Clock, Image as ImageIcon, Wand2, Eraser, Sparkles } from 'lucide-react';
import { getTimeAgo } from '@/lib/utils';
import type { Generation } from '@/lib/types';

const opConfig: Record<string, { icon: any; label: string; color: string }> = {
    portrait: { icon: Sparkles, label: 'AI Portrait', color: '#8b5cf6' },
    enhance: { icon: Wand2, label: 'Enhancement', color: '#3b82f6' },
    background_remove: { icon: Eraser, label: 'BG Removal', color: '#22c55e' },
};

const statusStyle: Record<string, string> = {
    completed: 'bg-green-500/15 text-green-400 border-green-500/20',
    failed: 'bg-red-500/15 text-red-400 border-red-500/20',
    processing: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    pending: 'bg-white/[0.06] text-white/40 border-white/[0.08]',
};

export default function HistoryPage() {
    const [generations, setGenerations] = useState<Generation[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function fetchHistory() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase
                .from('generations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);
            if (data) setGenerations(data);
            setLoading(false);
        }
        fetchHistory();
    }, []);

    return (
        <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-3xl">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                        <Clock className="h-4 w-4 text-white/60" />
                    </div>
                    <h1 className="text-lg font-semibold text-white">History</h1>
                </div>
                <p className="text-white/40 text-sm ml-11">Your recent AI generations</p>
            </motion.div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-20 rounded-2xl skeleton" />
                    ))}
                </div>
            ) : generations.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-6 w-6 text-white/20" />
                    </div>
                    <h3 className="font-semibold text-white/60 mb-1">No generations yet</h3>
                    <p className="text-sm text-white/30">Start creating to see your history here.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {generations.map((gen, i) => {
                        const cfg = opConfig[gen.operation_type] || { icon: ImageIcon, label: gen.operation_type, color: '#6b7280' };
                        const Icon = cfg.icon;
                        return (
                            <motion.div
                                key={gen.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-4 glass rounded-2xl p-4 hover:bg-white/[0.06] transition-colors"
                            >
                                {/* Preview */}
                                <div
                                    className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                                    style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}20` }}
                                >
                                    {gen.output_image_url ? (
                                        <img src={gen.output_image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <Icon className="h-5 w-5" style={{ color: cfg.color, opacity: 0.6 }} />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm text-white/80">{cfg.label}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusStyle[gen.status] || statusStyle.pending}`}>
                                            {gen.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/30">
                                        {getTimeAgo(gen.created_at)} · {gen.credits_used} credit{gen.credits_used !== 1 ? 's' : ''}
                                        {gen.processing_time_ms && ` · ${(gen.processing_time_ms / 1000).toFixed(1)}s`}
                                    </p>
                                </div>

                                {/* Download */}
                                {gen.output_image_url && (
                                    <a href={gen.output_image_url} download>
                                        <button className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors">
                                            <Download className="h-3.5 w-3.5 text-white/40" />
                                        </button>
                                    </a>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
