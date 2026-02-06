import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SMSPoolClient } from '@/lib/providers/SMSPoolClient';

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

        // 2. Get Order Details (to verify ownership and refund amount)
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('order_id', orderId)
            .eq('user_id', user.id)
            .single();

        if (orderError || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        if (order.status === 'cancelled' || order.status === 'refunded') {
            return NextResponse.json({ message: 'Already cancelled' });
        }

        // 3. Cancel on SMSPool
        const client = new SMSPoolClient(SMSPOOL_API_KEY);

        const cancelled = await client.cancelOrder(orderId);

        if (cancelled) {
            // 4. Refund Logic
            // Fetch latest balance first to be safe
            const { data: profile } = await supabaseAdmin.from('users').select('balance').eq('user_id', user.id).single();
            const currentBalance = profile?.balance || 0;
            const refundAmount = Number(order.cost);
            const newBalance = currentBalance + refundAmount;

            // Record Refund
            await supabaseAdmin.from('users').update({ balance: newBalance }).eq('user_id', user.id);
            await supabaseAdmin.from('orders').update({ status: 'cancelled' }).eq('order_id', orderId);

            return NextResponse.json({ success: true, new_balance: newBalance });
        } else {
            // If SMSPool says "Cannot cancel" (maybe it expired or already received SMS?), we should handle that.
            return NextResponse.json({ error: 'Could not cancel order. It may be expired or already completed.' }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Cancel Error:", error);
        return NextResponse.json({ error: 'Cancel failed' }, { status: 500 });
    }
}
