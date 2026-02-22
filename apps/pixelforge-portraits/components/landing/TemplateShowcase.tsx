import { Sparkles } from 'lucide-react';

const sampleStyles = [
    { name: 'Bollywood Glamour', category: 'Trending', color: 'from-pink-500 to-rose-600', image: 'https://images.unsplash.com/photo-1615886737513-4c5eb445749f?q=80&w=1470&auto=format&fit=crop' },
    { name: 'LinkedIn Professional', category: 'Professional', color: 'from-blue-500 to-indigo-600', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1587&auto=format&fit=crop' },
    { name: 'Royal Mughal', category: 'Indian', color: 'from-amber-500 to-orange-600', image: 'https://images.unsplash.com/photo-1583391733958-6902d13b4db2?q=80&w=1374&auto=format&fit=crop' },
    { name: 'Neon Cyberpunk', category: 'Artistic', color: 'from-cyan-400 to-violet-600', image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1470&auto=format&fit=crop' },
    { name: 'Watercolor Dream', category: 'Artistic', color: 'from-teal-400 to-blue-500', image: 'https://images.unsplash.com/photo-1518382473041-e94d805dd00f?q=80&w=1470&auto=format&fit=crop' },
    { name: 'Desi Wedding', category: 'Indian', color: 'from-rose-500 to-pink-600', image: 'https://images.unsplash.com/photo-1583391265517-35bbbd0e1eb8?q=80&w=1374&auto=format&fit=crop' },
    { name: 'Studio Headshot', category: 'Professional', color: 'from-slate-500 to-gray-600', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1528&auto=format&fit=crop' },
    { name: 'Pop Art', category: 'Artistic', color: 'from-yellow-400 to-red-500', image: 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?q=80&w=1530&auto=format&fit=crop' },
];

export function TemplateShowcase() {
    return (
        <section className="py-24 bg-[#09090b] relative border-t border-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 animate-fadeInUp">
                    <span className="text-sm font-semibold text-violet-400 tracking-wider">TEMPLATES</span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4 text-white font-display tracking-tight">Endless Possibilities</h2>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto">
                        From Bollywood glamour to Corporate headshots. Discover our growing library of templates.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
                    {sampleStyles.map((style, i) => (
                        <div
                            key={style.name}
                            className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer animate-fadeInUp"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${style.color} opacity-40 mix-blend-color z-10`} />

                            {/* Template Image */}
                            <img
                                src={style.image}
                                alt={style.name}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300 z-10" />

                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/10 z-20">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20">
                                <p className="text-white font-bold text-lg leading-tight tracking-tight mb-1">{style.name}</p>
                                <p className="text-white/80 text-sm font-medium">{style.category}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-center text-white/30 mt-12 text-sm">
                    Preview styles — your uploaded photos will replace these placeholders
                </p>
            </div>
        </section>
    );
}
