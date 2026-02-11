import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || (!authHeader.startsWith('Bearer sk_live_') && !authHeader.startsWith('Bearer vk_'))) {
            return NextResponse.json({ error: 'Unauthorized: Invalid API Key Format' }, { status: 401 });
        }
        const apiKey = authHeader.replace('Bearer ', '');
        console.log(`[API Debug] Protocol: ${req.nextUrl.protocol}, Host: ${req.headers.get('host')}, Auth: ${authHeader}`);

        // Validate Key
        const { data: keyData, error: keyError } = await supabaseAdmin
            .from('api_keys')
            .select('user_id')
            .eq('key', apiKey)
            .eq('is_active', true)
            .single();

        if (keyError || !keyData) {
            return NextResponse.json({ error: 'Unauthorized: Invalid or inactive API Key' }, { status: 401 });
        }

        // Fetch Balance
        const { data: profile } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('user_id', keyData.user_id)
            .single();

        // Update last used
        supabaseAdmin.from('api_keys').update({ last_used_at: new Date() }).eq('key', apiKey).then();

        return NextResponse.json({
            balance: profile?.balance || 0,
            currency: 'USD'
        });

    } catch (e: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
