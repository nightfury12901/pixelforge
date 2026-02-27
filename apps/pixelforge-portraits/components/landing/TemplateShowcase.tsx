import { Sparkles } from 'lucide-react';

const sampleStyles = [
    { name: 'Bollywood Glamour', category: 'Trending', color: 'from-pink-500 to-rose-600', image: '/templates/bollywood.png' },
    { name: 'LinkedIn Professional', category: 'Professional', color: 'from-blue-500 to-indigo-600', image: '/templates/linkedin.png' },
    { name: 'Royal Mughal', category: 'Indian', color: 'from-amber-500 to-orange-600', image: '/templates/mughal.png' },
    { name: 'Neon Cyberpunk', category: 'Artistic', color: 'from-cyan-400 to-violet-600', image: '/templates/neon.png' },
    { name: 'Watercolor Dream', category: 'Artistic', color: 'from-teal-400 to-blue-500', image: '/templates/watercolor.png' },
    { name: 'Desi Wedding', category: 'Indian', color: 'from-rose-500 to-pink-600', image: '/templates/wedding.png' },
    { name: 'Studio Headshot', category: 'Professional', color: 'from-slate-500 to-gray-600', image: '/templates/studio.png' },
    { name: 'Pop Art', category: 'Artistic', color: 'from-yellow-400 to-red-500', image: '/templates/popart.png' },
];

export function TemplateShowcase() {
    return (
        <section className="py-24 bg-[#09090b] relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 animate-fadeInUp">
                    <span className="text-sm font-semibold text-violet-400 tracking-wider">TEMPLATES</span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4 text-white font-display tracking-tight">Pick Your Style. We Do the Rest.</h2>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto">
                        From Bollywood glamour to corporate headshots — new styles added weekly.
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

                <div className="flex justify-center mt-12 animate-fadeInUp">
                    <a href="/dashboard">
                        <button className="h-12 px-8 rounded-xl bg-white/10 text-white font-semibold flex items-center gap-2 hover:bg-white/20 transition-all border border-white/20 shadow-lg">
                            Explore All 25+ Styles <span>&rarr;</span>
                        </button>
                    </a>
                </div>
            </div>
        </section>
    );
}
