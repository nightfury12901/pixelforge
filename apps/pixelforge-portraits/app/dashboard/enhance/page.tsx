'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Upload, Download, X, ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function EnhancePage() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
    const [colorize, setColorize] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tier, setTier] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchTier = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('tier').eq('id', user.id).single();
                setTier(data?.tier || 'free');
            }
        };
        fetchTier();
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
        setEnhancedUrl(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
    });

    const handleEnhance = async () => {
        if (!imageFile) return;
        setLoading(true);
        setEnhancedUrl(null);

        try {
            // Convert file to base64 data URI (blob:// URLs can't be fetched server-side)
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(imageFile);
            });

            const res = await fetch('/api/tools/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: base64, colorize }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Enhancement failed');
            }

            setEnhancedUrl(data.data.imageUrl);
            toast.success('Image restored successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Enhancement failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full min-h-screen">
            {/* Canvas Area */}
            <div className="flex-1 flex flex-col p-6 gap-4 min-w-0">
                {/* Page title */}
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <Wand2 className="h-4 w-4 text-blue-400" />
                        </div>
                        <h1 className="text-lg font-semibold text-white">AI Photo Restoration</h1>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">Flux Pro Kontext</span>
                    </div>
                    <p className="text-white/40 text-sm ml-11">Restore old, damaged, or blurry photos back to life instantly.</p>
                </motion.div>

                {/* Canvas */}
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                    {/* Input */}
                    <div className="flex flex-col gap-3">
                        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Original</p>
                        <div
                            {...getRootProps()}
                            className={`flex-1 min-h-[300px] studio-canvas rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-blue-500/50 bg-blue-500/[0.04]' : 'drop-zone'
                                } ${imageUrl ? 'p-0 overflow-hidden' : 'p-8'} ${tier === 'starter' || tier === 'free' ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <input {...getInputProps()} disabled={tier === 'starter' || tier === 'free'} />
                            {imageUrl ? (
                                <div className="relative w-full h-full group">
                                    <img src={imageUrl} alt="Original" className="w-full h-full object-contain rounded-2xl" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setImageUrl(null); setImageFile(null); }}
                                        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/60"
                                    >
                                        <X className="h-3.5 w-3.5 text-white" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                                        <Upload className="h-6 w-6 text-blue-400/60" />
                                    </div>
                                    <p className="text-white/50 text-sm font-medium mb-1">
                                        {isDragActive ? 'Drop it here' : 'Drop image or click to upload'}
                                    </p>
                                    <p className="text-white/25 text-xs">PNG, JPG, WEBP up to 10MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Output */}
                    <div className="flex flex-col gap-3">
                        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Enhanced Result</p>
                        <div className="flex-1 min-h-[300px] studio-canvas rounded-2xl flex items-center justify-center overflow-hidden">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                                            <div className="ai-loader text-blue-400">
                                                <span /><span /><span />
                                            </div>
                                        </div>
                                        <p className="text-white/40 text-sm">AI is restoring context...</p>
                                        <p className="text-white/20 text-xs mt-1">Usually takes ~5 seconds</p>
                                    </motion.div>
                                ) : enhancedUrl ? (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative w-full h-full group"
                                    >
                                        <img src={enhancedUrl} alt="Enhanced" className="w-full h-full object-contain rounded-2xl" />
                                        <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href={enhancedUrl} download="enhanced.png" className="w-full">
                                                <button className="w-full py-2.5 rounded-xl bg-blue-600/90 backdrop-blur text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors" style={{ boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}>
                                                    <Download className="h-4 w-4" />
                                                    Download Enhanced
                                                </button>
                                            </a>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                                            <ImageIcon className="h-6 w-6 text-white/15" />
                                        </div>
                                        <p className="text-white/25 text-sm">Enhanced image will appear here</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Control Panel */}
            <div className="hidden lg:flex flex-col w-72 shrink-0 border-l border-studio-border p-5 gap-5 bg-studio-surface/50">
                <div>
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Restoration Settings</h3>

                    <div className="space-y-6">
                        {/* Context Description */}
                        <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.02]">
                            <p className="text-xs text-blue-200/60 leading-relaxed">
                                <strong className="text-blue-300">Flux Pro Kontext</strong> analyzes the entire scene to intelligently deblur, remove scratches, and restore faces perfectly without losing the original identity.
                            </p>
                        </div>

                        {/* Colorize Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                            <div>
                                <h4 className="text-sm font-medium text-white/90">Colorize B&W</h4>
                                <p className="text-[10px] text-white/40 mt-0.5">Add natural colors</p>
                            </div>
                            <button
                                onClick={() => setColorize(!colorize)}
                                className={`w-11 h-6 rounded-full transition-colors relative ${colorize ? 'bg-blue-500' : 'bg-white/10'}`}
                            >
                                <motion.div
                                    className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                    animate={{ x: colorize ? 20 : 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Credits info */}
                <div className="glass-sm p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Costs 1 credit per enhancement
                    </div>
                </div>

                {/* Action button */}
                <button
                    onClick={handleEnhance}
                    disabled={!imageUrl || loading}
                    className="mt-auto w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                        boxShadow: imageUrl && !loading ? '0 0 24px rgba(59,130,246,0.4)' : 'none',
                    }}
                >
                    {loading ? (
                        <>
                            <div className="ai-loader text-white"><span /><span /><span /></div>
                            Enhancing...
                        </>
                    ) : (
                        <>
                            <Wand2 className="h-4 w-4" />
                            Enhance Image
                        </>
                    )}
                </button>

                {(tier === 'starter' || tier === 'free') && (
                    <div className="mt-2 text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <p className="text-xs text-orange-400 font-medium mb-2">4K Upscaling requires Creator Pack</p>
                        <button onClick={() => router.push('/pricing')} className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg w-full transition-colors">
                            Upgrade Now
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile action button */}
            <div className="lg:hidden fixed bottom-20 left-0 right-0 px-4">
                <button
                    onClick={handleEnhance}
                    disabled={!imageUrl || loading}
                    className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-30"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 0 24px rgba(59,130,246,0.4)' }}
                >
                    {loading ? <><div className="ai-loader text-white"><span /><span /><span /></div> Enhancing...</> : <><Wand2 className="h-4 w-4" /> Enhance Image</>}
                </button>
            </div>
        </div>
    );
}
