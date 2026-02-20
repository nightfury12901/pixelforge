import { Image, Wand2, Eraser, Chrome, Zap, Shield } from 'lucide-react';

const features = [
    {
        icon: Image,
        title: '25+ Trending AI Styles',
        description: 'From Bollywood glamour to LinkedIn headshots. New styles added weekly.',
        color: '#8b5cf6',
    },
    {
        icon: Wand2,
        title: 'One-Click AI Enhance',
        description: 'Upscale any image to 4K quality with AI-powered super resolution.',
        color: '#3b82f6',
    },
    {
        icon: Eraser,
        title: 'Background Removal',
        description: 'Remove backgrounds instantly. Perfect for product photos & headshots.',
        color: '#22c55e',
    },
    {
        icon: Chrome,
        title: 'Free Chrome Extension',
        description: 'Extract AI prompts from any image on the web. 10 free prompts/day.',
        color: '#f97316',
    },
    {
        icon: Zap,
        title: 'Lightning Fast',
        description: 'Get results in under 30 seconds. No more waiting for slow AI models.',
        color: '#eab308',
    },
    {
        icon: Shield,
        title: 'Privacy First',
        description: 'Your photos are processed securely and never stored without permission.',
        color: '#ec4899',
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-[#0E0E12] relative">
            {/* Subtle separator */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="container mx-auto px-4">
                <div className="text-center mb-14">
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Features</span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-white">Everything You Need for Viral Content</h2>
                    <p className="text-lg text-white/40 max-w-2xl mx-auto">
                        Professional AI tools designed for Indian creators, influencers, and businesses.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/[0.12] rounded-2xl p-6 transition-all duration-200"
                        >
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}25` }}
                            >
                                <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
                            </div>
                            <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
