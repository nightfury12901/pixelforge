'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CreditsDisplay() {
  const [credits, setCredits] = useState({ remaining: 0, tier: 'free' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits/check');
      const data = await response.json();

      if (data.success) {
        setCredits(data.data);
      }
    } catch (error) {
      console.error('Credits fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tiers = {
    free: { label: 'Free', color: 'gray' },
    starter: { label: 'Starter', color: 'yellow' },
    pro: { label: 'Pro', color: 'purple' },
    lifetime: { label: 'Lifetime', color: 'green' },
  };

  const tierInfo = tiers[credits.tier as keyof typeof tiers];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Credits</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-foreground">{credits.remaining}</span>
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  tierInfo?.color === 'gray' && 'bg-gray-100 text-gray-800',
                  tierInfo?.color === 'yellow' && 'bg-yellow-100 text-yellow-800',
                  tierInfo?.color === 'purple' && 'bg-purple-100 text-purple-800',
                  tierInfo?.color === 'green' && 'bg-green-100 text-green-800'
                )}
              >
                {tierInfo?.label}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((credits.remaining / 200) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {credits.remaining === 0 ? 'Upgrade for more credits' : 'Resets monthly'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
