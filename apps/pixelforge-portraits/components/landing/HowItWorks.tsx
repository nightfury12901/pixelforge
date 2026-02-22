import { Upload, Wand2, Download } from 'lucide-react';

const steps = [
    {
        step: '01',
        icon: Upload,
        title: 'Upload Your Photo',
        description: 'Drop any selfie or portrait photo. We support JPG, PNG, and WebP up to 10MB.',
        color: '#8b5cf6',
    },
    {
        step: '02',
        icon: Wand2,
        title: 'Choose a Style',
        description: 'Pick from 25+ trending AI portrait styles — Bollywood, Professional, Artistic & more.',
        color: '#3b82f6',
    },
    {
        step: '03',
        icon: Download,
        title: 'Download & Share',
        description: 'Get your AI portrait in seconds. Download in high resolution and share anywhere.',
        color: '#22c55e',
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-32 bg-[#09090b] relative border-t border-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20 animate-fadeInUp">
                    <span className="text-sm font-semibold text-violet-400 tracking-wider">WORKFLOW</span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4 text-white font-display tracking-tight">Three Steps to Viral Portraits</h2>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto">
                        No design skills needed. Just upload, choose, and download.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {steps.map((step, i) => (
                        <div key={step.step} className="relative text-center group animate-fadeInUp" style={{ animationDelay: `${i * 0.15}s` }}>
                            {/* Connector */}
                            {i < steps.length - 1 && (
                                <div className="hidden md:block absolute top-[40px] left-[60%] w-[80%] border-t border-dashed border-white/10" />
                            )}

                            <div className="w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center mb-6 bg-[#121214] border border-white/10 group-hover:bg-white/5 transition-colors relative z-10">
                                <step.icon className="h-8 w-8" style={{ color: step.color }} />
                            </div>

                            <div className="text-sm font-bold tracking-widest mb-3" style={{ color: step.color }}>
                                STEP {step.step}
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">{step.title}</h3>
                            <p className="text-white/50 text-base leading-relaxed px-4">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
