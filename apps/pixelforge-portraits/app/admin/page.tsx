'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { Users, Image, TrendingUp, CreditCard } from 'lucide-react';

export default function AdminPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalGenerations: 0,
        totalTemplates: 0,
        activeSubscriptions: 0,
    });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function fetchStats() {
            const [users, gens, templates, subs] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('generations').select('*', { count: 'exact', head: true }),
                supabase.from('portrait_templates').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
            ]);

            setStats({
                totalUsers: users.count || 0,
                totalGenerations: gens.count || 0,
                totalTemplates: templates.count || 0,
                activeSubscriptions: subs.count || 0,
            });
        }
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground mb-8">Overview of platform statistics.</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
                    { label: 'Generations', value: stats.totalGenerations, icon: Image, color: 'text-secondary-500' },
                    { label: 'Templates', value: stats.totalTemplates, icon: TrendingUp, color: 'text-accent-400' },
                    { label: 'Paid Users', value: stats.activeSubscriptions, icon: CreditCard, color: 'text-success' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">{stat.label}</span>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>

            <p className="text-sm text-muted-foreground">
                Use the Supabase dashboard for detailed data management and template CRUD operations.
            </p>
        </div>
    );
}
