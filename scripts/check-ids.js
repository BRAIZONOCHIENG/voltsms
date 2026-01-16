
const fs = require('fs');
const https = require('https');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const keyMatch = envContent.match(/SMSPOOL_API_KEY=(.+)/);
const key = keyMatch ? keyMatch[1].trim() : null;

if (!key) {
    console.error("Could not find SMSPOOL_API_KEY");
    process.exit(1);
}

// Test IDs
const ids = ['instagram', 'ig', 'facebook', 'fb', 'google', 'go', 'gmail'];
const country = '1';

ids.forEach(id => {
    const url = `https://api.smspool.net/request/price?key=${key}&country=${country}&service=${id}`;

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`${id}: ${data}`);
        });
    }).on('error', err => {
        console.error(`${id} Error:`, err.message);
    });
});
