
const fs = require('fs');
const https = require('https');
const path = require('path');

const API_KEY = process.env.PVAPINS_API_KEY;
const BASE_URL = 'https://api.pvapins.com/user/api';

// Services File Path
const SERVICES_FILE = path.join(__dirname, '../src/app/dashboard/services_data.ts');
const COUNTRIES_FILE = path.join(__dirname, '../src/app/dashboard/countries.ts');

if (!API_KEY) {
    console.error("Please set PVAPINS_API_KEY env var");
    process.exit(1);
}

const PREMIUM_PRICES = {
    // Tier 1 (Premium) - $1.50
    'whatsapp': 1.50, 'telegram': 1.50, 'wechat': 1.50,

    // Tier 2 (High Demand) - $1.25
    'google': 1.25, 'gmail': 1.25, 'youtube': 1.25,
    'tinder': 1.25, 'bumble': 1.25,

    // Tier 3 (Popular) - $1.00
    'facebook': 1.00, 'instagram': 1.00, 'tiktok': 1.00, 'twitter': 1.00,
    'paypal': 1.00, 'cashapp': 1.00, 'venmo': 1.00,

    // Tier 4 (Standard Plus) - $0.80
    'openai': 0.80, 'claude': 0.80, 'discord': 0.80,
    'snapchat': 0.80, 'linkedin': 0.80, 'uber': 0.80,
    'amazon': 0.80, 'netflix': 0.80
};

const ICONS_MAP = {
    'whatsapp': 'whatsapp.svg', 'telegram': 'telegram.svg', 'instagram': 'instagram.svg',
    'facebook': 'facebook.svg', 'twitter': 'twitter.svg', 'tiktok': 'tiktok.svg',
    'discord': 'discord.svg', 'snapchat': 'snapchat.svg', 'uber': 'uber.svg',
    'tinder': 'tinder.svg', 'google': 'google.svg', 'openai': 'openai.svg',
    'amazon': 'amazon.svg', 'netflix': 'netflix.svg', 'paypal': 'paypal.svg',
    'linkedin': 'linkedin.svg', 'yahoo': 'yahoo.svg', 'microsoft': 'microsoft.svg',
    'wechat': 'wechat.svg', 'line': 'line.svg', 'viber': 'viber.svg',
    'kakaotalk': 'kakaotalk.svg', 'steam': 'steam.svg', 'twitch': 'twitch.svg',
    'airbnb': 'airbnb.svg', 'booking': 'booking.svg', 'ebay': 'ebay.svg'
};

function fetchApi(endpoint, params = {}, isAbsolute = false) {
    return new Promise((resolve, reject) => {
        let url;
        if (isAbsolute) {
            url = new URL(endpoint);
        } else {
            url = new URL(`${BASE_URL}/${endpoint}`);
            url.searchParams.append('customer', API_KEY);
        }
        for (const [k, v] of Object.entries(params)) url.searchParams.append(k, v);

        const req = https.get(url.toString(), (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                // Debug log
                console.log("Response Preview:", data.substring(0, 500));

                if (data.trim().startsWith('<') || data.trim().includes('error')) {
                    console.log("HTML/Error Detected in Reponse");
                }

                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error("Parse Error for", url.toString());
                    console.error("Raw Data:", data);
                    resolve([]);
                }
            });
        });
        req.on('error', (e) => {
            console.error("Request error:", e);
            reject(e);
        });
        req.on('timeout', () => {
            req.destroy();
            reject(new Error("Request timed out"));
        });
    });
}

function calculatePrice(id, cost) {
    // Check Premium Map first
    if (PREMIUM_PRICES[id]) return PREMIUM_PRICES[id];

    // Standard Logic
    let c = parseFloat(cost || 0.10);

    // Dynamic Logic: Cost + Margin, but preserve minimums
    let margin = 0.40;
    // For very cheap services, we might want higher % margin
    if (c < 0.20) margin = 0.50;

    let price = c + margin;

    // Strict Floor
    if (price < 0.60) price = 0.60;

    // Strict Cap requested by user
    if (price > 1.50) price = 1.50;

    // Round to 2 decimal places
    return Math.ceil(price * 100) / 100;
}

