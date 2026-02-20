import { Sparkles } from 'lucide-react';

const sampleStyles = [
    { name: 'Bollywood Glamour', category: 'Trending', color: 'from-pink-500 to-rose-600' },
    { name: 'LinkedIn Professional', category: 'Professional', color: 'from-blue-500 to-indigo-600' },
    { name: 'Royal Mughal', category: 'Indian', color: 'from-amber-500 to-orange-600' },
    { name: 'Neon Cyberpunk', category: 'Artistic', color: 'from-cyan-400 to-violet-600' },
    { name: 'Watercolor Dream', category: 'Artistic', color: 'from-teal-400 to-blue-500' },
    { name: 'Desi Wedding', category: 'Indian', color: 'from-rose-500 to-pink-600' },
    { name: 'Studio Headshot', category: 'Professional', color: 'from-slate-500 to-gray-600' },
    { name: 'Pop Art', category: 'Artistic', color: 'from-yellow-400 to-red-500' },
];

export function TemplateShowcase() {
    return (
        <section className="py-24 bg-[#0A0A0F] relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="container mx-auto px-4">
                <div className="text-center mb-14">
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Templates</span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-white">25+ Trending AI Styles</h2>
                    <p className="text-lg text-white/40 max-w-2xl mx-auto">
                        From Bollywood to Corporate — we have a style for every occasion. New styles added weekly.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
                    {sampleStyles.map((style) => (
                        <div
                            key={style.name}
                            className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${style.color}`} />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />

                            <div className="absolute top-3 right-3 bg-white/15 backdrop-blur-sm rounded-full p-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-white" />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                                <p className="text-white font-semibold text-sm leading-tight">{style.name}</p>
                                <p className="text-white/60 text-xs mt-0.5">{style.category}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-center text-white/25 mt-8 text-sm">
                    Preview styles — your uploaded photos will replace these placeholders
                </p>
            </div>
        </section>
    );
}
