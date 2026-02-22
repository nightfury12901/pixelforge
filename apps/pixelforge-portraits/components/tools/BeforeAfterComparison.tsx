'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BeforeAfterComparisonProps {
    beforeUrl: string;
    afterUrl: string;
    beforeLabel?: string;
    afterLabel?: string;
}

export function BeforeAfterComparison({
    beforeUrl,
    afterUrl,
    beforeLabel = 'Before',
    afterLabel = 'After',
}: BeforeAfterComparisonProps) {
    const [sliderPosition, setSliderPosition] = useState(50);

    return (
        <div className="relative rounded-2xl overflow-hidden select-none" style={{ aspectRatio: '4/3' }}>
            {/* After image (full width) */}
            <img src={afterUrl} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover" />

            {/* Before image (clipped) */}
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
                <img src={beforeUrl} alt={beforeLabel} className="w-full h-full object-cover" style={{ minWidth: '100%' }} />
            </div>

            {/* Slider line */}
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                    <div className="flex gap-0.5">
                        <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
                        <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Labels */}
            <span className="absolute top-3 left-3 text-xs font-medium bg-black/50 text-white px-2 py-0.5 rounded-full">
                {beforeLabel}
            </span>
            <span className="absolute top-3 right-3 text-xs font-medium bg-black/50 text-white px-2 py-0.5 rounded-full">
                {afterLabel}
            </span>

            {/* Invisible slider input */}
            <input
                type="range"
                min={0}
                max={100}
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
            />
        </div>
    );
}
