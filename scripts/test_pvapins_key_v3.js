require('dotenv').config({ path: '.env.local' });

async function testBalance() {
    console.log("Testing PVAPins Connection...");
    const apiKey = process.env.PVAPINS_API_KEY;

    // Correct Base URL from Client file
    const baseUrl = "https://api.pvapins.com/user/api/get_balance.php";
    const url = `${baseUrl}?customer=${apiKey}`;

    console.log(`Requesting: ${url.replace(apiKey, '***')}`);

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const status = res.status;
        console.log(`Status: ${status}`);

        const text = await res.text();
        console.log("Response Body:", text);

        try {
            const json = JSON.parse(text);
            if (json.balance !== undefined) {
                console.log(`SUCCESS! Balance: $${json.balance}`);
            } else {
                console.log("Parsed JSON but no balance field found.");
            }
        } catch (e) {
            console.log("Response is not JSON.");
        }

    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

testBalance();
