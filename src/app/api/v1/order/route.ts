import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PVAPinsClient } from '@/lib/providers/PVAPinsClient';
import { SERVICES_DATA } from '@/app/dashboard/services_data';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const PVAPINS_API_KEY = process.env.PVAPINS_API_KEY!;

export async function POST(req: NextRequest) {
    try {
        // 1. Auth & Validation
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer sk_live_')) {
            return NextResponse.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
        }
        const apiKey = authHeader.replace('Bearer ', '');

        const { data: keyData, error: keyError } = await supabaseAdmin
            .from('api_keys')
            .select('user_id')
            .eq('key', apiKey)
            .eq('is_active', true)
            .single();

        if (keyError || !keyData) {
            return NextResponse.json({ error: 'Unauthorized: Invalid or inactive API Key' }, { status: 401 });
        }

        // Update last used
        supabaseAdmin.from('api_keys').update({ last_used_at: new Date() }).eq('key', apiKey).then();

        const body = await req.json();
        const { service, country } = body;

        if (!service || !country) {
            return NextResponse.json({ error: 'Missing parameters: service, country' }, { status: 400 });
        }

        // 2. Determine Price (Use local data or fetch dynamic if implemented)
        // For V1, we use SERVICES_DATA standard price.
        const serviceInfo = SERVICES_DATA.find(s => s.id === service || s.name.toLowerCase() === service.toLowerCase());
        const serviceId = serviceInfo ? serviceInfo.id : service; // Use ID if found, else pass raw
        // Fallback price if custom service
        const price = serviceInfo ? serviceInfo.price : 0.80;

        // 3. Balance Check
        const { data: profile } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('user_id', keyData.user_id)
            .single();

        const currentBalance = profile?.balance || 0;
        if (currentBalance < price) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 });
        }

        // 4. Purchase Logic

        // Deduct Balance First
        const { error: deductError } = await supabaseAdmin
            .from('users')
            .update({ balance: currentBalance - price })
            .eq('user_id', keyData.user_id);

        if (deductError) throw new Error('Balance update failed');

        // Call Provider
        const pvaClient = new PVAPinsClient(PVAPINS_API_KEY);
        let order;
        try {
            order = await pvaClient.purchaseNumber(serviceId, country);
        } catch (providerError: any) {
            // Refund on failure
            await supabaseAdmin.from('users').update({ balance: currentBalance }).eq('user_id', keyData.user_id);
            return NextResponse.json({ error: 'Service unavailable or provider error' }, { status: 503 });
        }

        // Store Order
        try {
            await supabaseAdmin.from('orders').insert({
                user_id: keyData.user_id,
                order_id: order.orderId,
                service: serviceInfo ? serviceInfo.name : serviceId,
                phone: order.phoneNumber,
                cost: price,
                provider_cost: order.cost,
                status: 'pending',
                provider: 'pvapins'
            });
        } catch (dbError) {
            console.error('API Order DB insert failed', dbError);
            // Refund
            await supabaseAdmin.from('users').update({ balance: currentBalance }).eq('user_id', keyData.user_id);
            return NextResponse.json({ error: 'Transaction processing failed' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            id: order.orderId,
            phone: order.phoneNumber,
            service: serviceInfo ? serviceInfo.name : serviceId,
            price: price,
            status: 'pending',
            created_at: new Date().toISOString()
        });

    } catch (e: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
