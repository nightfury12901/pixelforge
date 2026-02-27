'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AdUnitProps {
    slotId: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    className?: string;
    isFreeTier: boolean;
}

export function AdUnit({ slotId, format = 'auto', className = '', isFreeTier }: AdUnitProps) {
    const pathname = usePathname();

    useEffect(() => {
        if (isFreeTier && typeof window !== 'undefined') {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
                console.error('AdSense error:', err);
            }
        }
    }, [pathname, isFreeTier]);

    if (!isFreeTier) return null;

    return (
        <div className={`w-full overflow-hidden flex items-center justify-center my-4 ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
                data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}
