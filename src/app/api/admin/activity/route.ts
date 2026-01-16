import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
    try {
        // Fetch last 10 orders
        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(10);

        if (error) throw error;

        // Transform if necessary, or return as is.
        // Assuming 'orders' has columns: user_id, service, cost, timestamp
        // We might want to fetch usernames, but that requires a join or separate fetch if users are in a different table/auth.
        // For now, simpler is better. We'll try to join if 'users' table is standard public table, 
        // but if it's auth.users only admin can see it. 
        // We'll return raw orders and frontend can handle "User X" display.

        return NextResponse.json({ success: true, data: orders });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
