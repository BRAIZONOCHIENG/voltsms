
export const WEBSHARE_API_URL = 'https://proxy.webshare.io/api/v2';

export async function getWebshareClient() {
    // Assuming env var is managed via JSON DB or process.env, 
    // but the Admin UI 'Environment Editor' saves to .env usually? 
    // The previous implementation of /api/admin/env reads/writes .env.local?
    // Let's assume process.env.WEBSHARE_API_KEY is populated.

    // However, if the user updates it in Admin UI, it might require reload or read from a DB.
    // For now, standard process.env.
    const apiKey = process.env.WEBSHARE_API_KEY;
    if (!apiKey) throw new Error("Webshare API Key not configured");
    return apiKey;
}

export async function getAvailableCountries() {
    const apiKey = await getWebshareClient();
    try {
        // Webshare doesn't have a public 'list countries' for buying without auth context usually.
        // But we can check stats or available replacement regions.
        // For now, we will return a static list of major countries Webshare supports
        // to avoid API complexity upfront, matches the "clean" UI requirement.
        return [
            { code: 'US', name: 'United States' },
            { code: 'GB', name: 'United Kingdom' },
            { code: 'DE', name: 'Germany' },
            { code: 'FR', name: 'France' },
            { code: 'CA', name: 'Canada' },
            { code: 'NL', name: 'Netherlands' },
            { code: 'ES', name: 'Spain' },
            { code: 'IT', name: 'Italy' }
        ];
    } catch (error) {
        console.error("Webshare Country Fetch Error", error);
        return [];
    }
}

export async function getProxyList() {
    const apiKey = await getWebshareClient();
    const res = await fetch(`${WEBSHARE_API_URL}/proxy/list/?mode=direct&page=1&page_size=100`, {
        headers: { 'Authorization': `Token ${apiKey}` }
    });

    if (!res.ok) {
        throw new Error(`Webshare List Failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.results || [];
}

// Helper to distinguish Premium (Static Resi) vs Free (DC)
// Filters out known Datacenter ASNs common in Free Tier
function isPremiumProxy(proxy: any): boolean {
    const asn = (proxy.asn_name || '').toLowerCase();
    const isDatacenter =
        asn.includes('leaseweb') ||
        asn.includes('m247') ||
        asn.includes('datacamp') ||
        asn.includes('cdn77') ||
        asn.includes('colocrossing') ||
        asn.includes('syn') ||
        asn.includes('google') ||
        asn.includes('getech') ||
        asn.includes('hostroyale') ||
        asn.includes('coloam') ||
        asn.includes('abul') ||
        asn.includes('as40676');

    return !isDatacenter;
}

export async function getPremiumProxies() {
    // Webshare is now dedicated to free proxies only. 
    // New API will be added later for premium.
    return [];
}

export async function getFreeProxies() {
    // Return ALL proxies from Webshare as free
    const all = await getProxyList();
    return all;
}

export async function buyProxy(userId: string, countryCode: string, isp: string = 'any') {
    // 1. Fetch ONLY Premium (Static Residential) proxies
    const proxies = await getPremiumProxies();

    // 2. Filter by country
    const availableProxy = proxies.find((p: any) => p.country_code === countryCode);

    // 3. Fallback? If no PREMIUM proxy matches, we should NOT sell a free one.
    // User explicitly said: "if not available, should display an error."
    if (!availableProxy) {
        throw new Error("Out of stock. No premium static residential proxies available for this region.");
    }

    return {
        ip: availableProxy.proxy_address || availableProxy.ip,
        port: availableProxy.port,
        username: availableProxy.username,
        password: availableProxy.password,
        country_code: availableProxy.country_code,
        isp_name: availableProxy.asn_name || 'Static Residential',
        id: availableProxy.id || Math.random().toString(36).substring(7)
    };
}

export async function verifyWebshareConnection() {
    const apiKey = process.env.WEBSHARE_API_KEY;
    if (!apiKey) return false;
    try {
        const res = await fetch(`${WEBSHARE_API_URL}/profile/`, {
            headers: { 'Authorization': `Token ${apiKey}` }
        });
        return res.ok;
    } catch (e) {
        return false;
    }
}
