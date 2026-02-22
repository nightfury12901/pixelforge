'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Megaphone, Loader2, Download, Copy, ImagePlus, Wand2, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdGeneratorPage() {
    const [targetProduct, setTargetProduct] = useState('');
    const [adText, setAdText] = useState('');
    const [adImage, setAdImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [generatedAds, setGeneratedAds] = useState<any[]>([]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setAdImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        if (!targetProduct.trim()) { toast.error('Enter your target product'); return; }
        if (!adText.trim() && !adImage) { toast.error('Provide a reference ad description or image'); return; }

        setLoading(true);
        try {
            // Strip the standard data:image... prefix for backend base64 if needed, or backend handles it.
            const base64Data = adImage?.split(',')[1] || null;

            const res = await fetch('/api/tools/ad-gen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target_product: targetProduct.trim(),
                    ad_text: adText.trim(),
                    ad_image_base64: base64Data,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 402) toast.error('Not enough credits. Please upgrade.');
                else throw new Error(data.error || 'Generation failed');
                return;
            }

            if (data.data?.images && data.data.images.length > 0) {
                const newAd = {
                    url: data.data.images[0],
                    prompt: data.data.prompt,
                    timestamp: Date.now(),
                };
                setGeneratedAds((prev) => [newAd, ...prev]);
                toast.success('Ad concept generated!');
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
            a.download = `pixelforge-ad-${index + 1}.png`;
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
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <Megaphone className="h-4 w-4 text-emerald-400" />
                    </div>
                    <h1 className="text-lg font-semibold text-white">Ad Generator</h1>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        AI Copywriter + Design
                    </span>
                </div>
                <p className="text-white/40 text-sm ml-11">
                    Describe your product and provide a reference ad. AI will optimize a high-converting prompt and generate the image for you.
                </p>
            </motion.div>

            <div className="grid lg:grid-cols-[1fr,360px] gap-6">
                {/* Left: Generated Images */}
                <div className="space-y-4">
                    {generatedAds.length === 0 && !loading && (
                        <div className="glass rounded-2xl flex items-center justify-center" style={{ minHeight: 320 }}>
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                    <ImagePlus className="h-7 w-7 text-emerald-400/50" />
                                </div>
                                <p className="text-white/30 text-sm">Your generated ad concepts will appear here</p>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="glass rounded-2xl flex items-center justify-center" style={{ minHeight: 320 }}>
                            <div className="text-center">
                                <div className="relative mx-auto w-14 h-14 mb-4">
                                    <Loader2 className="h-14 w-14 animate-spin text-emerald-500/30" />
                                    <Megaphone className="absolute inset-0 m-auto h-5 w-5 text-emerald-400" />
                                </div>
                                <p className="text-white/50 text-sm font-medium">Analyzing ad & optimizing concept...</p>
                                <p className="text-white/25 text-xs mt-1">This might take a few moments</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {generatedAds.map((ad, i) => (
                                <motion.div key={ad.timestamp} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl overflow-hidden flex flex-col">
                                    <div className="relative w-full aspect-video bg-black/30">
                                        <Image src={ad.url} alt="Ad Concept" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                                    </div>
                                    <div className="p-3 flex items-center justify-between gap-3 mt-auto border-t border-white/[0.05] bg-black/20">
                                        <p className="text-[10px] text-white/50 line-clamp-2 flex-1" title={ad.prompt}>{ad.prompt}</p>
                                        <div className="flex gap-1.5 flex-shrink-0">
                                            <button onClick={() => { navigator.clipboard.writeText(ad.prompt); toast.success('Prompt copied!'); }} className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-colors" title="Copy enhanced prompt">
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => handleDownload(ad.url, i)} className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-colors" title="Download">
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
                    {/* Target Product */}
                    <div className="glass rounded-2xl p-4">
                        <label className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold block mb-2">
                            Your Product (What you are selling)
                        </label>
                        <input
                            type="text"
                            value={targetProduct}
                            onChange={(e) => setTargetProduct(e.target.value)}
                            placeholder="e.g. Glowing Skin Vitamin C Serum"
                            className="w-full bg-black/20 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.02] transition-colors"
                        />
                    </div>

                    {/* Reference Ad Box */}
                    <div className="glass rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[11px] text-white/40 uppercase tracking-wider font-semibold block">
                                Reference Ad
                            </label>
                        </div>

                        <p className="text-[10px] text-white/40 mb-2">Describe an ad you liked, or upload a picture of it. We'll extract its style for your product.</p>

                        <textarea
                            value={adText}
                            onChange={(e) => setAdText(e.target.value)}
                            placeholder="e.g. An ad showing a glowing sunset over a minimalist bottle..."
                            rows={3}
                            className="w-full bg-black/20 border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.02] transition-colors resize-none"
                        />

                        <div className="relative">
                            {!adImage ? (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/[0.05] hover:border-emerald-500/50 rounded-xl cursor-pointer hover:bg-white/[0.02] transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-6 h-6 mb-2 text-white/20" />
                                        <p className="text-xs text-white/40"><span className="font-semibold text-white/60">Click to upload</span> reference image</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            ) : (
                                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-white/[0.1]">
                                    <Image src={adImage} alt="Reference Ad" fill className="object-cover" />
                                    <button
                                        onClick={() => setAdImage(null)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-colors backdrop-blur-sm"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !targetProduct.trim() || (!adText.trim() && !adImage)}
                        className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all rounded-xl"
                    >
                        {loading ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Optimizing Ad...</>
                        ) : (
                            <><Wand2 className="h-4 w-4 mr-2" /> Generate Ad Concept</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
