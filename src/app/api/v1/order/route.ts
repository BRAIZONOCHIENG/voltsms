import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GrizzlySMSClient } from '@/lib/providers/GrizzlySMSClient';
import { SERVICES_DATA } from '@/app/dashboard/services_data';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// We use GrizzlyClient but it is internally mapped to SMSPool now
// Static class usage

export async function POST(req: NextRequest) {
    try {
        // 1. Auth & Validation
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || (!authHeader.startsWith('Bearer sk_live_') && !authHeader.startsWith('Bearer vk_'))) {
            return NextResponse.json({ error: 'Unauthorized: Invalid API Key Format' }, { status: 401 });
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

        // 2. Validate Service & Price
        // Find service by ID or Name
        const serviceInfo = SERVICES_DATA.find(s => s.id === service || s.name.toLowerCase() === service.toLowerCase());

        if (!serviceInfo) {
            return NextResponse.json({ error: 'Invalid service ID or name' }, { status: 400 });
        }

        const serviceId = serviceInfo.id;
        const serviceName = serviceInfo.name;

        // Determine Price: Use country specific if available, else base
        let price = serviceInfo.price;
        if (serviceInfo.prices && serviceInfo.prices[country]) {
            price = serviceInfo.prices[country];
        }

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

        // 4. Purchase Logic (Deduct First)
        const { error: deductError } = await supabaseAdmin
            .from('users')
            .update({ balance: currentBalance - price })
            .eq('user_id', keyData.user_id);

        if (deductError) {
            return NextResponse.json({ error: 'Balance update failed' }, { status: 500 });
        }

        // 5. Call Provider
        let order;
        try {
            // Mapping handle by client internally now
            const result = await GrizzlySMSClient.purchaseNumber(serviceId, country);
            if (result) {
                order = {
                    orderId: result.order_id,
                    phone: result.number,
                    price: result.price
                };
            }
        } catch (providerError: any) {
            console.error('API Provider Error:', providerError);
            // Refund on failure
            await supabaseAdmin.from('users').update({ balance: currentBalance }).eq('user_id', keyData.user_id);
            return NextResponse.json({ error: 'Service temporarily unavailable. Please try again.' }, { status: 503 });
        }

        if (!order || !order.orderId || !order.phone) {
            // Refund on invalid response
            await supabaseAdmin.from('users').update({ balance: currentBalance }).eq('user_id', keyData.user_id);
            return NextResponse.json({ error: 'Order processing failed' }, { status: 503 });
        }

        // 6. Store Order
        const { error: dbError } = await supabaseAdmin.from('orders').insert({
            user_id: keyData.user_id,
            order_id: order.orderId,
            service: serviceName,
            phone: order.phone,
            cost: price,
            provider_cost: 0, // We hide cost in API V1
            status: 'pending',
            provider: 'smspool' // recorded as smspool via grizzly adapter
        });

        if (dbError) {
            console.error('API Order DB insert failed', dbError);
            // We don't refund here because the number WAS purchased. User can see it in dashboard history at least.
        }

        return NextResponse.json({
            success: true,
            id: order.orderId,
            phone: order.phone,
            service: serviceName,
            country: country,
            price: price,
            status: 'pending',
            expires_in: 1200, // 20 mins
            created_at: new Date().toISOString()
        });

    } catch (e: any) {
        console.error('API Critical Error', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
