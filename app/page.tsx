import type { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { TemplateShowcase } from '@/components/landing/TemplateShowcase';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'PixelForge AI — AI Portrait Generator, Image Enhancer & Background Remover',
    description:
        'Create viral AI portraits in 25+ Instagram-trending styles. Used by 10,000+ Indian creators. AI image enhancer, background remover & free Chrome extension.',
    keywords: [
        'AI portrait generator',
        'AI headshot generator India',
        'Instagram AI portraits',
        'free AI image enhancer',
        'AI photo upscaler online',
        'trending AI portraits',
        'LinkedIn headshot AI',
        'AI background remover',
    ],
};

export default function HomePage() {
    return (
        <main className="bg-[#0E0E12] min-h-screen">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-[#0E0E12]/80 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-r from-violet-600 to-violet-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">PF</span>
                        </div>
                        <span className="font-display font-bold text-xl text-white">PixelForge</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/40">
                        <a href="#features" className="hover:text-white/80 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white/80 transition-colors">How It Works</a>
                        <a href="#pricing" className="hover:text-white/80 transition-colors">Pricing</a>
                        <a href="#faq" className="hover:text-white/80 transition-colors">FAQ</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/auth/login"
                            className="text-sm font-medium text-white/40 hover:text-white/80 transition-colors"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl transition-colors"
                            style={{ boxShadow: '0 0 16px rgba(139,92,246,0.3)' }}
                        >
                            Sign Up Free
                        </Link>
                    </div>
                </div>
            </nav>

            <Hero />
            <Features />
            <HowItWorks />
            <TemplateShowcase />
            <Pricing />
            <FAQ />
            <CTA />

            {/* Footer */}
            <footer className="border-t border-white/[0.06] py-12 bg-[#0A0A0F]">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-violet-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">PF</span>
                                </div>
                                <span className="font-display font-bold text-white">PixelForge AI</span>
                            </div>
                            <p className="text-sm text-white/30">
                                AI-powered portrait generator for Indian creators and businesses.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3 text-sm text-white/60">Product</h4>
                            <ul className="space-y-2 text-sm text-white/30">
                                <li><a href="#features" className="hover:text-white/60 transition-colors">Features</a></li>
                                <li><Link href="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link></li>
                                <li><a href="#" className="hover:text-white/60 transition-colors">Chrome Extension</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3 text-sm text-white/60">Support</h4>
                            <ul className="space-y-2 text-sm text-white/30">
                                <li><a href="#faq" className="hover:text-white/60 transition-colors">FAQ</a></li>
                                <li><a href="mailto:support@pixelforge.ai" className="hover:text-white/60 transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3 text-sm text-white/60">Connect</h4>
                            <ul className="space-y-2 text-sm text-white/30">
                                <li><a href="https://twitter.com/pixelforgeai" className="hover:text-white/60 transition-colors" target="_blank" rel="noopener">Twitter/X</a></li>
                                <li><a href="https://instagram.com/pixelforgeai" className="hover:text-white/60 transition-colors" target="_blank" rel="noopener">Instagram</a></li>
                                <li><a href="https://youtube.com/@pixelforgeai" className="hover:text-white/60 transition-colors" target="_blank" rel="noopener">YouTube</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/20">
                        <p>© 2026 PixelForge AI. All rights reserved.</p>
                        <p>Made with ❤️ in India</p>
                    </div>
                </div>
            </footer>
        </main>
    );
}
