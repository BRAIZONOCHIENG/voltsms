require('dotenv').config({ path: '.env.local' });

async function testBalance() {
    console.log("Testing PVAPins Connection...");
    const apiKey = process.env.PVAPINS_API_KEY;
    console.log(`Key Present: ${!!apiKey}`);

    // Using the base URL found in previous file views
    const baseUrl = "http://ipv6.pvapins.com/api/v1/user";
    // Note: Protocol might be https, but some of these providers use http or specific IPs. 
    // Checking previous file view... `PVAPinsClient.ts` uses `${PVAPINS_BASE_URL}/${endpoint}`.
    // Let's assume standard pvapins.com/api/v1/user structure or just the one seen in `get_balance.php`

    // The client code saw: `get_balance.php` appended to base. 
    // And params: `customer`

    // Let's try the common endpoint for this API family (5sim/pvapins style)
    const url = `http://pvapins.com/api/v1/user/get_balance.php?customer=${apiKey}`;

    try {
        const res = await fetch(url);
        // They might return JSON or plain text
        const text = await res.text();
        console.log("Response:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}

testBalance();
