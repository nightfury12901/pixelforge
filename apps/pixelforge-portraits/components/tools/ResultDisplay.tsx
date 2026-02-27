'use client';

import { Download, Share2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadImage } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ResultDisplayProps {
    imageUrl: string;
    label?: string;
    onReset?: () => void;
}

export function ResultDisplay({ imageUrl, label = 'Result', onReset }: ResultDisplayProps) {
    const handleDownload = () => {
        downloadImage(imageUrl, `aurashot-${Date.now()}.png`);
        toast.success('Image downloaded!');
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'My AuraShot Creation',
                    text: 'Check out this AI-generated image!',
                    url: imageUrl,
                });
            } else {
                await navigator.clipboard.writeText(imageUrl);
                toast.success('Link copied to clipboard!');
            }
        } catch {
            // User cancelled share
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{label}</h3>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="rounded-lg" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                    </Button>
                    {onReset && (
                        <Button variant="ghost" size="sm" className="rounded-lg" onClick={onReset}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <img
                src={imageUrl}
                alt={label}
                className="rounded-xl w-full max-h-96 object-contain bg-gray-50"
            />

            <Button onClick={handleDownload} className="w-full mt-4 rounded-xl bg-gradient-to-r from-primary to-primary-600">
                <Download className="mr-2 h-4 w-4" />
                Download Image
            </Button>
        </div>
    );
}
