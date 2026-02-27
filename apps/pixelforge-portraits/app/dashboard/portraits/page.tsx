'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { TemplateGallery } from '@/components/templates/TemplateGallery';
import { Sparkles } from 'lucide-react';
import type { PortraitTemplate } from '@/lib/types';

export default function PortraitsPage() {
    const [templates, setTemplates] = useState<PortraitTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function fetchTemplates() {
            const { data } = await supabase
                .from('portrait_templates')
                .select('*')
                .eq('is_published', true)
                .order('popularity_score', { ascending: false });
            if (data) setTemplates(data);
            setLoading(false);
        }
        fetchTemplates();
    }, []);

    return (
        <div className="p-6 md:p-8 pb-24 md:pb-8">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-violet-400" />
                    </div>
                    <h1 className="text-lg font-semibold text-white">AI Portrait Studio</h1>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">25+ Styles</span>
                </div>
                <p className="text-white/40 text-sm ml-11">Choose a style, upload your photo, and create a stunning AI portrait</p>
            </motion.div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />
                    ))}
                </div>
            ) : templates.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center max-w-md">
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-6 w-6 text-violet-400/60" />
                    </div>
                    <h3 className="font-semibold text-white/60 mb-2">No templates available</h3>
                    <p className="text-sm text-white/30 leading-relaxed">
                        Check back soon — new portrait styles are on their way!
                    </p>
                </div>
            ) : (
                /* Pass templates directly so TemplateGallery doesn't re-fetch */
                <TemplateGallery templates={templates} />
            )}
        </div>
    );
}
