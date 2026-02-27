'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'react-hot-toast';
import { AdUnit } from '@/components/AdUnit';
import Image from 'next/image';
import { ImagePlus, Wand2, Loader2, Download, Copy, Sparkles, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ASPECT_RATIOS = [
    { label: '1:1', value: '1:1', class: 'aspect-square', width: 1024, height: 1024 },
    { label: '16:9', value: '16:9', class: 'aspect-video', width: 1344, height: 768 },
    { label: '9:16', value: '9:16', class: 'aspect-[9/16]', width: 768, height: 1344 },
    { label: '4:3', value: '4:3', class: 'aspect-[4/3]', width: 1216, height: 832 },
    { label: '3:4', value: '3:4', class: 'aspect-[3/4]', width: 832, height: 1216 },
];

const STYLES = [
    { id: 'realistic', label: 'Realistic', emoji: '📸' },
    { id: 'cinematic', label: 'Cinematic', emoji: '🎬' },
    { id: 'anime', label: 'Anime', emoji: '🌸' },
    { id: 'oil-painting', label: 'Oil Painting', emoji: '🎨' },
    { id: 'watercolor', label: 'Watercolor', emoji: '💧' },
    { id: 'neon', label: 'Neon Glow', emoji: '✨' },
    { id: 'vintage', label: 'Vintage', emoji: '🏛️' },
    { id: 'none', label: 'No Style', emoji: '∅' },
];

const STYLE_SUFFIXES: Record<string, string> = {
    realistic: ', photorealistic, 8k uhd, detailed',
    cinematic: ', cinematic lighting, dramatic, film grain, anamorphic lens',
    anime: ', anime style, manga art, vibrant colors, clean lines',
    'oil-painting': ', oil on canvas, brush strokes, classical painting style, rich textures',
    watercolor: ', watercolor painting, soft edges, translucent colors, artistic',
    neon: ', neon glow, cyberpunk, synthwave, vibrant neon colors, dark background',
    vintage: ', vintage photography, film photo, retro aesthetic, sepia tones',
    none: '',
};

interface GeneratedImage {
    url: string;
    prompt: string;
    timestamp: number;
    aspectClass?: string;
}

// ─── Inner component that reads searchParams ─────────────────────────────────
function ImageGenInner() {
    const searchParams = useSearchParams();
    const [prompt, setPrompt] = useState(searchParams.get('prompt') || '');
    const [selectedAspect, setSelectedAspect] = useState(ASPECT_RATIOS[0]);
    const [selectedStyle, setSelectedStyle] = useState('realistic');
    const [loading, setLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [editsUsed, setEditsUsed] = useState(0);
    const [refineInstruction, setRefineInstruction] = useState('');
    const [refining, setRefining] = useState(false);
    const [activeRefineIdx, setActiveRefineIdx] = useState<number | null>(null);
    const [tier, setTier] = useState<string | null>(null);

    // Image Upload State
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const router = useRouter();
    const FREE_EDITS = 4;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be less than 5MB');
                return;
            }
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = (error) => reject(error);
        });
    };

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

    const buildFinalPrompt = () => {
        const suffix = STYLE_SUFFIXES[selectedStyle] || '';
        return `${prompt.trim()}${suffix}`;
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) { toast.error('Enter a prompt first'); return; }
        setLoading(true);
        try {
            const finalPrompt = buildFinalPrompt();
            let image_base64 = undefined;
            if (imageFile) {
                image_base64 = await fileToBase64(imageFile);
            }

            const res = await fetch('/api/tools/image-gen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    aspect_ratio: selectedAspect.value,
                    batch_size: 1,
                    image_base64,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 402) toast.error('Not enough credits. Please upgrade.');
                else if (res.status === 401) toast.error('Please sign in to generate images.');
                else throw new Error(data.error || 'Generation failed');
                return;
            }

            const images: string[] = data.data?.images || [];
            if (images.length > 0) {
                setGeneratedImages((prev) => [
                    ...images.map((url: string) => ({ url, prompt: data.data.enhanced_prompt || finalPrompt, timestamp: Date.now(), aspectClass: selectedAspect.class })),
                    ...prev,
                ]);
                toast.success('Image generated!');
            } else {
                toast.error('No image returned. Try again.');
            }
        } catch (err: unknown) {
            const e = err as Error;
            toast.error(e.message || 'Something went wrong');
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
            a.download = `aurashot-image-${index + 1}.png`;
            a.click();
        } catch {
            toast.error('Download failed');
        }
    };

    const handleRefine = async (sourceImage: GeneratedImage) => {
        if (!refineInstruction.trim()) { toast.error('Describe what to change'); return; }
        setRefining(true);
        try {
            const res = await fetch('/api/tools/refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_prompt: sourceImage.prompt,
                    instruction: refineInstruction,
                    edits_used: editsUsed,
                    aspect_ratio: selectedAspect.value,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 402) toast.error('Not enough credits for more edits. Need 0.5 credits.');
                else throw new Error(data.error || 'Refine failed');
                return;
            }
            const images: string[] = data.data?.images || [];
            if (images.length > 0) {
                setGeneratedImages((prev) => [
                    ...images.map((url: string) => ({ url, prompt: data.data.refined_prompt || sourceImage.prompt, timestamp: Date.now(), aspectClass: selectedAspect.class })),
                    ...prev,
                ]);
                setEditsUsed((n) => n + 1);
                setRefineInstruction('');
                setActiveRefineIdx(null);
                const wasPaid = data.data?.was_paid;
                toast.success(wasPaid ? `Refined! (0.5 credits used)` : `Refined! ${FREE_EDITS - (editsUsed + 1)} free edits remaining`);
            } else {
                toast.error('No image returned. Try again.');
            }
        } catch (err: any) {
            toast.error(err.message || 'Refine failed');
        } finally {
            setRefining(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-[340px,1fr] gap-6 w-full mx-auto h-full">

            {/* Left: Controls (Sidebar) */}
            <div className="flex flex-col gap-6 bg-[#111113] border border-white/[0.04] rounded-2xl p-5 pb-6 shadow-2xl h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar relative">

                {/* Prompt */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-white/90 font-medium flex items-center justify-between">
                        Prompt
                    </label>
                    <div className="relative group">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleGenerate(); }}
                            placeholder="A futuristic cybernetic city at night, neon lights, 8k..."
                            rows={4}
                            className="w-full bg-[#18181A] border border-white/[0.06] group-hover:border-white/[0.12] rounded-xl px-4 py-3 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 resize-none transition-all shadow-inner"
                        />
                        <button
                            className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-medium"
                            onClick={() => toast.success('Random prompt generated!')}
                        >
                            <Sparkles className="w-3 h-3" />
                            Surprise Me
                        </button>
                    </div>
                </div>

                {/* Optional Image Upload */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-white/90 font-medium">Image (Optional)</label>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                    {!previewUrl ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-24 border-2 border-dashed border-white/10 hover:border-violet-500/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#18181A]"
                        >
                            <Upload className="h-5 w-5 text-white/40 mb-2" />
                            <span className="text-xs text-white/40">Upload image to guide generation</span>
                        </div>
                    ) : (
                        <div className="relative w-full h-32 rounded-xl border border-white/10 overflow-hidden group">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => {
                                        setImageFile(null);
                                        setPreviewUrl(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/40 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Aspect Ratio */}
                <div className="flex flex-col gap-3">
                    <label className="text-sm text-white/90 font-medium">Aspect Ratio</label>
                    <div className="grid grid-cols-5 gap-1.5">
                        {ASPECT_RATIOS.map((ar) => (
                            <button
                                key={ar.value}
                                onClick={() => setSelectedAspect(ar)}
                                className={`flex flex-col items-center justify-center h-14 rounded-lg transition-all ${selectedAspect.value === ar.value
                                    ? 'bg-violet-500/10 border border-violet-500/50 text-violet-200 shadow-sm'
                                    : 'bg-[#18181A] border border-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className={`border-[1.5px] rounded-sm mb-1 ${selectedAspect.value === ar.value ? 'border-violet-400' : 'border-white/40'} ${ar.value === '1:1' ? 'w-3.5 h-3.5' :
                                    ar.value === '16:9' ? 'w-[18px] h-[10px]' :
                                        ar.value === '9:16' ? 'w-[10px] h-[18px]' :
                                            ar.value === '4:3' ? 'w-4 h-3' :
                                                'w-3 h-4'
                                    }`} />
                                <span className="text-[9px] font-semibold">{ar.value}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Style */}
                <div className="pt-2">
                    <label className="text-sm text-white font-semibold flex items-center justify-between mb-3">
                        <span>Style</span>
                        {(tier === 'starter' || tier === 'free') && (
                            <span onClick={() => router.push('/pricing')} className="text-[10px] text-violet-400 cursor-pointer hover:underline cursor-pointer bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">Upgrade to unlock all</span>
                        )}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {STYLES.map((style, i) => {
                            const isLocked = (tier === 'starter' || tier === 'free') && i > 0;
                            return (
                                <button
                                    key={style.id}
                                    disabled={isLocked}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${selectedStyle === style.id
                                        ? 'bg-violet-500/20 border border-violet-500/40 text-violet-200'
                                        : isLocked ? 'bg-[#1A1A1D] border border-white/[0.02] text-white/20 cursor-not-allowed' : 'bg-[#1A1A1D] border border-white/[0.04] text-white/50 hover:text-white/90 hover:bg-white/5'
                                        }`}
                                >
                                    <span className={`text-base ${isLocked ? 'grayscale opacity-50' : ''}`}>{style.emoji}</span>
                                    <span>{style.label}</span>
                                    {isLocked && <div className="absolute inset-0 bg-transparent cursor-not-allowed" title="Upgrade to Creator pack to unlock" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Generate Button Stickied */}
                <div className="mt-auto pt-4 border-t border-white/[0.04]">
                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                        className="w-full h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all flex items-center justify-center text-sm"
                    >
                        {loading ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                        ) : (
                            <><Wand2 className="h-4 w-4 mr-2" /> Generate Now</>
                        )}
                    </Button>
                    <p className="text-center text-[9px] text-white/30 mt-3 font-medium">
                        1 Credit / Generation • Faster processing
                    </p>

                    {/* Free tier generation ad space */}
                    <AdUnit slotId="IMAGE_GEN_CONTROLS" format="auto" isFreeTier={tier === 'free'} className="mt-4" />
                </div>
            </div>

            {/* Right: Canvas / Generated Images */}
            <div className="flex flex-col bg-[#0A0A0B] border border-white/[0.04] rounded-2xl p-6 h-[calc(100vh-120px)] shadow-2xl overflow-y-auto custom-scrollbar relative">

                {/* Header built into canvas */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Generate List</h2>
                        <p className="text-xs text-white/40 mt-1">The generated results will securely sync with your dashboard. Save your favorites.</p>
                    </div>
                </div>
                {/* Empty State */}
                {generatedImages.length === 0 && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center opacity-70"
                    >
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-[#1A1A1E] border border-white/[0.06] flex items-center justify-center shadow-lg relative z-10">
                                <ImagePlus className="h-8 w-8 text-white/30" />
                            </div>
                            <Sparkles className="absolute -top-3 -right-3 h-5 w-5 text-violet-400/50 animate-pulse" />
                        </div>
                        <h3 className="text-white/90 text-sm font-semibold mb-1">Begin your creation</h3>
                        <p className="text-white/40 text-xs mt-1 max-w-xs text-center leading-relaxed">Type a prompt in the left panel to bring your imagination to life instantly.</p>
                    </motion.div>
                )}

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass rounded-2xl flex items-center justify-center"
                        style={{ minHeight: 320 }}
                    >
                        <div className="text-center">
                            <div className="relative mx-auto w-14 h-14 mb-4">
                                <Loader2 className="h-14 w-14 animate-spin text-pink-500/30" />
                                <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-pink-400" />
                            </div>
                            <p className="text-white/50 text-sm font-medium">Generating your image...</p>
                            <p className="text-white/25 text-xs mt-1">Usually takes 5–15 seconds</p>
                        </div>
                    </motion.div>
                )}

                <AnimatePresence>
                    {generatedImages.map((img, i) => (
                        <motion.div
                            key={img.timestamp}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass rounded-2xl overflow-hidden"
                        >
                            <div className={`relative w-full ${img.aspectClass || 'aspect-square'} bg-black/30`}>
                                <img
                                    src={img.url}
                                    alt={img.prompt}
                                    className="object-cover w-full h-full absolute inset-0"
                                />
                            </div>
                            <div className="p-3 flex items-center justify-between gap-3">
                                <p className="text-xs text-white/40 line-clamp-1 flex-1">{img.prompt}</p>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(img.prompt); toast.success('Prompt copied!'); }}
                                        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/80 transition-colors"
                                        title="Copy prompt"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDownload(img.url, i)}
                                        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/80 transition-colors"
                                        title="Download"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setActiveRefineIdx(activeRefineIdx === i ? null : i)}
                                        className={`p-1.5 rounded-lg transition-colors ${activeRefineIdx === i
                                            ? 'bg-pink-500/20 text-pink-400'
                                            : 'hover:bg-white/[0.06] text-white/40 hover:text-pink-400'
                                            }`}
                                        title="Refine with AI"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Refine Panel */}
                            <AnimatePresence>
                                {activeRefineIdx === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden border-t border-white/[0.06]"
                                    >
                                        <div className="p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-medium text-white/60 flex items-center gap-1.5">
                                                    <Sparkles className="h-3 w-3 text-pink-400" />
                                                    AI Refine
                                                </p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${editsUsed < FREE_EDITS
                                                    ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                                                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                                    }`}>
                                                    {editsUsed < FREE_EDITS
                                                        ? `${FREE_EDITS - editsUsed} free edit${FREE_EDITS - editsUsed !== 1 ? 's' : ''} left`
                                                        : '0.5 credits / edit'}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    value={refineInstruction}
                                                    onChange={(e) => setRefineInstruction(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleRefine(img); }}
                                                    placeholder="e.g. make it more dramatic, add fog..."
                                                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/90 placeholder:text-white/25 focus:outline-none focus:border-pink-500/50"
                                                />
                                                <Button
                                                    onClick={() => handleRefine(img)}
                                                    disabled={refining || !refineInstruction.trim()}
                                                    className="h-auto px-3 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium disabled:opacity-40"
                                                >
                                                    {refining ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Refine'}
                                                </Button>
                                            </div>
                                            <p className="text-[10px] text-white/20">Tell the AI what to change. First {FREE_EDITS} edits are free.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div className="pb-8" />
            </div>
        </div>
    );
}

// ─── Page: wraps inner component in Suspense for useSearchParams ─────────────
export default function ImageGenPage() {
    return (
        <div className="p-6 md:p-8 pb-24 md:pb-8 w-full h-full">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                        <ImagePlus className="h-4 w-4 text-pink-400" />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Image Generator</h1>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm">
                        AI Magic
                    </span>
                </div>
                <p className="text-white/40 text-sm ml-11">
                    Type a prompt and generate stunning images in any style
                </p>
            </motion.div>

            {/* Suspense boundary for useSearchParams */}
            <Suspense fallback={
                <div className="glass rounded-2xl flex items-center justify-center" style={{ minHeight: 320 }}>
                    <Loader2 className="h-8 w-8 animate-spin text-pink-500/50" />
                </div>
            }>
                <ImageGenInner />
            </Suspense>
        </div>
    );
}
