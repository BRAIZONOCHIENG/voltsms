import { NextResponse } from 'next/server';
import https from 'node:https';
import dns from 'node:dns';

// Force IPV4
try {
    dns.setDefaultResultOrder('ipv4first');
} catch (e) {
    console.error("DNS setup failed:", e);
}

export const dynamic = 'force-dynamic';

// Simple In-Memory Cache for Prices
// Map Key: "country_serviceID" -> { price: number, timestamp: number }
const priceCache = new Map<string, { price: number, cost: number, timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 Minutes

function fetchNative(url: string, retries = 2): Promise<any> {
    return new Promise((resolve, reject) => {
        const attempt = (n: number) => {
            const req = https.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 2500 // Reduced to 2.5s for faster failover
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try { resolve(JSON.parse(data)); }
                        catch (e) { reject(new Error('Failed to parse JSON')); }
                    } else {
                        try { resolve(JSON.parse(data)); }
                        catch (e) { reject(new Error(`API Status: ${res.statusCode} Body: ${data}`)); }
                    }
                });
            });

            req.on('error', (err) => {
                if (n < retries) setTimeout(() => attempt(n + 1), 500); // Faster retry (500ms delay)
                else reject(err);
            });
            req.on('timeout', () => {
                req.destroy();
                if (n < retries) setTimeout(() => attempt(n + 1), 500);
                else reject(new Error('Request timed out'));
            });
        };
        attempt(1);
    });
}

export async function POST(req: Request) {
    try {
        const { service, country } = await req.json();

        if (!service || !country) {
            return NextResponse.json({ error: 'Service and country are required' }, { status: 400 });
        }

        // 1. Check Cache
        const cacheKey = `${country}_${service}`;
        const cached = priceCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
            // Return cached price
            // Re-apply markup calculation just in case strategy changed (though usually unnecessary)
            // But we cached the RAW cost? Or final price? 
            // Better to cache the RAW COST from provider, then apply markup logic newly.
            // Let's assume we stored metadata.

            return NextResponse.json(calculateSellingPrice(cached.cost));
        }

        const SMSPOOL_API_KEY = process.env.SMSPOOL_API_KEY;
        if (!SMSPOOL_API_KEY) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // 2. Fetch Price from SMSPool
        const smspoolData = await fetchNative(`https://api.smspool.net/request/price?key=${SMSPOOL_API_KEY}&country=${country}&service=${service}`);

        if (!smspoolData.price) {
            return NextResponse.json({ error: 'Service unavailable' }, { status: 404 });
        }

        const costPrice = parseFloat(smspoolData.price);

        // 3. Update Cache
        priceCache.set(cacheKey, {
            price: costPrice, // Redundant naming but keeping structure clear
            cost: costPrice,
            timestamp: Date.now()
        });

        // 4. Return Calculated Price
        return NextResponse.json(calculateSellingPrice(costPrice));

    } catch (error: any) {
        console.error('Price Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
    }
}

function calculateSellingPrice(costPrice: number) {
    // Strategy: 100% Markup (x2.0)
    // Ensures we profit significantly even on expensive items (e.g. $2.00 -> $4.00)
    // Floor price: $0.60

    let sellingPrice = costPrice * 2.0;

    if (sellingPrice < 0.60) {
        sellingPrice = 0.60;
    }

    // Round to 2 decimals
    return {
        price: parseFloat(sellingPrice.toFixed(2)),
        cost: costPrice
    };
}
