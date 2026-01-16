"use client";

interface OrganizationSchemaProps {
    name?: string;
    url?: string;
    logo?: string;
}

interface WebSiteSchemaProps {
    name?: string;
    url?: string;
}

interface BlogPostSchemaProps {
    title: string;
    description: string;
    url: string;
    datePublished: string;
    author?: string;
}

interface BreadcrumbItem {
    name: string;
    url: string;
}

interface BreadcrumbSchemaProps {
    items: BreadcrumbItem[];
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltsms.com';

export function OrganizationSchema({
    name = "VoltSMS",
    url = BASE_URL,
    logo = `${BASE_URL}/voltsms-logo.png`
}: OrganizationSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name,
        url,
        logo,
        sameAs: [],
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            availableLanguage: "English"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function WebSiteSchema({
    name = "VoltSMS",
    url = BASE_URL
}: WebSiteSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name,
        url,
        potentialAction: {
            "@type": "SearchAction",
            target: `${url}/blog?q={search_term_string}`,
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function BlogPostSchema({
    title,
    description,
    url,
    datePublished,
    author = "VoltSMS Team"
}: BlogPostSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description,
        url,
        datePublished,
        author: {
            "@type": "Person",
            name: author
        },
        publisher: {
            "@type": "Organization",
            name: "VoltSMS",
            logo: {
                "@type": "ImageObject",
                url: `${BASE_URL}/voltsms-logo.png`
            }
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer
            }
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
