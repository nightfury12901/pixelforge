import { ArrowRight } from 'lucide-react';

export function Features() {
    return (
        <section id="features" className="py-24 bg-[#09090b] relative border-t border-white/5 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 animate-fadeInUp max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4 text-white font-display tracking-tight">
                        Explore AI-Powered Tools for Image Editing
                    </h2>
                    <p className="text-lg text-white/50">
                        Go beyond a simple AI image generator with PixelForge's AI tools—fine-tune every detail of your creations.
                    </p>
                </div>

                {/* 12-column Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">

                    {/* Card 1: Background Remover (Col 5) */}
                    <div className="lg:col-span-5 bg-[#0f0f11] rounded-3xl border border-white/5 overflow-hidden flex flex-col relative group">
                        {/* Glow */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="p-8 pb-0 relative z-10">
                            <h3 className="text-xl font-bold text-white mb-3">Background Remover</h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                Remove background in a click effortlessly. Isolate subjects with surgical precision for clean product shots.
                            </p>
                        </div>

                        <div className="mt-8 flex justify-center items-end gap-4 px-6 relative h-[320px] overflow-hidden">
                            {/* Fake Original Image */}
                            <div className="w-1/2 h-[90%] rounded-t-2xl bg-zinc-800 border border-white/10 relative overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-500">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80" alt="Original" className="w-full h-full object-cover" />
                                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white/80 font-medium">Original</div>
                            </div>
                            {/* Fake Removed Background Image */}
                            <div className="w-1/2 h-[90%] rounded-t-2xl border border-white/10 relative overflow-hidden transform group-hover:-translate-y-4 transition-transform duration-500" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '10px 10px', backgroundColor: '#18181b' }}>
                                {/* Using mask-image or just a tight crop to simulate bg removal */}
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80" alt="Removed" className="w-full h-full object-cover mix-blend-screen opacity-90 contrast-125" />
                                <div className="absolute top-3 left-3 bg-cyan-500/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-medium">Removed</div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Image Upscaler (Col 7) */}
                    <div className="lg:col-span-7 bg-[#0f0f11] rounded-3xl border border-white/5 overflow-hidden flex flex-col md:flex-row relative group">
                        {/* Glow */}
                        <div className="absolute inset-0 bg-gradient-to-bl from-blue-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="p-8 w-full md:w-[45%] flex flex-col justify-center z-10">
                            <h3 className="text-xl font-bold text-white mb-3">4K Image Upscaler</h3>
                            <p className="text-white/50 text-sm leading-relaxed mb-4">
                                Our AI upscaling technology can deliver crisp and clear images, significantly enhancing the detail and quality of your photos.
                            </p>
                            <p className="text-white/50 text-sm leading-relaxed hidden sm:block">
                                It upgrades the image resolution while enlarging the picture to ensure a clear and vivid visual without losing original textures.
                            </p>
                        </div>

                        <div className="w-full md:w-[55%] relative min-h-[300px] bg-zinc-900 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&w=800&q=80" alt="Upscaled" className="w-full h-full object-cover" />
                            {/* Blurry Left Side to simulate before/after slider */}
                            <div className="absolute inset-0 w-1/2 overflow-hidden border-r-2 border-white">
                                <img src="https://images.unsplash.com/photo-1540331547168-8b63109225b7?auto=format&fit=crop&w=800&q=80" alt="Blurry" className="w-full h-full object-cover max-w-[200%] blur-sm" />
                                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white/80 font-medium z-10">Original</div>
                            </div>
                            <div className="absolute top-4 right-4 bg-blue-500/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-medium z-10">4K Enhanced</div>
                            {/* Slider handle */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                                <div className="w-1 h-3 bg-zinc-300 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: AI Style Transfer (Col 7) */}
                    <div className="lg:col-span-7 bg-[#0f0f11] rounded-3xl border border-white/5 overflow-hidden flex flex-col relative group">
                        {/* Glow */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="p-8 pb-4 relative z-10">
                            <h3 className="text-xl font-bold text-white mb-3">AI Style Transfer</h3>
                            <p className="text-white/50 text-sm leading-relaxed max-w-xl">
                                Bring basic sketches or standard photos to life with vibrant, natural colors. Describe your stylistic ideas, and our cutting-edge AI will give you stunning results.
                            </p>
                        </div>

                        <div className="p-8 pt-0 flex flex-col sm:flex-row items-center gap-6 relative z-10 mt-auto">
                            <div className="w-full sm:w-1/3 aspect-square rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
                                <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=500&q=80" className="w-full h-full object-cover grayscale opacity-70" alt="Sketch" />
                            </div>

                            <ArrowRight className="w-6 h-6 text-white/20 sm:rotate-0 rotate-90 shrink-0" />

                            <div className="w-full sm:w-1/3 aspect-square rounded-2xl overflow-hidden border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-shadow">
                                <img src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=500&q=80" className="w-full h-full object-cover" alt="Render 1" />
                            </div>

                            <div className="w-full sm:w-1/3 aspect-square rounded-2xl overflow-hidden border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-shadow hidden sm:block">
                                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80" className="w-full h-full object-cover" alt="Render 2" />
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Image Reference (Col 5) */}
                    <div className="lg:col-span-5 bg-[#0f0f11] rounded-3xl border border-white/5 overflow-hidden flex flex-col relative group">
                        {/* Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="p-8 pb-4 relative z-10">
                            <h3 className="text-xl font-bold text-white mb-3">Image Reference</h3>
                            <p className="text-white/50 text-sm leading-relaxed">
                                Preserve facial consistency across generations. Use character references to easily create consistent avatars and thematic artworks from a single photo.
                            </p>
                        </div>

                        <div className="p-8 pt-0 flex justify-between items-center relative z-10 mt-auto gap-4">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" alt="Reference Face" />
                                </div>
                                <span className="text-xs font-semibold text-white/50 flex items-center gap-1">Character Ref <ArrowRight className="w-3 h-3" /></span>
                            </div>

                            <div className="flex-1 max-w-[180px] aspect-square rounded-2xl overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-500 origin-right">
                                <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" alt="Stylized Art" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
