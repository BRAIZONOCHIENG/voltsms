import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// PayPal creds from env
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const OXAPAY_MERCHANT_KEY = process.env.OXAPAY_MERCHANT_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function getPayPalToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');

    // LIVE Standard Endpoint (NO -m, NO Sandbox)
    const endpoint = 'https://api.paypal.com/v1/oauth2/token';
    console.log(`Getting PayPal Token from ${endpoint}...`);

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("PayPal Auth Failed:", data);
            return null;
        }

        console.log("PayPal Token Success.");
        return data.access_token;
    } catch (e) {
        console.error("PayPal Token Network Error:", e);
        return null;
    }
}

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
        console.error("Auth Error:", authError);
        return NextResponse.json({ detail: `Invalid token: ${authError?.message || 'No user'}` }, { status: 401 });
    }

    const body = await req.json();
    const { amount, method } = body; // method: 'paypal', 'crypto', etc.

    if (method === 'paypal') {
        try {
            const ppToken = await getPayPalToken();
            if (!ppToken) {
                return NextResponse.json({ detail: "PayPal Configuration Error (Auth Failed)" }, { status: 500 });
            }

            // LIVE Standard Endpoint
            const orderRes = await fetch('https://api.paypal.com/v2/checkout/orders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ppToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    intent: 'CAPTURE',
                    purchase_units: [{ amount: { currency_code: 'USD', value: amount.toString() } }],
                    application_context: {
                        brand_name: "VoltSMS",
                        user_action: "PAY_NOW",
                        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
                        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
                    }
                })
            });
            const orderData = await orderRes.json();

            if (orderRes.status !== 201) {
                console.error("PayPal Create Order Error:", orderData);
                return NextResponse.json({ detail: "PayPal API Error", error: orderData }, { status: 400 });
            }

            const approveLink = orderData.links?.find((l: any) => l.rel === 'approve')?.href;

            if (!approveLink || !orderData.id) {
                console.error("PayPal Invalid Response:", orderData);
                return NextResponse.json({ detail: "Invalid PayPal Response" }, { status: 400 });
            }

            // Return id for Smart Buttons
            return NextResponse.json({ payLink: approveLink, id: orderData.id });
        } catch (e: any) {
            console.error("PayPal Error:", e);
            return NextResponse.json({ detail: `PayPal Error: ${e.message}` }, { status: 500 });
        }
    }

    if (method === 'crypto') {
        try {
            const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhook/oxapay`;
            const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;

            const res = await fetch('https://api.oxapay.com/merchants/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchant: OXAPAY_MERCHANT_KEY,
                    amount: amount,
                    currency: 'USD',
                    life_time: 30,
                    fee_paid_by_payer: 0,
                    under_paid_cover: 2.0,
                    callbackUrl: callbackUrl,
                    returnUrl: returnUrl,
                    description: `Deposit for User ${user.id}`,
                    orderId: user.id
                })
            });

            const data = await res.json();
            if (data.result === 100 && data.payLink) {
                return NextResponse.json({ payLink: data.payLink, trackId: data.trackId });
            } else {
                return NextResponse.json({ detail: data.message || 'Oxapay Error' }, { status: 500 });
            }
        } catch (e) {
            return NextResponse.json({ detail: 'Oxapay Request Failed' }, { status: 500 });
        }
    }

    if (method === 'card' || method === 'mpesa') {
        try {
            const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
            const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;

            const RATE_USD_TO_KES = 130; // Fixed rate for now
            const amountInKES = amount * RATE_USD_TO_KES;
            const amountInSubunits = Math.round(amountInKES * 100); // KES cents

            const body = {
                email: user.email || 'user@example.com',
                amount: amountInSubunits,
                currency: 'KES', // Switched to KES (Kenyan Shillings)
                callback_url: returnUrl,
                metadata: {
                    user_id: user.id,
                    custom_fields: [
                        {
                            display_name: "User ID",
                            variable_name: "user_id",
                            value: user.id
                        }
                    ]
                },
                // Explicitly set channels based on user choice to force the right view
                channels: method === 'mpesa' ? ['mobile_money'] : ['card']
            };

            console.log(`Paystack Conversion: $${amount} * ${RATE_USD_TO_KES} = ${amountInKES} KES`);
            console.log("Paystack Body:", JSON.stringify(body));

            const res = await fetch('https://api.paystack.co/transaction/initialize', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            console.log("Paystack Response:", data);

            if (data.status && data.data && data.data.authorization_url) {
                return NextResponse.json({ payLink: data.data.authorization_url });
            } else {
                return NextResponse.json({ detail: data.message || 'Paystack Error' }, { status: 500 });
            }

        } catch (e: any) {
            console.error("Paystack Error:", e);
            return NextResponse.json({ detail: "Payment Request Failed" }, { status: 500 });
        }
    }

    // Fallback or other methods
    return NextResponse.json({ detail: 'Method not supported yet' }, { status: 400 });
}
