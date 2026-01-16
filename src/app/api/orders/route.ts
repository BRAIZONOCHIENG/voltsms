import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ detail: 'Invalid token' }, { status: 401 });

    // Fetch standard orders (SMS/Voice)
    const { data: orders, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('user_id', user.id);

    // Fetch rentals
    const { data: rentals, error: rentalsError } = await supabaseAdmin
        .from('rentals')
        .select('*')
        .eq('user_id', user.id);

    if (ordersError || rentalsError) {
        return NextResponse.json({ detail: 'Error fetching history' }, { status: 500 });
    }

    // Unify data
    const unifiedOrders = [
        ...(orders || []).map((o: any) => ({
            ...o,
            type: o.verificationMethod || (o.cost > 2 ? 'voice' : 'sms'), // Infer if missing
            created_at: o.created_at || o.timestamp // Handle standard timestamps
        })),
        ...(rentals || []).map((r: any) => ({
            order_id: r.smspool_rental_id,
            service: r.service,
            phone: r.phone_number,
            status: r.status,
            country: r.country,
            cost: 0, // Calculated dynamically mostly, or add cost column to rentals
            type: 'rental',
            created_at: r.created_at,
            expires_at: r.expires_at
        }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(unifiedOrders);
}
