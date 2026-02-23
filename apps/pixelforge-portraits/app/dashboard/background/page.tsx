'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eraser, Upload, Download, X, ImageIcon, CheckCircle2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function BackgroundPage() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
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
        setResultUrl(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
    });

    const handleRemove = async () => {
        if (!imageFile) return;
        setLoading(true);
        setResultUrl(null);

        try {
            // Convert file to base64 data URI (blob:// URLs can't be fetched server-side)
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(imageFile);
            });

            const res = await fetch('/api/tools/background-remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: base64 }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Background removal failed');

            const generationId = data.data.generation_id;
            for (let i = 0; i < 30; i++) {
                await new Promise((r) => setTimeout(r, 2000));
                const poll = await fetch(`/api/tools/status?id=${generationId}`);
                const pollData = await poll.json();
                if (pollData.data?.status === 'completed') {
                    setResultUrl(pollData.data.output_image_url);
                    toast.success('Background removed!');
                    return;
                }
                if (pollData.data?.status === 'failed') throw new Error('Processing failed');
            }
            throw new Error('Timeout — please try again');
        } catch (error: any) {
            toast.error(error.message || 'Background removal failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full min-h-screen">
            {/* Canvas Area */}
            <div className="flex-1 flex flex-col p-6 gap-4 min-w-0">
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                            <Eraser className="h-4 w-4 text-green-400" />
                        </div>
                        <h1 className="text-lg font-semibold text-white">Background Remover</h1>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">Instant</span>
                    </div>
                    <p className="text-white/40 text-sm ml-11">Remove backgrounds from any image with one click</p>
                </motion.div>

                <div className="flex-1 grid md:grid-cols-2 gap-4">
                    {/* Input */}
                    <div className="flex flex-col gap-3">
                        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Original</p>
                        <div
                            {...getRootProps()}
                            className={`flex-1 min-h-[300px] studio-canvas rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-green-500/50 bg-green-500/[0.04]' : 'drop-zone'
                                } ${imageUrl ? 'p-0 overflow-hidden' : 'p-8'}`}
                        >
                            <input {...getInputProps()} />
                            {imageUrl ? (
                                <div className="relative w-full h-full group">
                                    <img src={imageUrl} alt="Original" className="w-full h-full object-contain rounded-2xl" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setImageFile(null); setImageUrl(null); setResultUrl(null); }}
                                        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/60"
                                    >
                                        <X className="h-3.5 w-3.5 text-white" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                                        <Upload className="h-6 w-6 text-green-400/60" />
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
                        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">Result (No Background)</p>
                        <div className="flex-1 min-h-[300px] rounded-2xl flex items-center justify-center overflow-hidden relative"
                            style={{
                                background: resultUrl
                                    ? 'repeating-conic-gradient(#1a1a22 0% 25%, #141418 0% 50%) 0 0 / 20px 20px'
                                    : '#0A0A0F',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                                            <div className="ai-loader text-green-400"><span /><span /><span /></div>
                                        </div>
                                        <p className="text-white/40 text-sm">Removing background...</p>
                                        <p className="text-white/20 text-xs mt-1">Usually takes 10–20 seconds</p>
                                    </motion.div>
                                ) : resultUrl ? (
                                    <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full h-full group">
                                        <img src={resultUrl} alt="Result" className="w-full h-full object-contain" />
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 rounded-lg px-2 py-1">
                                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                                            <span className="text-xs text-green-400 font-medium">Background removed</span>
                                        </div>
                                        <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href={resultUrl} download="no-background.png" className="w-full">
                                                <button className="w-full py-2.5 rounded-xl bg-green-600/90 backdrop-blur text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-500 transition-colors" style={{ boxShadow: '0 0 20px rgba(34,197,94,0.4)' }}>
                                                    <Download className="h-4 w-4" />
                                                    Download PNG (Transparent)
                                                </button>
                                            </a>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                                            <ImageIcon className="h-6 w-6 text-white/15" />
                                        </div>
                                        <p className="text-white/25 text-sm">Transparent result will appear here</p>
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
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Output Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-white/50 mb-2 block">Output Format</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['PNG (Transparent)', 'JPG (White BG)'].map((v, i) => (
                                    <button key={v} className={`py-2 px-2 rounded-xl text-xs font-medium transition-all border ${i === 0 ? 'bg-green-600/20 border-green-500/40 text-green-300' : 'bg-white/[0.04] border-white/[0.06] text-white/40 hover:bg-white/[0.07]'
                                        }`}>{v}</button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-white/50 mb-2 block">Edge Refinement</label>
                            <div className="space-y-2">
                                {['Auto', 'Hair & Fur', 'Hard Edges'].map((mode, i) => (
                                    <button key={mode} className={`w-full py-2.5 px-3 rounded-xl text-sm text-left transition-all border ${i === 0 ? 'bg-green-600/15 border-green-500/30 text-green-300' : 'bg-white/[0.03] border-white/[0.05] text-white/40 hover:bg-white/[0.06]'
                                        }`}>{mode}</button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs text-white/50">Edge Smoothness</label>
                                <span className="text-xs text-green-400">60%</span>
                            </div>
                            <input type="range" min="0" max="100" defaultValue="60" className="w-full accent-green-500 h-1.5 rounded-full bg-white/10 cursor-pointer" />
                        </div>
                    </div>
                </div>

                <div className="glass-sm p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Costs 1 credit per removal
                    </div>
                </div>

                <button
                    onClick={handleRemove}
                    disabled={!imageFile || loading}
                    className="mt-auto w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                        background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                        boxShadow: imageFile && !loading ? '0 0 24px rgba(34,197,94,0.4)' : 'none',
                    }}
                >
                    {loading ? (
                        <><div className="ai-loader text-white"><span /><span /><span /></div> Removing...</>
                    ) : (
                        <><Eraser className="h-4 w-4" /> Remove Background</>
                    )}
                </button>


            </div>

            {/* Mobile action button */}
            <div className="lg:hidden fixed bottom-20 left-0 right-0 px-4">
                <button
                    onClick={handleRemove}
                    disabled={!imageFile || loading}
                    className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-30"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', boxShadow: '0 0 24px rgba(34,197,94,0.4)' }}
                >
                    {loading ? <><div className="ai-loader text-white"><span /><span /><span /></div> Removing...</> : <><Eraser className="h-4 w-4" /> Remove Background</>}
                </button>
            </div>
        </div>
    );
}
