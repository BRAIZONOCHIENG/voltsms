
const fs = require('fs');
const https = require('https');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
// Handle format: SMSPOOL_API_KEY=value or SMSPOOL_API_KEY="value"
const keyMatch = envContent.match(/SMSPOOL_API_KEY=["']?([^"'\s]+)["']?/);
const key = keyMatch ? keyMatch[1].trim() : null;

if (!key) {
    console.error("Could not find SMSPOOL_API_KEY in .env.local");
    process.exit(1);
}
console.log(`Using API Key: ${key.substring(0, 4)}...`);

const ids = fs.readFileSync('scripts/service_ids.txt', 'utf8').split('\n').filter(Boolean).map(id => id.trim());
console.log(`Scanning ${ids.length} services...`);

const results = {};
const country = '1';

function fetchPrice(id) {
    return new Promise((resolve) => {
        const url = `https://api.smspool.net/request/price?key=${key}&country=${country}&service=${id}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.price) {
                        resolve({ id, price: parseFloat(json.price) });
                    } else {
                        resolve({ id, error: json.message || 'No price' });
                    }
                } catch (e) {
                    resolve({ id, error: 'JSON parse error' });
                }
            });
        }).on('error', () => resolve({ id, error: 'Network error' }));
    });
}

async function run() {
    const chunkSize = 5;
    for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize);
        const promises = chunk.map(id => fetchPrice(id));
        const chunkResults = await Promise.all(promises);

        chunkResults.forEach(res => {
            if (res.price) {
                // Apply Markup
                let cost = res.price;
                let sell = cost < 0.50 ? cost + 0.40 : cost + 0.50;
                sell += 0.05;
                sell = Math.round(sell * 100) / 100;
                console.log(`UPDATE: ${res.id} -> ${sell}`);
            } else {
                console.log(`ERROR: ${res.id} -> ${res.error}`);
            }
        });

        // Rate limit kindness
        await new Promise(r => setTimeout(r, 200));
    }
}

run();
