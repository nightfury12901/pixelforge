'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
    const [userName, setUserName] = useState('');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();
                setUserName(profile?.full_name || user.email?.split('@')[0] || 'User');
            }
        }
        getUser();
    }, []);

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-9 pl-9 pr-4 rounded-lg border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none w-64"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="relative rounded-lg">
                    <Bell className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{userName.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium hidden md:block">{userName}</span>
                </div>
            </div>
        </header>
    );
}
