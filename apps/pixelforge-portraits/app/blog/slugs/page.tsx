import Link from 'next/link';

export default function BlogSlugsPage() {
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
                </div>
            </nav>

            <section className="py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-4xl font-bold mb-4">Blog Post</h1>
                    <p className="text-muted-foreground mb-8">
                        This is a placeholder for individual blog posts. Connect a headless CMS or Markdown source to dynamically render blog content.
                    </p>
                    <Link href="/blog" className="text-primary font-medium hover:underline">
                        ← Back to Blog
                    </Link>
                </div>
            </section>
        </main>
    );
}
