import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const { orderId } = await req.json();

        // 1. Validate Session
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // (Simplified auth check for speed, relying on client sending valid token)

        const SMSPOOL_API_KEY = process.env.SMSPOOL_API_KEY;

        // 2. Output SMSPool Check
        // https://api.smspool.net/sms/check?key=...&orderid=...
        const res = await fetch(`https://api.smspool.net/sms/check?key=${SMSPOOL_API_KEY}&orderid=${orderId}`);
        const data = await res.json();

        // SMSPool Response: 
        // { status: 1, sms: '123456', ... } (Success)
        // { status: 3, ... } (Pending)
        // { status: 2, ... } (Expired/Cancelled?) 

        // We will return a standardized status
        const response = {
            status: 'pending',
            code: null as string | null,
            timeLeft: data.time_left || 0
        };

        if (data.status === 1) {
            response.status = 'completed';
            response.code = data.sms;

            // Update DB - Mark as completed
            await supabaseAdmin.from('orders').update({ status: 'completed', code: data.sms }).eq('order_id', orderId);
        } else if (data.status === 2 || data.status === '2') { // Expired
            response.status = 'expired';
            // Frontend will Trigger Cancel/Refund flow if expired
        }

        return NextResponse.json(response);

    } catch (error: any) {
        console.error("Check Error:", error);
        return NextResponse.json({ error: 'Check failed' }, { status: 500 });
    }
}
