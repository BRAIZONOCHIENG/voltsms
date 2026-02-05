// Hardcoded Data from PVAPins (Manual Fallback)
// Pricing based on typical PVAPins costs + User Strategy (Cost + $0.80)
// Base Cost Assumption: ~$0.20 - $0.25 for most services.

export interface Service {
    id: string;
    name: string;
    price: number;
    category: 'Social' | 'Transport' | 'Shopping' | 'Email' | 'Gaming' | 'Finance' | 'AI' | 'Other';
}

export const HARDCODED_SERVICES: Service[] = [
    // Social Media (Premium)
    { id: 'wa', name: 'WhatsApp', price: 1.50, category: 'Social' },
    { id: 'tg', name: 'Telegram', price: 1.80, category: 'Social' },
    { id: 'ig', name: 'Instagram', price: 1.00, category: 'Social' },
    { id: 'fb', name: 'Facebook', price: 1.00, category: 'Social' },
    { id: 'tw', name: 'Twitter / X', price: 1.00, category: 'Social' },
    { id: 'ds', name: 'Discord', price: 1.00, category: 'Social' },
    { id: 'lf', name: 'TikTok', price: 1.00, category: 'Social' },
    { id: 'sc', name: 'Snapchat', price: 1.00, category: 'Social' },
    { id: 'oi', name: 'Tinder', price: 1.50, category: 'Social' },
    { id: 'bm', name: 'Bumble', price: 1.50, category: 'Social' },
    { id: 'hn', name: 'Hinge', price: 1.50, category: 'Social' },
    { id: 'we', name: 'WeChat', price: 2.50, category: 'Social' },

    // Social (Standard - $0.60)
    { id: 'li', name: 'LinkedIn', price: 0.60, category: 'Social' },
    { id: 'rd', name: 'Reddit', price: 0.60, category: 'Social' },
    { id: 'vk', name: 'VKontakte', price: 0.60, category: 'Social' },

    // Email (Premium)
    { id: 'go', name: 'Google / Gmail', price: 1.20, category: 'Email' },
    { id: 'ma', name: 'Microsoft / Outlook', price: 1.00, category: 'Email' },
    { id: 'pm', name: 'ProtonMail', price: 1.50, category: 'Email' },

    // Email (Standard - $0.60)
    { id: 'ya', name: 'Yahoo', price: 0.60, category: 'Email' },
    { id: 'aol', name: 'AOL', price: 0.60, category: 'Email' },

    // Shopping / Economy
    { id: 'am', name: 'Amazon', price: 1.00, category: 'Shopping' },
    { id: 'ab', name: 'Alibaba / Alipay', price: 1.50, category: 'Shopping' },
    { id: 'pp', name: 'PayPal', price: 1.50, category: 'Finance' },
    { id: 'ws', name: 'Wise', price: 1.50, category: 'Finance' },
    { id: 'rv', name: 'Revolut', price: 1.50, category: 'Finance' },
    { id: 'ca', name: 'Cash App', price: 2.00, category: 'Finance' },

    // Shopping (Standard - $0.60)
    { id: 'eb', name: 'eBay', price: 0.60, category: 'Shopping' },
    { id: 'tm', name: 'Temu', price: 0.60, category: 'Shopping' },

    // Transport
    { id: 'ub', name: 'Uber', price: 1.20, category: 'Transport' },
    { id: 'ly', name: 'Lyft', price: 1.20, category: 'Transport' },

    // Transport (Standard - $0.60)
    { id: 'bl', name: 'Bolt', price: 0.60, category: 'Transport' },
    { id: 'gr', name: 'Grab', price: 0.60, category: 'Transport' },

    // AI
    { id: 'dr', name: 'OpenAI / ChatGPT', price: 1.20, category: 'AI' },
    { id: 'cl', name: 'Claude / Anthropic', price: 1.50, category: 'AI' },
    { id: 'mj', name: 'Midjourney', price: 1.00, category: 'AI' },

    // Gaming / Ent (Standard - $0.60)
    { id: 'st', name: 'Steam', price: 0.60, category: 'Gaming' },
    { id: 'nf', name: 'Netflix', price: 0.60, category: 'Other' },
    { id: 'tw', name: 'Twitch', price: 0.60, category: 'Other' },

    // Catch-all ($0.60)
    { id: 'ot', name: 'Service Not Listed', price: 0.60, category: 'Other' },
];

export const HARDCODED_COUNTRIES = [
    { id: '0', name: 'Any Country (Cheapest)' }, // Special handling maybe?
    { id: '1', name: 'United States' },
    { id: '2', name: 'United Kingdom' },
    { id: '3', name: 'Russia' },
    { id: '4', name: 'Ukraine' },
    { id: '5', name: 'Kazakhstan' },
    { id: '6', name: 'China' },
    { id: '7', name: 'Philippines' },
    { id: '8', name: 'Myanmar' },
    { id: '9', name: 'Indonesia' },
    { id: '10', name: 'Malaysia' },
    { id: '11', name: 'Kenya' },
    { id: '12', name: 'Vietnam' },
    { id: '13', name: 'Kyrgyzstan' },
    { id: '14', name: 'Israel' },
    { id: '15', name: 'Hong Kong' },
    { id: '16', name: 'Poland' },
    { id: '21', name: 'Germany' },
    { id: '22', name: 'France' },
    { id: '23', name: 'Spain' },
    { id: '33', name: 'Netherlands' },
    { id: '36', name: 'Canada' },
    { id: '40', name: 'Brazil' },
    { id: '43', name: 'Mexico' },
    { id: '44', name: 'India' },
    { id: '48', name: 'Thailand' },
    { id: '51', name: 'Australia' },
    { id: '53', name: 'Turkey' },
    { id: '76', name: 'South Africa' },
    { id: '79', name: 'Nigeria' },
];
