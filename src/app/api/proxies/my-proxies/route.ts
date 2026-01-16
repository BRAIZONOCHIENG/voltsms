
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    try {
        // Mock User ID for MVP
        const userId = 'user-id-placeholder';

        const { data: proxies, error } = await supabaseAdmin
            .from('proxies')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('purchase_date', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, proxies: proxies || [] });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
