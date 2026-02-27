export function Features() {
    return (
        <section id="features" className="py-24 bg-[#09090b] relative border-t border-white/5 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 animate-fadeInUp max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4 text-white font-display tracking-tight">
                        Everything You Need for the Perfect Portrait
                    </h2>
                </div>

                {/* 12-column Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">

                    {/* Card 1: AI Portrait Generation (Col 12) */}
                    <div className="lg:col-span-12 bg-[#0f0f11] rounded-3xl border border-white/5 overflow-hidden flex flex-col md:flex-row relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="p-8 w-full md:w-[45%] flex flex-col justify-center z-10">
                            <h3 className="text-2xl font-bold text-white mb-3">AI Portrait Generation</h3>
                            <p className="text-white/50 text-base leading-relaxed mb-4">
                                Upload your selfie, pick a style, get a stunning portrait in seconds.
                            </p>
                        </div>
                        <div className="w-full md:w-[55%] relative min-h-[300px] overflow-hidden flex items-center justify-center bg-black">
                            <div className="flex gap-4 items-center">
                                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" alt="Selfie" className="w-32 h-32 rounded-full object-cover border-4 border-white/10" />
                                <span className="text-white/30 text-2xl font-light">→</span>
                                <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80" alt="AI Portrait" className="w-40 h-40 rounded-2xl object-cover border-4 border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.3)]" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Background Remover (Col 5) */}
                    <div className="lg:col-span-5 bg-[#0f0f11] rounded-3xl border border-white/5 overflow-hidden flex flex-col relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="p-8 pb-0 relative z-10">
                            <h3 className="text-xl font-bold text-white mb-3">Background Remover</h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                Isolate your subject with one click. Perfect for LinkedIn and profile pics.
                            </p>
                        </div>
                        <div className="mt-8 flex justify-center items-end gap-4 px-6 relative h-[320px] overflow-hidden">
                            <div className="w-1/2 h-[90%] rounded-t-2xl bg-zinc-800 border border-white/10 relative overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-500">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80" alt="Original" className="w-full h-full object-cover" />
                                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white/80 font-medium">Original</div>
                            </div>
                            <div className="w-1/2 h-[90%] rounded-t-2xl border border-white/10 relative overflow-hidden transform group-hover:-translate-y-4 transition-transform duration-500" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '10px 10px', backgroundColor: '#18181b' }}>
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80" alt="Removed" className="w-full h-full object-cover mix-blend-screen opacity-90 contrast-125" />
                                <div className="absolute top-3 left-3 bg-cyan-500/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-medium">Removed</div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Image Upscaler (Col 7) */}
                    <div className="lg:col-span-7 bg-[#0f0f11] rounded-3xl border border-white/5 overflow-hidden flex flex-col md:flex-row relative group">
                        <div className="absolute inset-0 bg-gradient-to-bl from-blue-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="p-8 w-full md:w-[45%] flex flex-col justify-center z-10">
                            <h3 className="text-xl font-bold text-white mb-3">4K Enhancer</h3>
                            <p className="text-white/50 text-sm leading-relaxed mb-4">
                                Upscale and sharpen every portrait to print-quality resolution.
                            </p>
                        </div>
                        <div className="w-full md:w-[55%] relative min-h-[300px] bg-zinc-900 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&w=800&q=80" alt="Upscaled" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 w-1/2 overflow-hidden border-r-2 border-white">
                                <img src="https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&w=800&q=80" alt="Blurry" className="w-full h-full object-cover max-w-[200%] blur-sm" />
                                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white/80 font-medium z-10">Original</div>
                            </div>
                            <div className="absolute top-4 right-4 bg-blue-500/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-medium z-10">4K Enhanced</div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                                <div className="w-1 h-3 bg-zinc-300 rounded-full" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
