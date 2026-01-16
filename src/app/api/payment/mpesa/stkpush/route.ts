
import { type NextRequest, NextResponse } from 'next/server';

import { stkPush } from '../../../../../lib/mpesa';


import { supabase } from '../../../../../lib/supabaseClient';

export async function POST(req: NextRequest) {
    try {
        // 1. Auth Check (using standard header check or session)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        const { phone, amount } = await req.json();

        // 2. Validate inputs
        if (!phone || !amount) {
            return NextResponse.json({ error: 'Missing phone or amount' }, { status: 400 });
        }

        if (amount < 1) { // Min 1 KES
            return NextResponse.json({ error: 'Amount must be at least 1 KES' }, { status: 400 });
        }

        // 3. Initiate STK Push
        // We'll use the user ID as unique reference or create a temp transaction ID
        const orderId = `MP-${Date.now()}`;

        const mpesaRes = await stkPush(phone, amount, orderId);

        // 4. Handle Response
        if (mpesaRes.ResponseCode === "0") {
            // Success - STK Push sent
            return NextResponse.json({
                success: true,
                message: 'STK Push Sent. Check your phone.',
                checkoutRequestID: mpesaRes.CheckoutRequestID
            });
        } else {
            return NextResponse.json({
                success: false,
                error: mpesaRes.errorMessage || 'STK Push Failed'
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('STK Push Error:', error);
        return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
    }
}
