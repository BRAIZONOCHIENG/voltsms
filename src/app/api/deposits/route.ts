import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ detail: 'Invalid token' }, { status: 401 });
        }

        // Fetch successful deposits and referral bonuses from transactions
        const { data, error } = await supabaseAdmin
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .in('type', ['deposit', 'referral_bonus', 'crypto_deposit'])
            .eq('status', 'completed')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, deposits: data });
    } catch (error: any) {
        console.error('Fetch deposits error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
