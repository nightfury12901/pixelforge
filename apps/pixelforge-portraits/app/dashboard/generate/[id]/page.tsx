'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Sparkles, Upload, ArrowLeft, Wand2, Loader2, ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageUploader } from '@/components/tools/ImageUploader';
import { AdUnit } from '@/components/AdUnit';
import { imageToBase64 } from '@/lib/utils';
import type { PortraitTemplate } from '@/lib/types';
import { AlertCircle } from 'lucide-react';

export default function GeneratePage() {
    const params = useParams();
    const router = useRouter();
    const [template, setTemplate] = useState<PortraitTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [tier, setTier] = useState<string | null>(null);
    const [isBatch, setIsBatch] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function fetchTemplate() {
            if (!params.id) return;

            const { data, error } = await supabase
                .from('portrait_templates')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) {
                toast.error('Template not found');
                router.push('/dashboard/portraits');
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profileData } = await supabase.from('profiles').select('tier').eq('id', user.id).single();
                setTier(profileData?.tier || 'free');
            }

            setTemplate(data);
            setLoading(false);
        }
        fetchTemplate();
    }, [params.id, router, supabase]);

    const handleImageUpload = (file: File) => {
        setUploadedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleGenerate = async () => {
        if (!uploadedImage || !template) return;
        setProcessing(true);

        try {
            const base64 = await imageToBase64(uploadedImage);
            // Strip the data URI prefix if present — API expects raw base64
            const rawBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

            const res = await fetch('/api/tools/portrait', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId: template.id,      // ← API expects camelCase templateId
                    userFaceBase64: rawBase64,     // ← API expects userFaceBase64
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                if (res.status === 402) return router.push('/pricing');
                throw new Error(data.error || 'Generation failed');
            }

            // API returns imageUrl directly (synchronous)
            if (data.imageUrl) {
                toast.success('Portrait generated!');
                // Store result in session storage and redirect to result page
                sessionStorage.setItem('portrait_result', JSON.stringify({
                    imageUrl: data.imageUrl,
                    templateName: template.name,
                    templatePreview: template.preview_image_url,
                }));
                router.push('/dashboard/portraits/result');
            } else {
                throw new Error('No image returned');
            }
        } catch (err: any) {
            toast.error(err.message);
            setProcessing(false);
        }
    };


    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!template) return null;

    const isCoupleTemplate =
        template.name.toLowerCase().includes('couple') ||
        template.name.toLowerCase().includes("valentine") ||
        template.name.toLowerCase().includes('holi') ||
        template.name.toLowerCase().includes('diwali');

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 pb-32">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        Generate Portrait
                        <Badge variant="secondary" className="text-primary border-primary/20 bg-primary/5">
                            {template.name}
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm">Create a professional AI portrait in styles</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Col: Template Visuals */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="relative aspect-[3/4] w-full max-w-sm mx-auto lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900/50">
                        <Image
                            src={template.preview_image_url}
                            alt={template.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <h2 className="text-white text-xl font-semibold mb-2">{template.name}</h2>
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                                    {template.category}
                                </Badge>
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                                    {template.aspect_ratio || '3:4'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-yellow-400" /> Style Details
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {template.description || 'This premium style delivers high-quality AI portraits with professional lighting and composition.'}
                        </p>
                    </div>
                </motion.div>

                {/* Right Col: Action Area */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
                    {processing ? (
                        <div className="bg-gray-900/50 border border-white/10 rounded-3xl p-8 flex-1 flex flex-col items-center justify-center text-center gap-4">
                            <div className="relative w-14 h-14">
                                <Loader2 className="h-14 w-14 animate-spin text-violet-500/30" />
                                <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-violet-400" />
                            </div>
                            <p className="text-white/70 font-medium">Generating your portrait...</p>
                            <p className="text-white/30 text-sm">This usually takes 15–45 seconds</p>
                        </div>
                    ) : (
                        <div className="space-y-8 bg-gray-900/30 border border-white/5 rounded-3xl p-6 lg:p-8 flex-1">
                            <div>
                                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-primary" /> Upload Photo
                                </h3>

                                {isCoupleTemplate ? (
                                    <div className="mb-6 bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 flex items-start gap-3 text-pink-200">
                                        <AlertCircle className="h-5 w-5 text-pink-400 shrink-0 mt-0.5" />
                                        <p className="text-sm font-medium leading-relaxed">
                                            This is a couple template! For the best result, upload a single photo that clearly shows <strong>both faces</strong> looking at the camera.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Best results come from clear, well-lit selfies looking at the camera.
                                    </p>
                                )}

                                {!uploadedImage ? (
                                    <div className="h-64 border-dashed border-2 border-white/10 hover:border-primary/50 transition-colors rounded-2xl bg-white/5 flex flex-col items-center justify-center overflow-hidden">
                                        <ImageUploader
                                            onImageUpload={handleImageUpload}
                                            maxSize={10 * 1024 * 1024}
                                        />
                                    </div>
                                ) : (
                                    <div className="relative h-64 rounded-2xl overflow-hidden bg-black/50 border border-white/10 group">
                                        <Image src={previewUrl!} alt="Upload" fill className="object-cover opacity-80" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="destructive" size="sm" onClick={() => { setUploadedImage(null); setPreviewUrl(null); }}>
                                                Remove Photo
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-white/10 mt-auto">
                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                    <span>Generation Cost</span>
                                    <span className="font-medium text-white">{isBatch ? '10 Credits' : '1 Credit'}</span>
                                </div>
                                <div className="flex items-center justify-between mb-4 bg-white/5 p-3 rounded-xl border border-white/10">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-white flex items-center gap-2">Batch Processing</span>
                                        <span className="text-xs text-white/40">Generate 10 variations at once</span>
                                    </div>
                                    {tier === 'pro' ? (
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={isBatch} onChange={(e) => setIsBatch(e.target.checked)} />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                        </label>
                                    ) : (
                                        <span onClick={() => router.push('/pricing')} className="text-[10px] text-violet-400 cursor-pointer hover:underline bg-violet-500/10 px-2 py-1 rounded border border-violet-500/20">Requires Pro</span>
                                    )}
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full text-lg h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20"
                                    disabled={!uploadedImage || processing}
                                    onClick={handleGenerate}
                                >
                                    {processing ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Wand2 className="h-5 w-5 mr-2" />}
                                    {isBatch ? 'Generate Batch (10)' : 'Generate Portrait'}
                                </Button>
                                <p className="text-xs text-center text-muted-foreground mt-3">
                                    Read our <a href="#" className="underline">Terms of Service</a> regarding AI generation.
                                </p>

                                <AdUnit slotId="PORTRAIT_GEN" format="auto" isFreeTier={tier === 'free'} className="mt-6" />
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
