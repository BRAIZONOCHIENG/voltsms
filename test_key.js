const https = require('node:https');

const API_KEY = 'J0MZ7SweU9P6uBPzwliH6VwnRGAQg8db';

function fetchNative(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    console.log(`Status: ${res.statusCode}`);
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.log("Raw body:", data);
                    reject(e);
                }
            });
        });
        req.on('error', reject);
    });
}

async function test() {
    console.log("Testing Provided Key...");
    try {
        const res = await fetchNative(`https://api.smspool.net/request/price?key=${API_KEY}&country=1&service=1`);
        console.log(JSON.stringify(res, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