function inferCategory(name) {
    const n = name.toLowerCase();
    if (n.includes('chat') || n.includes('gram') || n.includes('discord') || n.includes('book') || n.includes('twitter') || n.includes('tinder') || n.includes('bumble') || n.includes('hinge') || n.includes('insta') || n.includes('what')) return 'Social';
    if (n.includes('uber') || n.includes('bolt') || n.includes('grab') || n.includes('taxi') || n.includes('lyft')) return 'Transport';
    if (n.includes('amazon') || n.includes('ebay') || n.includes('shopify') || n.includes('alibaba') || n.includes('temu')) return 'Shopping';
    if (n.includes('google') || n.includes('micro') || n.includes('yahoo') || n.includes('aol') || n.includes('mail')) return 'Email';
    if (n.includes('steam') || n.includes('blizzard') || n.includes('epic') || n.includes('game') || n.includes('ea sports')) return 'Gaming';
    return 'Other';
}

async function main() {
    console.log("Fetching Countries...");
    const countries = await fetchApi('load_countries.php');

    let countryList = [];
    if (Array.isArray(countries)) {
        countryList = countries;
    } else {
        countryList = Object.entries(countries).map(([id, name]) => ({ id, name }));
    }

    // Filter useful countries
    const USEFUL_COUNTRIES = ['US', 'GB', 'CA', 'DE', 'FR', 'ES', 'IT', 'NL', 'PL', 'RU', 'UA', 'VN', 'PH', 'ID', 'TH', 'MY', 'BR', 'MX', 'AR', 'CO'];
    // const filteredCountries = countryList.filter(c => USEFUL_COUNTRIES.includes(c.code) || USEFUL_COUNTRIES.includes(c.country_id)); // Basic filter if needed, or keep all.

    console.log("Fetching services (App List) from SMSPool (Fallback)...");
    // Using SMSPool to get the list since PVAPins is returning empty
    let services = [];
    try {
        services = await fetchApi('https://api.smspool.net/service/retrieve_all?country=1', {}, true);
    } catch (e) {
        console.error("SMSPool Fallback Failed:", e);
    }

    if (!services || services.length === 0) {
        console.error("Failed to fetch services from any source.");
        // process.exit(1); 
    }

    if (!services || !services.length) {
        console.log("Still no services found. Exiting.");
        process.exit(1);
    }

    console.log(`Processing ${services.length} services...`);

    // Add "Service Not Listed" manually at top
    const processed = [
        { id: '9999', name: 'Service Not Listed', price: 0.60, category: 'Other', icon: null },
        ...services.map(svc => {
            let id = svc.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            // Alias fixes
            if (id === 'twitter' || id === 'x') id = 'twitter';
            if (id === 'google' || id === 'gmail' || id === 'youtube') id = 'google';

            return {
                id: id,
                name: svc.name,
                price: calculatePrice(id, svc.cost || svc.price || svc['0']), // Api might return '0' as cost sometimes
                category: inferCategory(svc.name),
                icon: ICONS_MAP[id] || null
            };
        })
            .filter(s => !s.name.toLowerCase().includes('voice'))
            .sort((a, b) => {
                // Priority Sort
                const pA = PREMIUM_PRICES[a.id] ? 1 : 0;
                const pB = PREMIUM_PRICES[b.id] ? 1 : 0;
                if (pA !== pB) return pB - pA; // Premiums first
                return a.name.localeCompare(b.name);
            })
    ];

    // Deduplicate by ID
    const uniqueServices = Array.from(new Map(processed.map(item => [item.id, item])).values());

    const fileContent = `import { Service } from './services';\n\nexport const SERVICES_DATA: Service[] = ${JSON.stringify(uniqueServices, null, 4)};`;

    fs.writeFileSync(SERVICES_FILE, fileContent);
    console.log(`Saved ${uniqueServices.length} services to ${SERVICES_FILE}`);

    // Countries
    const validCountries = countryList.map(c => ({
        code: c.code || c.id || c.country_id,
        name: c.name || c.country_name,
        flag: "🏳️" // Placeholder, maybe map later if needed. Dashboard might handle flags by code.
    }));

    // We need to keep the COUNTRIES export format in countries.ts
    // Let's just update validCountries and write it.
    // Actually, countries.ts might have specific format with flags.
    // For now we SKIP overwriting countries.ts to avoid breaking flags, 
    // BUT we should ensure we have a good list.
    // The previous code had a hardcoded list. Let's strictly update SERVICES today.

    // console.log("Updating countries.ts is risky if flags are needed. Skipping for safety.");
}

main();
