import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
    try {
        const { address, userId } = await req.json();

        if (!address || !userId) {
            return NextResponse.json({ error: 'Missing address or userId' }, { status: 400 });
        }

        // Upsert wallet address for user
        const { error } = await supabase
            .from('user_wallets')
            .upsert({
                address: address.toLowerCase(),
                user_id: userId,
                last_seen: new Date().toISOString()
            }, { onConflict: 'address' });

        if (error) {
            console.error('Error registering wallet:', error);
            // If table doesn't exist, we might get an error here.
            // But we proceed assuming user will run SQL.
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in register-wallet:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
