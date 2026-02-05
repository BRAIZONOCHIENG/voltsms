import Navbar from '../../../components/Navbar';
import { MOCK_POSTS } from '../data';
import { Metadata } from 'next';
import { BlogPostSchema, BreadcrumbSchema } from '../../../components/JsonLd';
import { notFound } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltsms.store';

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for each blog post
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = MOCK_POSTS.find((p) => p.slug === slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            url: `${BASE_URL}/blog/${post.slug}`,
            type: 'article',
            publishedTime: post.date,
            authors: ['VoltSMS Team'],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
        },
        alternates: {
            canonical: `${BASE_URL}/blog/${post.slug}`,
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = MOCK_POSTS.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            {/* Structured Data */}
            <BlogPostSchema
                title={post.title}
                description={post.excerpt}
                url={`${BASE_URL}/blog/${post.slug}`}
                datePublished={post.date}
                author="VoltSMS Team"
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: BASE_URL },
                    { name: 'Blog', url: `${BASE_URL}/blog` },
                    { name: post.title, url: `${BASE_URL}/blog/${post.slug}` },
                ]}
            />

            <article className="flex-1 relative">
                {/* Background Blob */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

                <div className="container mx-auto px-4 py-20 relative z-10 max-w-3xl">
                    <div className="mb-8 text-center">
                        <div className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-purple-400 mb-6">
                            {post.category}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-sm text-stone-500">
                            <span>Author: VoltSMS Team</span>
                            <span>•</span>
                            <span>{post.date}</span>
                        </div>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-a:text-purple-400 prose-img:rounded-2xl">
                        <p className="lead text-xl text-stone-300">
                            {post.excerpt}
                        </p>
                        <hr className="border-white/10 my-8" />

                        <p>
                            (This is a placeholder for the actual blog content. In a real implementation, this would be fetched from the database based on the slug <code>{slug}</code>).
                        </p>

                        <h2>Why Use a Virtual Number?</h2>
                        <p>
                            Virtual numbers allow you to receive SMS verification codes without exposing your personal SIM card to potential spam or data breaches.
                        </p>

                        <h3>Steps to Verify</h3>
                        <ol>
                            <li>Log in to your VoltSMS Dashboard.</li>
                            <li>Search for the service in the service list.</li>
                            <li>Select a country (e.g., USA or UK).</li>
                            <li>Click &quot;Buy Number&quot;.</li>
                            <li>Use the provided number on the service&apos;s website.</li>
                        </ol>
                    </div>
                </div>
            </article>
        </main>
    );
}
