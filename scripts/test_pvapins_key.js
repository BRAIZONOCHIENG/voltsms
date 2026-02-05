const { PVAPinsClient } = require('./src/lib/providers/PVAPinsClient');
require('dotenv').config({ path: '.env.local' });

// Mock fetch for Node environment if needed, but Next.js 13+ usually has it.
// We'll use the one from the provider or global if available.

async function testBalance() {
    console.log("Testing PVAPins Connection...");
    const apiKey = process.env.PVAPINS_API_KEY;
    console.log(`Key Present: ${!!apiKey}`);

    // We need to simulate the client since it's in TS and we're running JS script quickly
    // OR we can just hit the endpoint directly to verify the key works.

    try {
        const url = `https://ipv6.pvapins.com/api/v1/user/get_balance.php?customer=${apiKey}`;
        // Note: User provided API URL pvapins.com, typical endpoint structure based on docs.
        // If this URL is different in the client, I should match it.
        // Checking Client... Client uses PVAPINS_BASE_URL.

        // Let's just use the Client code logic:
        const res = await fetch(url);
        const text = await res.text();
        console.log("Response:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}

testBalance();
