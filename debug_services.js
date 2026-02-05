const https = require('node:https');

// Helper to fetch
function fetchNative(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

async function test() {
    console.log("Fetching service list...");
    const data = await fetchNative('https://api.smspool.net/service/retrieve_all?country=1');
    if (Array.isArray(data) && data.length > 0) {
        console.log("First service structure:", JSON.stringify(data[0], null, 2));
        // Find Facebook to compare
        const fb = data.find(s => s.name.toLowerCase() === 'facebook');
        console.log("Facebook structure:", JSON.stringify(fb, null, 2));
    } else {
        console.log("Unexpected data:", data);
    }
}

test();
