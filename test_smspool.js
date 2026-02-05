const fs = require('fs');
const path = require('path');

// Try to read .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
} catch (e) {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) process.env[key.trim()] = value.trim();
        });
    } catch (e) { }
}

const API_KEY = process.env.SMSPOOL_API_KEY;

if (!API_KEY) {
    console.error("No SMSPOOL_API_KEY found in env");
    process.exit(1);
}

async function test() {
    console.log("Testing SMSPool Pricing...");

    // 1. Request price for Service 1 (1688) Country 1 (US)
    console.log("\n1. Requesting price for Service 1:");
    try {
        const res1 = await fetch(`https://api.smspool.net/request/price?key=${API_KEY}&country=1&service=1`);
        const data1 = await res1.json();
        console.log(JSON.stringify(data1));
    } catch (e) { console.error(e); }

    // 2. Request bulk price
    console.log("\n2. Requesting price for Country 1 (bulk?):");
    try {
        const res2 = await fetch(`https://api.smspool.net/request/price?key=${API_KEY}&country=1`);
        const data2 = await res2.json();
        console.log(JSON.stringify(data2).substring(0, 500));
    } catch (e) { console.error(e); }
}

test();
