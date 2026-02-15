import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { MOCK_POSTS } from '../data';
import { BLOG_CONTENT } from '../content';
import { Metadata } from 'next';
import { BlogPostSchema, BreadcrumbSchema } from '../../../components/JsonLd';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    const content = BLOG_CONTENT[slug];

    if (!post || !content) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <style dangerouslySetInnerHTML={{
                __html: `
                .blog-content h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 2rem; line-height: 1.2; }
                .blog-content h2 { font-size: 2rem; font-weight: 800; margin-top: 3rem; margin-bottom: 1.5rem; color: white; }
                .blog-content h3 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #a855f7; }
                .blog-content p { font-size: 1.125rem; line-height: 1.8; color: #d1d5db; margin-bottom: 1.5rem; font-weight: 300; }
                .blog-content strong { font-weight: 700; color: #f3f4f6; }
                .blog-content ul, .blog-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; color: #d1d5db; }
                .blog-content li { margin-bottom: 0.5rem; line-height: 1.6; }
                .blog-content a { color: #a855f7; text-decoration: underline; font-weight: 600; }
                .blog-content a:hover { color: #c084fc; }
                .blog-content blockquote { border-left: 4px solid #a855f7; padding-left: 1.5rem; font-style: italic; color: #9ca3af; margin: 2rem 0; }
                .blog-content hr { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 3rem 0; }
            `}} />

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
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

                <div className="container mx-auto px-4 py-20 relative z-10 max-w-3xl font-sans">
                    <div className="mb-12 text-center">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-8">
                            {post.category}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-center gap-6 text-sm text-stone-500 font-medium">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
                                <span>VoltSMS Team</span>
                            </div>
                            <span>•</span>
                            <span>{post.date}</span>
                        </div>
                    </div>

                    <div className="blog-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>

                        <div className="not-prose mt-24 p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-colors"></div>

                            <h3 className="text-2xl md:text-3xl font-black mb-6 tracking-tighter">Ready to take back your privacy?</h3>
                            <p className="text-stone-400 mb-8 text-lg font-light leading-relaxed">
                                Get a dedicated Non-VoIP number today. Bypasses all filters. Instant codes. 100% Private.
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
                                {['WhatsApp', 'Telegram', 'Google', 'Tinder', 'OpenAI', 'Discord'].map((svc) => (
                                    <Link
                                        key={svc}
                                        href={`/verify/${svc.toLowerCase()}`}
                                        className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all text-xs font-bold text-center uppercase tracking-widest"
                                    >
                                        {svc} &rarr;
                                    </Link>
                                ))}
                            </div>

                            <Link href="/register" className="block">
                                <button className="w-full bg-white text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5">
                                    Start Instant Verification
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </article>
        </main>
    );
}
