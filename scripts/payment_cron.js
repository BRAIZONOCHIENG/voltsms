const https = require('http'); // or 'https' if production is SSL
const cron = require('node-cron'); // Optional, or just setInterval

// Configuration
const API_URL = 'http://localhost:3000/api/crypto/auto-forward';
const INTERVAL_MS = 60 * 1000; // Check every 60 seconds

console.log(`Starting Payment Automation Daemon...`);
console.log(`Target: ${API_URL}`);
console.log(`Interval: ${INTERVAL_MS / 1000}s`);

const checkDeposits = async () => {
    const start = Date.now();
    try {
        console.log(`[${new Date().toISOString()}] Checking deposits...`);

        // Use Fetch (Node 18+)
        const res = await fetch(API_URL, {
            headers: {
                // 'Authorization': 'Bearer ...' // If verifying cron secret
            }
        });

        const data = await res.json();
        const duration = Date.now() - start;

        if (data.success) {
            if (data.processed > 0) {
                console.log(`✅ SUCCESS: Processed ${data.processed} deposits! (${duration}ms)`);
            } else {
                console.log(`ℹ️  No new deposits found. (${duration}ms)`);
            }
        } else {
            console.warn(`⚠️  Check returned unexpected status:`, data);
        }
    } catch (e) {
        console.error(`❌ ERROR: Failed to check deposits:`, e.message);
    }
};

// Initial run
checkDeposits();

// Loop
setInterval(checkDeposits, INTERVAL_MS);

// Keep alive
process.stdin.resume();
