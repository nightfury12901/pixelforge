'use client';

import Link from 'next/link';
import { Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UpgradePrompt({ tier = 'free' }: { tier?: string }) {
    if (tier !== 'free') return null;

    return (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-5 border border-primary/20">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Crown className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">Upgrade for More Credits</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                        Get up to 200 credits/month and unlock premium styles.
                    </p>
                    <Link href="/pricing">
                        <Button size="sm" className="rounded-lg h-8 text-xs">
                            View Plans <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
