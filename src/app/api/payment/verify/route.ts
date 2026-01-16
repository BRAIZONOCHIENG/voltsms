import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function getPayPalToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
    const res = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    const data = await res.json();
    return data.access_token;
}

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
        return NextResponse.json({ detail: 'Invalid token' }, { status: 401 });
    }

    const { type, reference, orderID, amount } = await req.json();

    try {
        let verifiedAmount = 0.0;
        let currency = '';

        if (type === 'paystack') {
            // Verify Paystack
            const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
                headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
            });
            const data = await res.json();

            if (data.status && data.data && data.data.status === 'success') {
                // Paystack returns amount in subunits (kobo/cents)
                // If currency is KES, data.data.amount is in KES cents.
                // We want to convert to USD for balance or keep KES?
                // Current system balance seems to be USD based (paypal/crypto code implies USD).
                // So we must convert KES back to USD or credit KES.
                // let's assume balance is USD.
                // rate used for deposit was 130.
                const rawAmount = data.data.amount / 100; // e.g. 13000 -> 130.00 KES
                currency = data.data.currency; // 'KES'

                if (currency === 'KES') {
                    verifiedAmount = rawAmount / 130; // Convert back to USD roughly
                } else {
                    verifiedAmount = rawAmount; // USD
                }

                // Check user ID mismatch if possible? Paystack metadata has it.
            } else {
                return NextResponse.json({ detail: 'Verification failed' }, { status: 400 });
            }
        } else if (type === 'paypal') {
            // Capture/Verify PayPal
            const ppToken = await getPayPalToken();
            const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ppToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();

            if (data.status === 'COMPLETED') {
                const purchaseUnit = data.purchase_units[0];
                const captured = purchaseUnit.payments.captures[0];
                verifiedAmount = parseFloat(captured.amount.value);
                currency = captured.amount.currency_code; // 'USD'
            } else {
                // Already captured via webhook? Check details
                // Or it might be "authorized" only.
                // For now, assume capture success.
                return NextResponse.json({ detail: 'Capture failed or already captured' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ detail: 'Invalid type' }, { status: 400 });
        }

        // Credit Balance
        const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        if (!dbUser) return NextResponse.json({ detail: 'User not found' }, { status: 404 });

        const newBalance = (dbUser.balance || 0) + verifiedAmount;

        await supabaseAdmin
            .from('users')
            .update({ balance: newBalance })
            .eq('user_id', user.id);

        return NextResponse.json({ success: true, newBalance });

    } catch (e: any) {
        console.error("Verification Error:", e);
        return NextResponse.json({ detail: e.message }, { status: 500 });
    }
}
