export interface Service {
    id: string;
    name: string;
    price: number;
    category: string;
}

// Map service IDs to Categories based on keywords (fallback)
export const SERVICE_CATEGORIES: Record<string, string> = {
    'telegram': 'Messaging',
    'whatsapp': 'Messaging',
    'discord': 'Social',
    'facebook': 'Social',
    'instagram': 'Social',
    'google': 'Tech',
    'openai': 'AI',
    'uber': 'Transport',
    'tinder': 'Social',
    // ... we can keep a small map or just rely on the API specific categorization
};

export const getServiceCategory = (id: string, name?: string): string => {
    // If name is provided, use logical inference
    if (name) {
        const n = name.toLowerCase();
        if (n.includes('chat') || n.includes('gram') || n.includes('discord') || n.includes('book') || n.includes('twitter') || n.includes('tinder') || n.includes('bumble') || n.includes('hinge')) return 'Social';
        if (n.includes('uber') || n.includes('lyft') || n.includes('bolt') || n.includes('grab')) return 'Transport';
        if (n.includes('food') || n.includes('eat') || n.includes('doordash') || n.includes('grubhub')) return 'Food';
        if (n.includes('amazon') || n.includes('ebay') || n.includes('etsy') || n.includes('shop')) return 'Shopping';
        if (n.includes('pay') || n.includes('bank') || n.includes('card') || n.includes('cash') || n.includes('transfer')) return 'Finance';
        if (n.includes('bet') || n.includes('casino') || n.includes('poker')) return 'Gambling';
        if (n.includes('gpt') || n.includes('openai') || n.includes('claude') || n.includes('ai')) return 'AI';
        if (n.includes('steam') || n.includes('xbox') || n.includes('psn') || n.includes('game')) return 'Gaming';
    }
    return 'Other';
};

// Initial empty state, will be populated by API
export const MOCK_SERVICES: Service[] = [];
