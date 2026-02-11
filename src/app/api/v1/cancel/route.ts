import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PVAPinsClient } from '@/lib/providers/PVAPinsClient';
import { GrizzlySMSClient } from '@/lib/providers/GrizzlySMSClient';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const PVAPINS_API_KEY = process.env.PVAPINS_API_KEY!;

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer sk_live_')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const apiKey = authHeader.replace('Bearer ', '');

        // Validate Key
        const { data: keyData, error: keyError } = await supabaseAdmin
            .from('api_keys')
            .select('user_id')
            .eq('key', apiKey)
            .eq('is_active', true)
            .single();

        if (keyError || !keyData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update last used
        supabaseAdmin.from('api_keys').update({ last_used_at: new Date() }).eq('key', apiKey).then();

        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
        }

        // Verify Ownership & Status
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('order_id', id)
            .eq('user_id', keyData.user_id)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.status !== 'pending') {
            return NextResponse.json({ error: `Cannot cancel order in '${order.status}' state` }, { status: 400 });
        }

        // Cancel based on provider
        let cancelled = false;

        if (order.provider === 'smspool') {
            // Status '8' = Cancel
            cancelled = await GrizzlySMSClient.setStatus(order.order_id, '8');
        } else {
            // Fallback to PVAPins (Legacy)
            const client = new PVAPinsClient(PVAPINS_API_KEY);
            cancelled = await client.cancelOrder(order.order_id);
        }

        if (cancelled) {
            // Refund
            const { data: profile } = await supabaseAdmin.from('users').select('balance').eq('user_id', keyData.user_id).single();
            const currentBalance = profile?.balance || 0;
            const refundAmount = Number(order.cost);

            await supabaseAdmin.from('users').update({ balance: currentBalance + refundAmount }).eq('user_id', keyData.user_id);
            await supabaseAdmin.from('orders').update({ status: 'cancelled' }).eq('order_id', order.order_id);

            return NextResponse.json({ success: true, message: 'Order cancelled and refunded' });
        } else {
            return NextResponse.json({ error: 'Failed to cancel order' }, { status: 400 });
        }

    } catch (e: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
