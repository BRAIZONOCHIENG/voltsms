import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
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

        // Fetch History
        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('user_id', keyData.user_id)
            .order('created_at', { ascending: false })
            .limit(100); // Reasonable limit for v1

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
        }

        // Return clean format
        const cleanOrders = orders.map(o => ({
            id: o.order_id,
            service: o.service,
            phone: o.phone,
            cost: o.cost,
            status: o.status,
            code: o.code || null,
            created_at: o.created_at
        }));

        // Update last used
        supabaseAdmin.from('api_keys').update({ last_used_at: new Date() }).eq('key', apiKey).then();

        return NextResponse.json(cleanOrders);

    } catch (e: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
