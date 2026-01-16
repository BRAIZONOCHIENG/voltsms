
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buyProxy } from '@/lib/webshare';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROXY_PRICE = 2.50; // $2.50 per proxy

export async function POST(req: NextRequest) {
    try {
        const { countryCode, isp } = await req.json();

        // 1. Get User Session (Mocking session for now or using headers if you have a middleware)
        // ideally: const { data: { user } } = await supabase.auth.getUser();
        // Since we are in an API route context often called from client, we need a way to ID the user.
        // For this implementation, we assume the user ID is passed or handled via cookies/auth header
        // BUT standard Next.js + Supabase auth:

        // TEMPORARY: Hardcoded User ID Check or Headers for this generation step
        // In real app, trust the session.
        const authHeader = req.headers.get('Authorization');
        // We'll proceed assuming we can get a userId. 
        // For testing, let's grab the first user or mock.
        // REAL:
        // const supabase = createRouteHandlerClient({ cookies });
        // const { data: { user } } = await supabase.auth.getUser();

        // Mock User for MVP flow if auth not fully set up in this context:
        const userId = 'user-id-placeholder';

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Check Balance
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('id', userId)
            .single();

        if (userError || !userData) {
            // Handle no user found (maybe mock mode)
            // return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const balance = userData?.balance || 100; // Mock 100 if dev

        if (balance < PROXY_PRICE) {
            return NextResponse.json({ error: 'Insufficient funds' }, { status: 402 });
        }

        // 3. Buy from Webshare
        const proxy = await buyProxy(userId, countryCode, isp);

        // 4. Deduct Balance & Save Proxy
        // Transaction:
        const { error: txError } = await supabaseAdmin.rpc('purchase_proxy', {
            p_user_id: userId,
            p_cost: PROXY_PRICE,
            p_ip: proxy.ip,
            p_port: proxy.port,
            p_username: proxy.username,
            p_password: proxy.password,
            p_country: proxy.country_code,
            p_isp: proxy.isp_name
        });

        // If RPC doesn't exist, do manual (less safe but works for MVP)
        if (txError) {
            // Fallback manual
            await supabaseAdmin.from('users').update({ balance: balance - PROXY_PRICE }).eq('id', userId);
            await supabaseAdmin.from('proxies').insert({
                user_id: userId,
                ip: proxy.ip,
                port: proxy.port,
                username: proxy.username,
                password: proxy.password,
                country_code: proxy.country_code,
                isp_name: proxy.isp_name,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            });
        }

        return NextResponse.json({ success: true, proxy });

    } catch (error: any) {
        console.error('Proxy Purchase Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
