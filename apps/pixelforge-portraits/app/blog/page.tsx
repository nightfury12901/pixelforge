import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Blog — AI Portrait Tips & Tutorials',
    description: 'Learn how to create viral AI portraits, prompt engineering tips, and stay updated with the latest AI image generation trends.',
};

const posts = [
    {
        title: 'How to Create Viral AI Portraits for Instagram',
        excerpt: 'Learn the secrets behind AI portraits that go viral on Instagram. From choosing the right style to crafting the perfect prompt.',
        date: '2026-01-15',
        category: 'Tutorial',
        readTime: '5 min',
    },
    {
        title: 'Top 10 AI Portrait Styles Trending in India 2026',
        excerpt: 'Discover the most popular AI portrait styles that Indian creators are using to grow their social media presence.',
        date: '2026-01-10',
        category: 'Trending',
        readTime: '4 min',
    },
    {
        title: 'AI Image Enhancement: From Blurry to 4K',
        excerpt: 'How AI super resolution works and why AuraShot delivers the best results for image upscaling.',
        date: '2026-01-05',
        category: 'Technology',
        readTime: '6 min',
    },
    {
        title: 'Using AI Portraits for LinkedIn: A Complete Guide',
        excerpt: 'Stand out on LinkedIn with professional AI-generated headshots. Tips for choosing the right style and pose.',
        date: '2025-12-28',
        category: 'Professional',
        readTime: '4 min',
    },
];

export default function BlogPage() {
    return (
        <main className="bg-gradient-main min-h-screen">
            <nav className="sticky top-0 z-50 glass border-b border-white/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">PF</span>
                        </div>
                        <span className="font-display font-bold text-xl">AuraShot</span>
                    </Link>
                    <Link href="/auth/signup" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-600">
                        Sign Up Free
                    </Link>
                </div>
            </nav>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Blog</h1>
                    <p className="text-lg text-muted-foreground text-center mb-12 max-w-xl mx-auto">
                        Tips, tutorials, and trends in AI portrait generation.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {posts.map((post) => (
                            <article
                                key={post.title}
                                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-gumroad transition-all hover-lift cursor-pointer"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-medium bg-primary/10 text-primary-600 px-2 py-0.5 rounded-full">
                                        {post.category}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                                </div>
                                <h2 className="text-lg font-bold mb-2 line-clamp-2">{post.title}</h2>
                                <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                                <p className="text-xs text-muted-foreground mt-3">
                                    {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="border-t border-gray-100 py-8 text-center text-sm text-muted-foreground">
                <p>© 2026 AuraShot. All rights reserved.</p>
            </footer>
        </main>
    );
}
