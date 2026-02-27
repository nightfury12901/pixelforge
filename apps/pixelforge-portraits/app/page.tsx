import type { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { TemplateShowcase } from '@/components/landing/TemplateShowcase';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'AuraShot — The Best AI Portrait Generator & Editor Online',
    description:
        'Transform your selfies into professional LinkedIn headshots and viral Instagram portraits in seconds. Try AuraShot, the top-rated AI image enhancer, background remover & free Chrome extension used by thousands of creators. Over 25+ premium styles including cinematic, corporate, and artistic.',
    keywords: [
        'AI portrait generator free',
        'professional AI headshot generator India',
        'Instagram AI portraits maker',
        'free AI image enhancer 4k',
        'AI photo upscaler online HD',
        'trending AI portraits',
        'LinkedIn headshot AI free',
        'AI background remover tool',
        'best AI image editor',
        'Midjourney alternative free',
        'turn selfie into professional photo',
        'corporate headshot AI'
    ],
    openGraph: {
        title: 'AuraShot — Premium AI Portraits & Professional Headshots',
        description: 'Generate stunning 4K AI portraits and professional LinkedIn headshots instantly without a studio. Start for free!',
        url: 'https://aurashot.in',
        siteName: 'AuraShot',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'AuraShot — Premium AI Portrait Generator',
            },
        ],
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AuraShot — Instant Professional Portraits',
        description: 'Create viral AI portraits and 4K LinkedIn headshots from your selfies. Used by thousands of creators.',
        creator: '@aurashot',
        images: ['/og-image.png'],
    },
    alternates: {
        canonical: 'https://aurashot.in',
    },
};

export default function HomePage() {
    return (
        <main className="bg-[#09090b] min-h-screen">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-[#09090b]/95 border-b border-white/5 transition-colors">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="AuraShot Logo" className="w-8 h-8 rounded-xl ring-1 ring-white/10 shadow-lg" />
                        <span className="font-display font-bold text-xl text-white tracking-tight">AuraShot</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                        <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/auth/login"
                            className="text-sm font-medium text-white/60 hover:text-white transition-colors"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="text-sm font-semibold bg-white text-black hover:bg-white/90 px-4 py-2 rounded-lg transition-colors"
                        >
                            Sign Up Free
                        </Link>
                    </div>
                </div>
            </nav>

            <Hero />
            <TemplateShowcase />
            <Testimonials />
            <HowItWorks />
            <Features />
            <Pricing />
            <FAQ />
            <CTA />

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 bg-[#09090b]">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <img src="/logo.png" alt="AuraShot Logo" className="w-8 h-8 rounded-xl ring-1 ring-white/10 shadow-lg" />
                                <span className="font-display font-bold text-white tracking-tight">AuraShot</span>
                            </div>
                            <p className="text-sm text-white/40">
                                High-performance AI portrait generation interface.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3 text-sm text-white/80 tracking-tight">Product</h4>
                            <ul className="space-y-2 text-sm text-white/40">
                                <li><a href="#features" className="hover:text-white/80 transition-colors">Features</a></li>
                                <li><Link href="/pricing" className="hover:text-white/80 transition-colors">Pricing</Link></li>
                                <li><a href="#" className="hover:text-white/80 transition-colors">Chrome Extension</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3 text-sm text-white/80 tracking-tight">Support</h4>
                            <ul className="space-y-2 text-sm text-white/40">
                                <li><a href="#faq" className="hover:text-white/80 transition-colors">FAQ</a></li>
                                <li><a href="mailto:support@aurashot.in" className="hover:text-white/80 transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-white/80 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white/80 transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3 text-sm text-white/80 tracking-tight">Connect</h4>
                            <ul className="space-y-2 text-sm text-white/40">
                                <li><a href="https://twitter.com/boilerplatLabs" className="hover:text-white/80 transition-colors" target="_blank" rel="noopener">Twitter/X</a></li>
                                <li><a href="https://instagram.com/editology.06" className="hover:text-white/80 transition-colors" target="_blank" rel="noopener">Instagram</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
