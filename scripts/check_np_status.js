
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const PAYMENT_ID = '4663868515';

async function checkPayment() {
    try {
        console.log('Fetching status for payment:', PAYMENT_ID);
        const response = await axios.get(`https://api.nowpayments.io/v1/payment/${PAYMENT_ID}`, {
            headers: {
                'x-api-key': API_KEY
            }
        });
        console.log('NOWPayments Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        } else {
            console.error('Request Error:', error.message);
        }
    }
}

checkPayment();
