'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Loader2, Video, Upload, X, Play, Image as ImageIcon, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function VideoGenPage() {
    const [mode, setMode] = useState<'text' | 'image'>('text');
    const [prompt, setPrompt] = useState('');
    const [duration, setDuration] = useState<5 | 10>(5);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

    // Image to Video state
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Generation state
    const [generating, setGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            // Upload to Supabase Storage via our API
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/templates/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setImageUrl(data.url);
            toast.success('Image uploaded');
        } catch (err: any) {
            toast.error(err.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() && mode === 'text') {
            toast.error('Please enter a description for the video');
            return;
        }
        if (mode === 'image' && !imageUrl) {
            toast.error('Please upload a starting image');
            return;
        }

        setGenerating(true);
        setVideoUrl(null);
        toast.success(
            'Starting generation... This usually takes 2-5 minutes. Feel free to leave this page.',
            { duration: 6000 }
        );

        try {
            const res = await fetch('/api/tools/video-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt || 'Animate this image cinematically',
                    image_url: mode === 'image' ? imageUrl : undefined,
                    duration,
                    aspect_ratio: aspectRatio,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 402) toast.error(data.error);
                else throw new Error(data.error || 'Video generation failed');
                return;
            }

            setVideoUrl(data.data.video_url);
            toast.success(`Video generated! (${data.data.credits_used} credits used)`);
        } catch (err: any) {
            toast.error(err.message || 'Generation failed');
        } finally {
            setGenerating(false);
        }
    };

    const cost = duration === 10 ? 110 : 60;

    return (
        <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                        <Video className="h-4 w-4 text-pink-400" />
                    </div>
                    <h1 className="text-lg font-semibold text-white">AI Video Generation</h1>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20">
                        Kling 2.1
                    </span>
                </div>
                <p className="text-white/40 text-sm ml-11">
                    Generate cinematic AI videos from text or images.
                </p>
            </motion.div>

            <div className="grid lg:grid-cols-[1fr,360px] gap-6">
                {/* Left: Preview & Results */}
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass rounded-2xl overflow-hidden relative group"
                        style={{ minHeight: 400 }}
                    >
                        {videoUrl ? (
                            <video
                                src={videoUrl}
                                controls
                                autoPlay
                                loop
                                className="w-full h-full object-cover"
                            />
                        ) : generating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/40">
                                <Loader2 className="h-12 w-12 text-pink-500/50 animate-spin mb-4" />
                                <p className="text-white/80 font-medium text-lg">Generating Video...</p>
                                <p className="text-white/40 text-sm mt-2 max-w-sm">
                                    This uses the highest quality cinematic model. It usually takes 2-5 minutes to render.
                                </p>
                            </div>
                        ) : mode === 'image' && imageUrl ? (
                            <Image src={imageUrl} alt="Input" fill className="object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                                <Video className="h-16 w-16 mb-4 opacity-50" />
                                <p>Your cinematic video will appear here</p>
                            </div>
                        )}

                        {/* Download button overlay */}
                        {videoUrl && (
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={videoUrl}
                                    download="pixelforge-video.mp4"
                                    className="px-4 py-2 bg-black/60 backdrop-blur border border-white/10 rounded-lg text-white text-sm font-medium hover:bg-black/80 flex items-center gap-2"
                                >
                                    Download MP4
                                </a>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right: Controls */}
                <div className="space-y-4">
                    {/* Mode Toggle */}
                    <div className="glass rounded-2xl p-1 flex">
                        <button
                            onClick={() => setMode('text')}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all ${mode === 'text' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            <Sparkles className="h-4 w-4" /> Text to Video
                        </button>
                        <button
                            onClick={() => setMode('image')}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all ${mode === 'image' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            <ImageIcon className="h-4 w-4" /> Image to Video
                        </button>
                    </div>

                    {/* Image Upload Area */}
                    {mode === 'image' && (
                        <div className="glass rounded-2xl p-4">
                            <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-3">
                                Starting Image
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                            />
                            {imageUrl ? (
                                <div className="relative h-32 w-full rounded-xl overflow-hidden group">
                                    <Image src={imageUrl} alt="Upload" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white"
                                            title="Change image"
                                        >
                                            <Upload className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setImageUrl(null)}
                                            className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/40"
                                            title="Remove"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-full h-32 border-2 border-dashed border-white/[0.08] rounded-xl flex flex-col items-center justify-center text-white/40 hover:text-white/60 hover:bg-white/[0.02] hover:border-white/[0.15] transition-all disabled:opacity-50"
                                >
                                    {uploading ? (
                                        <Loader2 className="h-6 w-6 animate-spin mb-2" />
                                    ) : (
                                        <>
                                            <Upload className="h-6 w-6 mb-2" />
                                            <span className="text-xs">Click to upload image</span>
                                            <span className="text-[10px] mt-1 opacity-50">JPG, PNG up to 5MB</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Prompt */}
                    <div className="glass rounded-2xl p-4">
                        <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-2">
                            {mode === 'text' ? 'Video Description' : 'Motion Instructions (Optional)'}
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleGenerate(); }}
                            placeholder={mode === 'text' ? 'A cinematic shot of a futuristic city in the rain...' : 'Describe how the image should animate (e.g., pan right, gentle waves)...'}
                            rows={4}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 resize-none"
                        />
                    </div>

                    {/* Settings Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Duration */}
                        <div className="glass rounded-2xl p-4">
                            <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-3">
                                Duration
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {[5, 10].map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setDuration(d as 5 | 10)}
                                        className={`py-2 rounded-lg text-xs font-medium transition-all ${duration === d
                                                ? 'bg-pink-500/20 border border-pink-500/50 text-pink-300'
                                                : 'bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/70'
                                            }`}
                                    >
                                        {d}s
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Aspect Ratio */}
                        <div className="glass rounded-2xl p-4">
                            <label className="text-xs text-white/40 uppercase tracking-wider font-medium block mb-3">
                                Aspect Ratio
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {['16:9', '9:16', '1:1'].map((ar) => (
                                    <button
                                        key={ar}
                                        onClick={() => setAspectRatio(ar as any)}
                                        className={`py-2 rounded-lg text-[10px] font-medium transition-all ${aspectRatio === ar
                                                ? 'bg-pink-500/20 border border-pink-500/50 text-pink-300'
                                                : 'bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/70'
                                            }`}
                                    >
                                        {ar}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={generating || (mode === 'image' && !imageUrl) || (mode === 'text' && !prompt.trim())}
                        className="w-full h-12 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold shadow-lg shadow-pink-500/20 transition-all"
                    >
                        {generating ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Rendering Video...</>
                        ) : (
                            <><Play className="h-4 w-4 mr-2" /> Generate Video • {cost} Credits</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
