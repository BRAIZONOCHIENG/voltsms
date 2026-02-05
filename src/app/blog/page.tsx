import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { Metadata } from 'next';
import { BreadcrumbSchema } from '../../components/JsonLd';

// Mock data until DB is connected
import { MOCK_POSTS } from './data';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltsms.store';

export const metadata: Metadata = {
    title: 'Blog - Privacy Tips, Tutorials & News',
    description: 'Read the latest articles about SMS verification, online privacy, virtual phone numbers, and digital security on the VoltSMS blog.',
    openGraph: {
        title: 'VoltSMS Blog - Privacy Tips & Tutorials',
        description: 'Read the latest articles about SMS verification, online privacy, virtual phone numbers, and digital security.',
        url: `${BASE_URL}/blog`,
    },
    alternates: {
        canonical: `${BASE_URL}/blog`,
    },
};

export default function BlogPage() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <div className="flex-1 relative">
                {/* Background Blob */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

                <div className="container mx-auto px-4 py-20 relative z-10 max-w-5xl">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                            The VoltSMS Blog
                        </h1>
                        <p className="text-xl text-stone-400 max-w-2xl mx-auto">
                            Insights, tutorials, and news about privacy, verification, and digital security.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {MOCK_POSTS.map((post) => (
                            <Link href={`/blog/${post.slug}`} key={post.id} className="group">
                                <article className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all h-full flex flex-col">
                                    <div className="h-48 bg-gradient-to-br from-purple-900/40 to-black relative overflow-hidden">
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                        {/* Placeholder for real image */}
                                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/10">
                                            {post.category}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="text-xs font-bold text-stone-500 mb-2">{post.date}</div>
                                        <h2 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors leading-tight">
                                            {post.title}
                                        </h2>
                                        <p className="text-sm text-stone-400 line-clamp-3 mb-4 flex-1">
                                            {post.excerpt}
                                        </p>
                                        <span className="text-sm font-bold text-purple-400 flex items-center gap-2">
                                            Read Article &rarr;
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
