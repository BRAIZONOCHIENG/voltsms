import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createResellerUser } from '@/lib/packetstream';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GB_PRICE = 2.00; // Selling Price per GB

export async function POST(req: NextRequest) {
    try {
        // 1. Get User ID (Mock for now, similar to buy route)
        // In real app, trust session or header
        const userId = 'user-id-placeholder';

        // 2. Check Balance
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('id', userId)
            .single();

        const balance = userData?.balance || 0;

        if (balance < GB_PRICE) {
            return NextResponse.json({ error: 'Insufficient funds' }, { status: 402 });
        }

        // 3. Buy from PacketStream
        // Generate a random username for this allocation
        const subuser = await createResellerUser();

        // PacketStream returns { username, password, ... }
        // We give the user the endpoint
        const proxyInfo = {
            ip: 'pool.packetstream.io',
            port: 31112,
            username: subuser.username,
            password: subuser.password, // check if this is the field name
            country_code: 'Global', // Rotating
            isp_name: 'Residential Data (1GB)',
            category: 'residential_gb' // Helper tag
        };

        // 4. Deduct Balance & Save
        const { error } = await supabaseAdmin.rpc('purchase_proxy', {
            p_user_id: userId,
            p_cost: GB_PRICE,
            p_ip: proxyInfo.ip,
            p_port: proxyInfo.port,
            p_username: proxyInfo.username,
            p_password: proxyInfo.password,
            p_country: proxyInfo.country_code,
            p_isp: proxyInfo.isp_name
        });

        // Fallback if RPC fails or missing
        if (error) {
            await supabaseAdmin.from('users').update({ balance: balance - GB_PRICE }).eq('id', userId);
            await supabaseAdmin.from('proxies').insert({
                user_id: userId,
                ip: proxyInfo.ip,
                port: proxyInfo.port,
                username: proxyInfo.username,
                password: proxyInfo.password,
                country_code: proxyInfo.country_code,
                isp_name: proxyInfo.isp_name,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        }

        return NextResponse.json({ success: true, proxy: proxyInfo });

    } catch (error: any) {
        console.error('Residential Purchase Failed', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
