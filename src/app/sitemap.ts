import { MetadataRoute } from 'next';
import { MOCK_POSTS } from './blog/data';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://voltsms.store';

    // Static Routes
    const staticRoutes = [
        '',
        '/register',
        '/login',
        '/promo',
        '/blog',
        '/about', // Added
        '/contact',
        '/support',
        '/terms',
        '/privacy',
        '/disclaimer',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Blog Routes
    const blogRoutes = MOCK_POSTS.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    return [...staticRoutes, ...blogRoutes];
}
