
const fs = require('fs');
const path = require('path');

const dns = require('dns');
// Force IPv4 Aggressively due to Node/Infura/External API issues in this env
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    if (!options) options = {};
    options.family = 4;
    return originalLookup(hostname, options, callback);
};

/*
 * SMSPool Price Generation Script (Optimized)
 * -----------------------------------------------------------------------------
 * Uses Node.js native fetch and parallelism to scan 1000+ services quickly.
 */

const API_KEY = process.env.SMSPOOL_API_KEY || 'J0MZ7SweU9P6uBPzwliH6VwnRGAQg8db';
const API_URL = 'https://api.smspool.net';
const BATCH_SIZE = 5; // Reduced from 50 to prevent 429s
const RATE_LIMIT_DELAY = 2000; // Increased to 2s

// Premium Services for Higher Pricing ($1.50 - $2.00)
const PREMIUM_SERVICES = [
    'whatsapp', 'telegram', 'google', 'gmail', 'facebook', 'instagram',
    'twitter', 'x', 'discord', 'tinder', 'bumble', 'hinge',
    'paypal', 'amazon', 'uber', 'lyft', 'netflix',
    'steam', 'tiktok', 'bank', 'revolut', 'wise', 'venmo', 'cashapp',
    'openai', 'chatgpt'
];

// 1. Define Countries (SMSPool IDs)
const COUNTRIES = {
    '1': 'US',   // United States
    '2': 'GB',   // United Kingdom
    '3': 'CA',   // Canada
    '6': 'FR',   // France
    '7': 'DE',   // Germany
    '9': 'NL',   // Netherlands
    '10': 'VN',  // Vietnam
    '12': 'ID',  // Indonesia
    '13': 'PH',  // Philippines
    '14': 'MY',  // Malaysia
    '15': 'TH',  // Thailand
    '23': 'BR',  // Brazil
    '33': 'RU',  // Russia
    '34': 'UA',  // Ukraine
    '40': 'PL',  // Poland
    '43': 'RO',  // Romania
    '46': 'SE'   // Sweden
};

async function fetchJson(url, retries = 3) {
    try {
        const res = await fetch(url);

        if (res.status === 429) {
            if (retries > 0) {
                // console.log(`Rate limit 429 hit. Retrying in 5s...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                return fetchJson(url, retries - 1);
            } else {
                console.error(`Failed ${url} after retries (429).`);
                return null;
            }
        }

        if (!res.ok) {
            // console.error(`Fetch error ${res.status}: ${res.statusText} for ${url}`);
            return null;
        }
        return await res.json();
    } catch (e) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return fetchJson(url, retries - 1);
        }
        console.error(`Fetch exception for ${url}:`, e.message);
        return null;
    }
}

