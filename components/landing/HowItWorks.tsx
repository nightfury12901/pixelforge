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
        <section id="how-it-works" className="py-24 bg-[#0E0E12] relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="container mx-auto px-4">
                <div className="text-center mb-14">
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">How It Works</span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4 text-white">Three Steps to Viral Portraits</h2>
                    <p className="text-lg text-white/40 max-w-2xl mx-auto">
                        No design skills needed. Just upload, choose, and download.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {steps.map((step, i) => (
                        <div key={step.step} className="relative text-center group">
                            {/* Connector */}
                            {i < steps.length - 1 && (
                                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t border-dashed border-white/10" />
                            )}

                            <div
                                className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-5"
                                style={{ background: `${step.color}15`, border: `1px solid ${step.color}25` }}
                            >
                                <step.icon className="h-8 w-8" style={{ color: step.color }} />
                            </div>

                            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: step.color }}>
                                Step {step.step}
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-white">{step.title}</h3>
                            <p className="text-white/40 text-sm leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
