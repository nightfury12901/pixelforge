'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, ArrowLeft, Share2, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

interface PortraitResult {
    imageUrl: string;
    templateName: string;
    templatePreview: string;
}

export default function PortraitResultPage() {
    const router = useRouter();
    const [result, setResult] = useState<PortraitResult | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('portrait_result');
        if (!stored) {
            router.push('/dashboard/portraits');
            return;
        }
        try {
            setResult(JSON.parse(stored));
        } catch {
            router.push('/dashboard/portraits');
        }
    }, [router]);

    const handleDownload = async () => {
        if (!result) return;
        try {
            const res = await fetch(result.imageUrl);
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `aurashot-portrait-${Date.now()}.jpg`;
            a.click();
            toast.success('Portrait downloaded!');
        } catch {
            toast.error('Download failed. Try right-clicking the image.');
        }
    };

    const handleShare = async () => {
        if (!result) return;
        try {
            await navigator.share({ title: 'My AI Portrait — AuraShot', url: result.imageUrl });
        } catch {
            await navigator.clipboard.writeText(result.imageUrl);
            toast.success('Image URL copied to clipboard!');
        }
    };

    if (!result) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8 pb-32">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/portraits')} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-violet-400" />
                        Portrait Ready!
                    </h1>
                    <p className="text-sm text-white/40 mt-0.5">{result.templateName} style</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Generated Portrait */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-violet-500/20 shadow-2xl shadow-violet-500/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={result.imageUrl}
                            alt="Generated Portrait"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-4 left-4">
                            <span className="text-xs font-bold text-white/60 bg-black/40 backdrop-blur px-2 py-1 rounded-full">
                                AuraShot
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col gap-4 justify-center"
                >
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="font-semibold text-lg">Your AI Portrait</h2>
                        <p className="text-sm text-white/50 leading-relaxed">
                            Your portrait has been generated using the <strong className="text-white/80">{result.templateName}</strong> style.
                            Download it or share directly.
                        </p>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleDownload}
                        className="w-full h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 font-bold shadow-lg shadow-violet-500/20"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Download Portrait
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        onClick={handleShare}
                        className="w-full h-12 border-white/10 text-white/80 hover:bg-white/5"
                    >
                        <Share2 className="h-5 w-5 mr-2" />
                        Share Portrait
                    </Button>

                    <Button
                        size="lg"
                        variant="ghost"
                        onClick={() => router.push('/dashboard/portraits')}
                        className="w-full h-12 text-white/50 hover:text-white/80"
                    >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create Another Portrait
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
