import type { Metadata } from 'next';
import { Pricing } from '@/components/landing/Pricing';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Pricing — Affordable AI Portrait Plans',
    description:
        'Choose from Free, Starter, Pro, and Lifetime plans. AI portrait generation, image enhancement, and background removal starting free. All prices in INR.',
    keywords: [
        'AI portrait pricing',
        'AI image generator pricing India',
        'cheap AI portrait generator',
        'free AI headshot generator',
    ],
};

export default function PricingPage() {
    return (
        <main className="bg-gradient-main min-h-screen">
            {/* Nav */}
            <nav className="sticky top-0 z-50 glass border-b border-white/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">PF</span>
                        </div>
                        <span className="font-display font-bold text-xl">AuraShot</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                            Log In
                        </Link>
                        <Link href="/auth/signup" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-600">
                            Sign Up Free
                        </Link>
                    </div>
                </div>
            </nav>

            <Pricing />

            <footer className="border-t border-gray-100 py-8 text-center text-sm text-muted-foreground">
                <p>© 2026 AuraShot. All rights reserved.</p>
            </footer>
        </main>
    );
}
