import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
/*
 * -----------------------------------------------------------------------------
 * 🔒 LOCKED FILE - CRITICAL INFRASTRUCTURE
 * -----------------------------------------------------------------------------
 * DO NOT MODIFY checking logic casually.
 * This file handles polling SMSPool for codes. Breaking this means users
 * won't receive their verification codes.
 * 
 * See .agent/workflows/protected-files.md for details.
 * -----------------------------------------------------------------------------
 */
import { SMSPoolClient } from '@/lib/providers/SMSPoolClient';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const SMSPOOL_API_KEY = process.env.SMSPOOL_API_KEY!;

export async function POST(req: Request) {
    try {
        const { orderId } = await req.json();

        // 1. Auth Check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        if (!SMSPOOL_API_KEY) {
            console.error("SMSPool Config Missing");
            return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });
        }

        // 2. Client
        const client = new SMSPoolClient(SMSPOOL_API_KEY);

        // 3. Check SMS Status
        let smsCode: string | null = null;
        try {
            smsCode = await client.getSMS(orderId);
        } catch (e: any) {
            console.error("SMSPool Check Error:", e);
            // Keep pending if API errors (don't fail user yet)
            return NextResponse.json({ status: 'pending' });
        }

        if (smsCode) {
            // Success!
            // 4. Update Database
            const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update({
                    status: 'completed',
                    sms_code: smsCode,
                    full_sms: `Your code is ${smsCode}`
                })
                .eq('order_id', orderId)
                .eq('user_id', user.id);

            if (updateError) console.error("Failed to update completed order:", updateError);

            return NextResponse.json({
                status: 'completed',
                code: smsCode,
                full_sms: `Your code is ${smsCode}`
            });
        }

        // No code yet
        return NextResponse.json({ status: 'pending' });

    } catch (error) {
        console.error('Check SMS Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
