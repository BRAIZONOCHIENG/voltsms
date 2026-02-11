const axios = require('axios');
const API_KEY = 'vk_7k7nop0vj0cmksll6y6is'; // From previous step
const BASE_URL = 'http://localhost:3000/api/v1';

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

async function testApi() {
    try {
        // 1. Check Balance
        console.log('--- Checking Balance ---');
        const balanceRes = await axios.get(`${BASE_URL}/balance`, { headers });
        console.log('Balance:', balanceRes.data);

        if (balanceRes.data.balance < 1.0) {
            console.error('Insufficient balance to test order.');
            return;
        }

        // 2. Place Order (Service: "16" = Instagram (often cheap), Country: "ID" = Indonesia)
        console.log('\n--- Placing Order (Instagram - Indonesia) ---');
        const orderRes = await axios.post(`${BASE_URL}/order`, {
            service: 'ig',
            country: 'ID'
        }, { headers });
        console.log('Order Result:', orderRes.data);

    } catch (error) {
        console.error('API Test Failed:', error.response ? error.response.data : error.message);
    }
}

testApi();
