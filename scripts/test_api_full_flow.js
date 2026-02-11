
const axios = require('axios');
const API_KEY = 'vk_7k7nop0vj0cmksll6y6is'; // Use the working key
const BASE_URL = 'http://localhost:3000/api/v1';

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

async function testFullFlow() {
    try {
        console.log('--- 1. Checking Balance ---');
        const balanceRes = await axios.get(`${BASE_URL}/balance`, { headers });
        console.log('Balance:', balanceRes.data);

        console.log('\n--- 2. Checking Services (Filter: US) ---');
        const servicesRes = await axios.get(`${BASE_URL}/services?country=US`, { headers });
        const igService = servicesRes.data.services.find(s => s.id === 'instagram');
        console.log('Instagram US Price:', igService ? igService.price : 'Not found');

        console.log('\n--- 3. Placing Order (Instagram - Indonesia - Low Cost) ---');
        // valid service and country (Indonesia has cheap numbers usually)
        const orderRes = await axios.post(`${BASE_URL}/order`, {
            service: 'instagram',
            country: 'ID'
        }, { headers });
        console.log('Order Result:', orderRes.data);
        const orderId = orderRes.data.id;

        if (!orderId) throw new Error('No order ID returned');

        console.log(`\n--- 4. Checking Order Status (${orderId}) ---`);
        // Check immediate status
        const statusRes = await axios.get(`${BASE_URL}/order/${orderId}`, { headers });
        console.log('Status Result:', statusRes.data);

        console.log(`\n--- 5. Cancelling Order (${orderId}) ---`);
        // Cancel to save money/clean up
        const cancelRes = await axios.post(`${BASE_URL}/cancel`, { id: orderId }, { headers });
        console.log('Cancel Result:', cancelRes.data);

        console.log('\n--- Test Complete: SUCCESS ---');

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

testFullFlow();
