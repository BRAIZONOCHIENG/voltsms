import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OXAPAY_MERCHANT_KEY = process.env.OXAPAY_MERCHANT_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
    // 1. Auth Check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ detail: 'Invalid token' }, { status: 401 });

    // 2. Parse Body
    const body = await req.json();
    const { currency, network } = body;
    // network is optional or inferred strictly from currency symbol if simpler?
    // Oxapay needs network usually if ambiguous (like USDT). 
    // For MVP, we pass what frontend sends.

    if (!currency) return NextResponse.json({ detail: 'Currency required' }, { status: 400 });

    try {
        const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/webhook/oxapay`;

        // 3. Request Static Address
        // Header Auth required as per debug.
        const res = await fetch('https://api.oxapay.com/v1/payment/static-address', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'merchant_api_key': OXAPAY_MERCHANT_KEY
            },
            body: JSON.stringify({
                currency: currency,
                network: network || undefined,
                callbackUrl: callbackUrl,
                email: user.email || 'user@example.com',
                orderId: user.id
            })
        });

        const data = await res.json();

        if (res.status === 200 && data.result !== 100 && data.message !== 'Operation completed successfully!') {
            // Sometimes Oxapay returns 200 with result code?
            // Debug output showed: {"data":{...}, "message":"Operation...", "status":200}
            // So success check is status === 200.
        }

        if (data.status === 200 || data.result === 100) {
            return NextResponse.json({
                address: data.data.address,
                qr_code: data.data.qr_code,
                currency: currency,
                network: data.data.network
            });
        } else {
            return NextResponse.json({ detail: data.message || 'Oxapay Error' }, { status: 500 });
        }
    } catch (e) {
        console.error("Oxapay Address Error:", e);
        return NextResponse.json({ detail: 'Request failed' }, { status: 500 });
    }
}
