'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { ImageUploader } from '@/components/tools/ImageUploader';
import { Upload, ScanSearch, Copy, Check, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { imageToBase64 } from '@/lib/utils';

export default function ExtractPage() {
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [extractedPrompt, setExtractedPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleImageUpload = (file: File) => {
        setUploadedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setExtractedPrompt('');
    };

    const handleExtract = async () => {
        if (!uploadedImage) return;
        setLoading(true);
        setExtractedPrompt('');

        try {
            const base64 = await imageToBase64(uploadedImage);
            const res = await fetch('/api/tools/prompt-extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_base64: base64 }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    toast.error(`Daily limit reached. Upgrade for more extractions.`);
                } else if (res.status === 401) {
                    toast.error('Please sign in to use Prompt Extract.');
                } else {
                    throw new Error(data.error || 'Extraction failed');
                }
                return;
            }

            setExtractedPrompt(data.data.prompt);
            toast.success('Prompt extracted!');
        } catch (err: any) {
            toast.error(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!extractedPrompt) return;
        navigator.clipboard.writeText(extractedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-3xl">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                        <ScanSearch className="h-4 w-4 text-orange-400" />
                    </div>
                    <h1 className="text-lg font-semibold text-white">Prompt Extractor</h1>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">
                        AI Powered
                    </span>
                </div>
                <p className="text-white/40 text-sm ml-11">
                    Upload any AI-generated image and we'll reverse-engineer the prompt used to create it
                </p>
            </motion.div>

            <div className="space-y-4">
                {/* Upload Area */}
                <div className="glass rounded-2xl p-4">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-3">Upload Image</p>

                    {!uploadedImage ? (
                        <div className="drop-zone rounded-xl overflow-hidden h-52 flex flex-col items-center justify-center">
                            <ImageUploader
                                onImageUpload={handleImageUpload}
                                maxSize={10 * 1024 * 1024}
                            />
                        </div>
                    ) : (
                        <div className="flex gap-4 items-start">
                            <div className="relative w-32 h-40 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 bg-black/30">
                                <Image src={previewUrl!} alt="Uploaded" fill className="object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between h-40">
                                <div>
                                    <p className="text-sm text-white/80 font-medium">{uploadedImage.name}</p>
                                    <p className="text-xs text-white/30 mt-0.5">{(uploadedImage.size / 1024).toFixed(0)} KB</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => { setUploadedImage(null); setPreviewUrl(null); setExtractedPrompt(''); }}
                                        variant="outline"
                                        size="sm"
                                        className="border-white/10 text-white/50 hover:text-white text-xs"
                                    >
                                        Change
                                    </Button>
                                    <Button
                                        onClick={handleExtract}
                                        disabled={loading}
                                        size="sm"
                                        className="bg-orange-500 hover:bg-orange-400 text-white flex-1"
                                    >
                                        {loading ? (
                                            <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Extracting...</>
                                        ) : (
                                            <><ScanSearch className="h-3 w-3 mr-1.5" /> Extract Prompt</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Result */}
                <AnimatePresence>
                    {extractedPrompt && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="glass rounded-2xl p-4 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                    <p className="text-xs text-white/50 font-medium uppercase tracking-wide">Extracted Prompt</p>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.06]"
                                >
                                    {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>

                            <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                                {extractedPrompt}
                            </p>

                            {/* CTA: use this prompt */}
                            <a
                                href={`/dashboard/image-gen?prompt=${encodeURIComponent(extractedPrompt)}`}
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600/80 to-indigo-600/80 hover:from-violet-600 hover:to-indigo-600 text-white text-sm font-medium transition-all duration-200"
                            >
                                <Sparkles className="h-4 w-4" />
                                Generate Image with this Prompt
                                <ArrowRight className="h-3.5 w-3.5" />
                            </a>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info Tip */}
                {!uploadedImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        className="glass-sm rounded-xl p-4 flex items-start gap-3"
                    >
                        <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Upload className="h-3.5 w-3.5 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-white/60 mb-0.5">Works best with</p>
                            <p className="text-xs text-white/30 leading-relaxed">
                                Midjourney, Stable Diffusion, DALL·E, or AuraShot generated images.
                                Works on portraits, landscapes, concept art, and product photography.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
