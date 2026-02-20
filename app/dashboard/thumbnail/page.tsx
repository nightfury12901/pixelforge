'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Sparkles, Loader2, Download, Copy, ImagePlus, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ASPECT_RATIOS = [
    { label: 'YouTube (16:9)', value: '16:9', class: 'aspect-video' },
    { label: 'Square (1:1)', value: '1:1', class: 'aspect-square' },
    { label: 'Shorts/Reels (9:16)', value: '9:16', class: 'aspect-[9/16]' },
];

export default function ThumbnailPage() {
    const [prompt, setPrompt] = useState('');
    const [selectedAspect, setSelectedAspect] = useState(ASPECT_RATIOS[0]);
    const [batchSize, setBatchSize] = useState(1);
    const [loading, setLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<any[]>([]);

    const handleGenerate = async () => {
        if (!prompt.trim()) { toast.error('Enter a prompt first'); return; }
        setLoading(true);
        try {
            const res = await fetch('/api/tools/thumbnail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    aspect_ratio: selectedAspect.value,
                    batch_size: batchSize,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 402) toast.error('Not enough credits. Please upgrade.');
                else throw new Error(data.error || 'Generation failed');
                return;
            }

            if (data.data?.images) {
                const newImages = data.data.images.map((imgUrl: string) => ({
                    url: imgUrl,
                    prompt: data.data.enhanced_prompt,
                    timestamp: Date.now() + Math.random(),
                }));
                setGeneratedImages((prev) => [...newImages, ...prev]);
                toast.success('Thumbnails generated!');
            }
        } catch (err: any) {
            toast.error(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (url: string, index: number) => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `pixelforge-thumbnail-${index + 1}.png`;
            a.click();
        } catch {
            toast.error('Download failed');
        }
    };

    return (
        <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-5xl">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                        <ImagePlus className="h-4 w-4 text-orange-400" />
                    </div>
                    <h1 className="text-lg font-semibold text-white">Thumbnail Generator</h1>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">
                        AI Batched + Enhanced
                    </span>
                </div>
                <p className="text-white/40 text-sm ml-11">
                    Generate eye-catching thumbnails for YouTube, Shorts, and Reels. Every prompt is automatically enhanced!
                </p>
            </motion.div>

            <div className="grid lg:grid-cols-[1fr,360px] gap-6">
                {/* Left: Generated Images */}
                <div className="space-y-4">
                    {generatedImages.length === 0 && !loading && (
                        <div className="glass rounded-2xl flex items-center justify-center" style={{ minHeight: 320 }}>
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
                                    <ImagePlus className="h-7 w-7 text-orange-400/50" />
                                </div>
                                <p className="text-white/30 text-sm">Your generated thumbnails will appear here</p>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="glass rounded-2xl flex items-center justify-center" style={{ minHeight: 320 }}>
                            <div className="text-center">
                                <div className="relative mx-auto w-14 h-14 mb-4">
                                    <Loader2 className="h-14 w-14 animate-spin text-orange-500/30" />
                                    <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-orange-400" />
                                </div>
                                <p className="text-white/50 text-sm font-medium">Enhancing prompt & Generating...</p>
                                <p className="text-white/25 text-xs mt-1">Batch generation can take a bit longer</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {generatedImages.map((img, i) => (
                                <motion.div key={img.timestamp} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl overflow-hidden flex flex-col">
                                    <div className={`relative w-full ${selectedAspect.class} bg-black/30`}>
                                        <Image src={img.url} alt="Thumbnail result" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                                    </div>
                                    <div className="p-3 flex items-center justify-between gap-3 mt-auto border-t border-white/[0.05] bg-black/20">
                                        <p className="text-[10px] text-white/50 line-clamp-2 flex-1" title={img.prompt}>{img.prompt}</p>
                                        <div className="flex gap-1.5 flex-shrink-0">
                                            <button onClick={() => { navigator.clipboard.writeText(img.prompt); toast.success('Prompt copied!'); }} className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-colors" title="Copy enhanced prompt">
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => handleDownload(img.url, i)} className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-colors" title="Download">
                                                <Download className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="space-y-4">
                    {/* Format Selection */}
                    <div className="glass rounded-2xl p-4">
                        <label className="text-[11px] text-white/40 uppercase tracking-wider font-semibold block mb-3">
                            Platform Format
                        </label>
                        <div className="flex flex-col gap-2">
                            {ASPECT_RATIOS.map((ar) => (
                                <button
                                    key={ar.value}
                                    onClick={() => setSelectedAspect(ar)}
                                    className={`py-2 px-3 rounded-xl text-xs font-medium transition-all text-left flex items-center justify-between ${selectedAspect.value === ar.value
                                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-300 shadow-inner'
                                        : 'bg-white/[0.03] border-white/[0.04] text-white/60 hover:bg-white/[0.06] hover:text-white border'
                                        }`}
                                >
                                    {ar.label}
                                    {selectedAspect.value === ar.value && <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Batch Size */}
                    <div className="glass rounded-2xl p-4">
                        <label className="text-[11px] text-white/40 uppercase tracking-wider font-semibold block mb-3 flex items-center justify-between">
                            Images to Generate
                            <span className="text-white/20 font-normal">Batch Size</span>
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setBatchSize(num)}
                                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all select-none ${batchSize === num
                                        ? 'bg-orange-500/20 border border-orange-500/50 text-orange-300 shadow-inner'
                                        : 'bg-white/[0.03] border border-white/[0.04] text-white/50 hover:bg-white/[0.06] hover:text-white'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Prompt Box */}
                    <div className="glass rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[11px] text-white/40 uppercase tracking-wider font-semibold block">
                                Concept / Prompt
                            </label>
                            <span className="text-[9px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20 uppercase tracking-wide font-medium flex items-center gap-1">
                                <Sparkles className="h-2.5 w-2.5" />
                                Auto-Enhanced
                            </span>
                        </div>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. A futuristic city skyline at night..."
                            rows={4}
                            className="w-full bg-black/20 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.02] transition-colors resize-none"
                        />
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                        className="w-full h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold shadow-lg shadow-orange-500/20 transition-all rounded-xl"
                    >
                        {loading ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enhancing & Batching...</>
                        ) : (
                            <><Wand2 className="h-4 w-4 mr-2" /> Generate {batchSize} {batchSize === 1 ? 'Thumbnail' : 'Thumbnails'}</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
