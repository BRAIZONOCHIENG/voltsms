import dns from 'dns';
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ detail: 'Invalid token' }, { status: 401 });

    // Fetch balance from 'users' table
    // Assuming 'users' table has 'user_id' as TEXT matching Supabase UUID
    // If not, we need to create it.

    const { data, error } = await supabaseAdmin
        .from('users')
        .select('balance')
        .eq('user_id', user.id) // Use Supabase UUID
        .single();

    if (error || !data) {
        // If user doesn't exist in our custom table, create them
        const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert({ user_id: user.id, balance: 0.0 })
            .select()
            .single();

        if (newUser) return NextResponse.json({ balance: newUser.balance });
        return NextResponse.json({ balance: 0.0 });
    }

    return NextResponse.json({ balance: data.balance });
}
