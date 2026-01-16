// Native fetch in Node 18+

const OXAPAY_MERCHANT_KEY = "NQLZOK-DXZXOZ-YPKFNQ-PHLK52";

async function testOxapay() {
    console.log("Testing Oxapay from Node.js...");
    try {
        const res = await fetch('https://api.oxapay.com/v1/payment/static-address', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'merchant_api_key': OXAPAY_MERCHANT_KEY
            },
            body: JSON.stringify({
                currency: 'BTC',
                callbackUrl: 'http://localhost:3000/api/webhook/oxapay',
                email: 'test@voltsms.internal',
                orderId: 'test_123'
            })
        });

        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}

testOxapay();
