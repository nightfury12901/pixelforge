import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Priya S.',
        role: 'Marketing Manager',
        location: 'Mumbai',
        quote: "AuraShot completely changed my LinkedIn game. I uploaded a few quick selfies and instantly got back headshots that looked like I spent ₹10,000 on a studio session.",
        initials: 'PS',
        color: 'bg-violet-500'
    },
    {
        name: 'Aditya V.',
        role: 'Content Creator',
        location: 'Bengaluru',
        quote: "The Bollywood Glamour style is insane! I've been using it for my Instagram reels covers. Unbelievable precision and the background removal is magic.",
        initials: 'AV',
        color: 'bg-emerald-500'
    },
    {
        name: 'Sneha M.',
        role: 'Startup Founder',
        location: 'Delhi',
        quote: "I needed a professional headshot for an investor deck but didn't have time for a photoshoot. AuraShot gave me exactly what I needed in 2 minutes. Outstanding quality.",
        initials: 'SM',
        color: 'bg-rose-500'
    }
];

export function Testimonials() {
    return (
        <section className="py-24 bg-[#09090b] relative border-t border-white/5 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.05)_0%,transparent_50%)] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 animate-fadeInUp">
                    <span className="text-sm font-semibold text-violet-400 tracking-wider">LOVED BY CREATORS</span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4 text-white font-display tracking-tight">
                        Real Portraits. Real People.
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {testimonials.map((test, i) => (
                        <div
                            key={test.name}
                            className="bg-[#0f0f11] rounded-3xl p-8 border border-white/5 relative group hover:border-violet-500/30 transition-colors duration-300 animate-fadeInUp"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(5)].map((_, j) => (
                                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            <p className="text-white/80 text-lg leading-relaxed mb-8">
                                "{test.quote}"
                            </p>

                            <div className="flex items-center gap-4 mt-auto">
                                <div className={`w-12 h-12 rounded-full ${test.color} flex items-center justify-center font-bold text-white shadow-lg`}>
                                    {test.initials}
                                </div>
                                <div>
                                    <div className="text-white font-semibold">{test.name}</div>
                                    <div className="text-white/40 text-sm">{test.role} • {test.location}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
