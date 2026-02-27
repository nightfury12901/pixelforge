import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { APP_NAME, APP_DESCRIPTION, SEO_KEYWORDS, APP_TAGLINE } from '@/lib/constants';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space-grotesk',
    display: 'swap',
});

export const viewport: Viewport = {
    themeColor: '#0E0E12',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
};

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://aurashot.in'),
    title: {
        default: `${APP_NAME} — Free AI Portrait Generator & Professional Headshots`,
        template: `%s | ${APP_NAME}`,
    },
    description: 'Create viral, photorealistic AI portraits and professional LinkedIn headshots from your selfies instantly. Try our free AI image generator, background remover, and 4K photo enhancer. Join early access creators using AuraShot for premium avatars and studio-quality photoshoots without the studio price.',
    keywords: [
        'AI portrait generator free',
        'professional AI headshot generator',
        'AI image generator India',
        'free AI image enhancer 4k',
        'AI photo upscaler online',
        'LinkedIn headshot AI maker',
        'free AI background remover HD',
        'create AI avatar from photo',
        'AI photoshoot online studio',
        'photorealistic AI photo generator',
        'Midjourney alternative free'
    ],
    authors: [{ name: APP_NAME }],
    creator: APP_NAME,
    publisher: APP_NAME,
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: '/',
        title: `${APP_NAME} — The Ultimate AI Portrait & Headshot Studio`,
        description: 'Turn selfies into professional LinkedIn headshots and viral Instagram portraits in seconds. Try AuraShot free today.',
        siteName: APP_NAME,
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: `${APP_NAME} — Premium AI Portrait Generator`,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `${APP_NAME} — Instant AI Portraits & Studio Headshots`,
        description: 'Generate stunning 4K AI portraits and professional headshots instantly. Start for free!',
        images: ['/og-image.png'],
        creator: '@boilerplatLabs',
    },
    alternates: {
        canonical: '/',
    },
    verification: {
        google: 'your-google-verification-code', // Reminder to set this up in Google Search Console
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/manifest.json" />
                {/* JSON-LD Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'SoftwareApplication',
                            name: APP_NAME,
                            description: 'Create viral, photorealistic AI portraits, LinkedIn headshots, and marketing assets instantly. Features include an AI portrait generator, 4K image enhancer, and HD background remover.',
                            applicationCategory: 'DesignApplication',
                            operatingSystem: 'Web, Windows, macOS, iOS, Android',
                            url: 'https://aurashot.in',
                            offers: {
                                '@type': 'AggregateOffer',
                                lowPrice: '0',
                                highPrice: '499',
                                priceCurrency: 'INR',
                                offerCount: 4,
                            },
                            aggregateRating: {
                                '@type': 'AggregateRating',
                                ratingValue: '4.9',
                                ratingCount: '10245',
                            },
                            featureList: [
                                'AI Portrait Generation',
                                'LinkedIn Professional Headshots',
                                '4K Image Enhancement & Upscaling',
                                'AI Background Removal',
                                '25+ Premium Styles'
                            ]
                        }),
                    }}
                />
            </head>
            <body className="min-h-screen bg-background font-sans antialiased">
                {children}
                <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: '#18181B',
                            color: '#FAFAFA',
                            borderRadius: '16px',
                            fontSize: '14px',
                        },
                        success: {
                            iconTheme: {
                                primary: '#34D399',
                                secondary: '#FFFFFF',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#F87171',
                                secondary: '#FFFFFF',
                            },
                        },
                    }}
                />
            </body>
        </html>
    );
}
