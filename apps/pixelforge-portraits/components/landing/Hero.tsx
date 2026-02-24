'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Sparkles, Wand2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Hero() {
    const [prompt, setPrompt] = useState('Corporate headshot in Mumbai');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const router = useRouter(); // Keep router if it's used elsewhere, though the original handleGenerate is removed.

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt || isGenerating) return;

        setIsGenerating(true);
        // Reset image if generating a new one
        setGeneratedImage(null);

        try {
            const seed = Math.floor(Math.random() * 1000000);
            const encodedPrompt = encodeURIComponent(prompt);
            const pollUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=1024&nologo=true&seed=${seed}&model=flux`;

            // Preload the image so it doesn't show broken while loading
            const img = new globalThis.Image();
            img.src = pollUrl;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error('Failed to load image'));
            });

            setGeneratedImage(pollUrl);
        } catch (error) {
            console.error(error);
            // Fallback for demo if the generation fails
            setGeneratedImage('https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1470&auto=format&fit=crop');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <section className="relative min-h-[90vh] flex items-center bg-[#09090b] overflow-hidden">
            {/* Video Background */}
            <video
                playsInline
                autoPlay
                muted
                loop
                className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
            >
                <source src="https://cdn.pixabay.com/video/2023/06/18/167732-837330277_large.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/60 via-[#09090b]/80 to-[#09090b] pointer-events-none" />

            <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-12 relative z-10">

                {/* Left Content Area (Text) */}
                <div className="flex-1 max-w-2xl animate-fadeInUp">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-6">
                        <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                        AI Creative Studio for Indian Creators
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight font-display">
                        Create Viral <br />
                        <span className="text-gradient">AI Portraits</span>
                        <br />in Seconds.
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg text-white/50 mb-8 max-w-xl leading-relaxed">
                        Generate stunning HD portraits for any occasion—from Diwali and Valentine's to birthdays and professional headshots. Includes 25+ Instagram-trending styles, background remover & 4K enhancer.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap items-center gap-4">
                        <Link href="/auth/signup">
                            <button className="h-12 px-6 rounded-xl text-white font-semibold flex items-center gap-2 bg-white/10 hover:bg-white/15 transition-colors border border-white/10">
                                Get Started Free
                            </button>
                        </Link>
                        <Link href="/pricing">
                            <button className="h-12 px-6 rounded-xl text-white/50 hover:text-white/90 font-medium transition-colors">
                                View Pricing
                            </button>
                        </Link>
                    </div>

                    {/* Mini Stats */}
                    <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/10">
                        <div>
                            <div className="text-xl font-bold text-white">10K+</div>
                            <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Creators</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">25+</div>
                            <div className="text-xs text-white/40 uppercase tracking-widest mt-1">AI Styles</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">4.8★</div>
                            <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Rating</div>
                        </div>
                    </div>
                </div>

                {/* Right Content Area (Interactive Generator Preview) */}
                <div className="flex-1 w-full max-w-lg animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-[#121214] rounded-2xl border border-white/10 p-2 shadow-2xl relative overflow-hidden">

                        {/* Fake Browser Header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 mb-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-white/10" />
                                <div className="w-3 h-3 rounded-full bg-white/10" />
                                <div className="w-3 h-3 rounded-full bg-white/10" />
                            </div>
                            <div className="text-xs text-white/30 ml-2 font-mono">pixelforge.ai/generate</div>
                        </div>

                        {/* Interactive UI */}
                        <div className="p-4">
                            <form onSubmit={handleGenerate} className="relative">
                                <div className="flex bg-black rounded-lg p-1 border border-white/10 relative">
                                    <input
                                        type="text"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe your portrait..."
                                        className="w-full bg-transparent text-white px-4 outline-none text-sm placeholder:text-white/30"
                                        disabled={isGenerating}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isGenerating || !prompt}
                                        className="bg-white text-black px-4 py-2 rounded-md font-medium text-sm disabled:opacity-50 transition-opacity flex items-center gap-2 whitespace-nowrap"
                                    >
                                        {isGenerating ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Cooking...</>
                                        ) : (
                                            <><Sparkles className="w-4 h-4" /> Generate</>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {['Corporate headshot in Mumbai', 'Cinematic cyberpunk neon', 'Royal Indian wedding'].map((tag) => (
                                    < button
                                        key={tag}
                                        type="button"
                                        onClick={() => setPrompt(tag)}
                                        className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            {/* Image Display */}
                            <div className="mt-4 aspect-[4/5] bg-[#0A0A0C] border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden group">
                                {generatedImage ? (
                                    <img
                                        src={generatedImage}
                                        alt="Generated Portrait"
                                        className="w-full h-full object-cover transition-opacity duration-300"
                                    />
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-t from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="text-center">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                                <Sparkles className="h-5 w-5 text-white/20" />
                                            </div>
                                            <p className="text-sm text-white/30 font-medium">Hit generate to see magic</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section >
    );
}
