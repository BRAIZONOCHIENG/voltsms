import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    // IMPORTANT: In Next.js App Router (dynamic), params is a Promise or object. 
    // Standard signature: (request, context)
    // context.params is where we find it.

    try {
        const { id } = await params; // Await params if using latest Next.js types

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

        // Get Order
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('order_id', id)
            .eq('user_id', keyData.user_id) // Ensure ownership
            .single();

        if (error || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Optionally, actively check (sync) here if pending?
        // Similar logic to api/orders/route.ts or verify modal.
        // For V1 MVP, just returning DB state is acceptable, forcing user to poll our sync mechanisms 
        // OR we duplicate the sync check here. 
        // Let's implement active check if pending. 

        /* 
        if (order.status === 'pending') {
             // Active check logic... (omitted for brevity unless requested, can add later)
        }
        */

        return NextResponse.json({
            id: order.order_id,
            service: order.service,
            phone: order.phone,
            status: order.status,
            code: order.code || null,
            cost: order.cost,
            created_at: order.created_at,
            expires_at: order.expires_at // Ensure we return this
        });

    } catch (e: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
