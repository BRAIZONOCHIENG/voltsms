import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const { orderId } = await req.json();

        // 1. Auth Check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        // 2. Get Order Details (to verify ownership)
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('order_id', orderId)
            .eq('user_id', user.id)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Only expire pending orders
        if (order.status !== 'pending') {
            return NextResponse.json({ message: 'Order already processed' });
        }

        // 3. Update order status to expired
        // Note: SMSPool automatically refunds expired orders on their end
        await supabaseAdmin
            .from('orders')
            .update({ status: 'expired' })
            .eq('order_id', orderId);

        // 4. Refund user balance (since SMSPool refunds us automatically)
        const { data: profile } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        const currentBalance = profile?.balance || 0;
        const refundAmount = Number(order.cost);
        const newBalance = currentBalance + refundAmount;

        await supabaseAdmin
            .from('users')
            .update({ balance: newBalance })
            .eq('user_id', user.id);

        return NextResponse.json({ success: true, new_balance: newBalance });

    } catch (error: any) {
        console.error("Expire Order Error:", error);
        return NextResponse.json({ error: 'Failed to expire order' }, { status: 500 });
    }
}
