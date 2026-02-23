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
            {/* Coming Soon Placeholder */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-20">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <ImageIcon className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 animate-pulse">
                    Background Removal
                </h2>
                <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 text-sm font-semibold mb-6">
                    Coming Soon 🚀
                </div>
                <p className="text-white/60 max-w-md mx-auto text-lg leading-relaxed">
                    We're currently upgrading our background removal AI models to deliver pixel-perfect, lightning-fast cutouts. Check back shortly for the ultimate upgrade!
                </p>
            </div>
        </div>
    );
}