async function main() {
    console.log("Starting SMSPool Full Service Pricing (Parallel)...");

    const masterData = {};

    // 1. Get ALL Service IDs
    console.log("Fetching Service List...");
    const allServices = await fetchJson(`${API_URL}/service/retrieve_all?key=${API_KEY}&country=1`);

    if (!allServices || !Array.isArray(allServices)) {
        console.error("Failed to fetch service list (Network or API Key error).");
        return;
    }

    console.log(`Found ${allServices.length} services globally.`);

    // Sort services to put Premium first in file
    allServices.sort((a, b) => {
        const isAPrem = PREMIUM_SERVICES.some(p => a.name.toLowerCase().includes(p));
        const isBPrem = PREMIUM_SERVICES.some(p => b.name.toLowerCase().includes(p));
        return (isAPrem === isBPrem) ? 0 : isAPrem ? -1 : 1;
    });

    // Initialize Master Data Entries
    for (const serviceObj of allServices) {
        const svcName = serviceObj.name;
        const normalizedName = svcName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isPremium = PREMIUM_SERVICES.some(p => svcName.toLowerCase().includes(p));

        if (!masterData[normalizedName]) {
            masterData[normalizedName] = {
                id: normalizedName,
                name: svcName,
                prices: {},
                category: isPremium ? 'Popular' : 'Other',
                smspool_id: serviceObj.ID
            };
        }
    }

    // 2. Build Queue of Tasks
    const tasks = [];
    const countryIds = Object.keys(COUNTRIES);

    for (const serviceObj of allServices) {
        for (const cid of countryIds) {
            tasks.push({
                serviceObj,
                cid,
                iso: COUNTRIES[cid]
            });
        }
    }

    console.log(`Processing ${tasks.length} price checks in batches of ${BATCH_SIZE}...`);

    // 3. Process Queue
    for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
        const batch = tasks.slice(i, i + BATCH_SIZE);
        const promises = batch.map(async (task) => {
            const { serviceObj, cid, iso } = task;
            const normalizedName = serviceObj.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            // OPTIMIZATION: Check if we already have a key? No, need fetching.

            const url = `${API_URL}/request/price?key=${API_KEY}&country=${cid}&service=${serviceObj.ID}`;
            const priceData = await fetchJson(url);

            if (priceData && priceData.price) {
                const cost = parseFloat(priceData.price);
                if (!isNaN(cost)) {
                    const isPremium = PREMIUM_SERVICES.some(p => serviceObj.name.toLowerCase().includes(p));
                    let finalPrice = 0;

                    if (isPremium) {
                        // Premium: Target $1.50 - $2.00
                        finalPrice = Math.max(cost + 0.60, 1.50);
                    } else {
                        // Standard: Target ~$0.75
                        finalPrice = Math.max(cost + 0.35, 0.75);
                    }

                    masterData[normalizedName].prices[iso] = parseFloat(finalPrice.toFixed(2));
                }
            }
        });

        await Promise.all(promises);

        // Progress Log
        if (i % 500 === 0) {
            const percent = ((i / tasks.length) * 100).toFixed(1);
            process.stdout.write(`\rProgress: ${percent}% (${i}/${tasks.length}) `);
        }

        // Rate Limit Delay
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }

    console.log("\nscan complete.");

    // Flatten and Save
    const servicesArray = Object.values(masterData)
        .filter(s => Object.keys(s.prices).length > 0)
        .map(s => {
            const usPrice = s.prices['US'];
            const gbPrice = s.prices['GB'];
            const minPrice = Math.min(...Object.values(s.prices));
            return {
                ...s,
                price: usPrice || gbPrice || minPrice
            };
        });

    // Sort logic (Premium first, then alphabetical)
    servicesArray.sort((a, b) => {
        const isAPrem = PREMIUM_SERVICES.some(p => a.name.toLowerCase().includes(p));
        const isBPrem = PREMIUM_SERVICES.some(p => b.name.toLowerCase().includes(p));
        if (isAPrem !== isBPrem) return isAPrem ? -1 : 1;
        return a.name.localeCompare(b.name);
    });

    console.log(`Valid Services with Stock: ${servicesArray.length}`);

    // Generate Mapping File (ID -> SMSPool ID)
    const mapping = {};
    servicesArray.forEach(s => {
        if (s.smspool_id) {
            mapping[s.id] = s.smspool_id;
        }
    });

    // Write services_data.ts
    const outPath = path.join(__dirname, '../src/app/dashboard/services_data.ts');
    const content = `/*
 * -----------------------------------------------------------------------------
 * 🔒 LOCKED FILE - SERVICE DATA (SMSPool Full Fetch)
 * -----------------------------------------------------------------------------
 * Contains pricing and category data for ALL Services.
 * Generated by scripts/fetch_smspool_services.js
 * -----------------------------------------------------------------------------
 */
import { Service } from './services';

export const SERVICES_DATA: Service[] = ${JSON.stringify(servicesArray, null, 4)};
`;
    fs.writeFileSync(outPath, content);

    // Write Mapping File
    const mapPath = path.join(__dirname, '../src/lib/smspool_map.json');
    fs.writeFileSync(mapPath, JSON.stringify(mapping, null, 4));

    console.log("Success! services_data.ts and smspool_map.json generated.");
}

main().catch(console.error);
