import { MetadataRoute } from 'next';
import { MOCK_POSTS } from './blog/data';
import { SEO_SERVICES, SEO_COUNTRIES } from './verify/constants';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://voltsms.store';

    // Static Routes
    const staticRoutes = [
        '',
        '/register',
        '/login',
        '/promo',
        '/blog',
        '/affiliate',
        '/about',
        '/contact',
        '/support',
        '/terms',
        '/privacy',
        '/disclaimer',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    // Dynamic Blog Routes
    const blogRoutes = MOCK_POSTS.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    // SEO Landing Pages
    const seoRoutes: MetadataRoute.Sitemap = [];
    SEO_SERVICES.forEach((service: { slug: string; name: string }) => {
        SEO_COUNTRIES.forEach((country: string) => {
            seoRoutes.push({
                url: `${baseUrl}/verify/${service.slug}/${country.toLowerCase()}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.9,
            });
        });
    });

    return [...staticRoutes, ...blogRoutes, ...seoRoutes];
}
