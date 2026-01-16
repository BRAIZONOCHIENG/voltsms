
const fs = require('fs');
const https = require('https');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const keyMatch = envContent.match(/SMSPOOL_API_KEY=(.+)/);
const key = keyMatch ? keyMatch[1].trim() : null;

if (!key) {
    console.error("Could not find SMSPOOL_API_KEY in .env.local");
    process.exit(1);
}

const services = ['instagram'];
const country = '1'; // US

services.forEach(service => {
    const url = `https://api.smspool.net/request/price?key=${key}&country=${country}&service=${service}`;
    console.log(`Checking ${service}...`);

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`${service}: ${data}`);
        });
    }).on('error', err => {
        console.error(`${service} Error:`, err.message);
    });
});
