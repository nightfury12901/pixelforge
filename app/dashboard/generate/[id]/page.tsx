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
import { ProcessingStatus } from '@/components/tools/ProcessingStatus';
import { imageToBase64 } from '@/lib/utils';
import type { PortraitTemplate } from '@/lib/types';

export default function GeneratePage() {
    const params = useParams();
    const router = useRouter();
    const [template, setTemplate] = useState<PortraitTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [generationId, setGenerationId] = useState<string | null>(null);

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
            const res = await fetch('/api/tools/portrait', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ template_id: template.id, image_base64: base64 }),
            });

            const data = await res.json();
            if (!res.ok) {
                if (res.status === 402) return router.push('/pricing');
                throw new Error(data.error || 'Failed');
            }

            setGenerationId(data.data.generation_id);
            toast.success('Generating your portrait...');
        } catch (err: any) {
            toast.error(err.message);
            setProcessing(false);
        }
    };

    const handleComplete = () => {
        setProcessing(false);
        router.push('/dashboard/history');
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!template) return null;

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
                    {processing && generationId ? (
                        <div className="bg-gray-900/50 border border-white/10 rounded-3xl p-8 flex-1 flex flex-col items-center justify-center text-center">
                            <ProcessingStatus
                                generationId={generationId}
                                templatePreview={template.preview_image_url}
                                onComplete={handleComplete}
                            />
                        </div>
                    ) : (
                        <div className="space-y-8 bg-gray-900/30 border border-white/5 rounded-3xl p-6 lg:p-8 flex-1">
                            <div>
                                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-primary" /> Upload Photo
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Best results come from clear, well-lit selfies looking at the camera.
                                </p>

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
                                    <span>Cost</span>
                                    <span className="font-medium text-white">1 Credit</span>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full text-lg h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20"
                                    disabled={!uploadedImage}
                                    onClick={handleGenerate}
                                >
                                    <Wand2 className="h-5 w-5 mr-2" />
                                    Generate Portrait
                                </Button>
                                <p className="text-xs text-center text-muted-foreground mt-3">
                                    Read our <a href="#" className="underline">Terms of Service</a> regarding AI generation.
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
