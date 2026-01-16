
export async function getMpesaToken() {
    const key = process.env.MPESA_CONSUMER_KEY;
    const secret = process.env.MPESA_CONSUMER_SECRET;
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const auth = Buffer.from(`${key}:${secret}`).toString('base64');

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("M-Pesa Token Error:", error);
        throw new Error("Failed to get M-Pesa access token");
    }
}

export async function stkPush(phone: string, amount: number, orderId: string) {
    const token = await getMpesaToken();
    const shortCode = process.env.MPESA_SHORTCODE || '174379';
    const passkey = process.env.MPESA_PASSKEY || '';
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    // Safaricom sandbox expects phone to be 254...
    const formattedPhone = phone.replace('+', '').replace(/^0/, '254');

    // Callback URL - Use a public ngrok URL if testing locally, or localhost for now (will fail safely)
    // IMPORTANT: In production this must be a real https URL
    const callbackUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/mpesa/callback`
        : 'https://example.com/api/payment/mpesa/callback';

    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const body = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.ceil(amount), // M-Pesa expects integers
        PartyA: formattedPhone,
        PartyB: shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: "VoltSMS",
        TransactionDesc: `Topup ${orderId}`
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    return await response.json();
}
