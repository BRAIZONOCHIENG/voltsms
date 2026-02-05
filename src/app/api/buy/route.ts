import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PVAPinsClient } from '@/lib/providers/PVAPinsClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// PVAPins Config
const PVAPINS_API_KEY = process.env.PVAPINS_API_KEY!;



export async function POST(req: Request) {
    try {
        const reqBody = await req.json();
        const { service, country, price, serviceName } = reqBody;

        if (!PVAPINS_API_KEY) {

            console.error("PVAPins Config Missing");
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // 1. Validate User Session
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        // 2. Check User Balance
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        let currentBalance = profile?.balance || 0;

        if (currentBalance < price) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }

        // 3. Purchase from PVAPins
        const pvaClient = new PVAPinsClient(PVAPINS_API_KEY);

        let order;

        try {
            order = await pvaClient.purchaseNumber(service, country);
        } catch (e: any) {
            console.error("PVAPins Purchase Error:", e);
            return NextResponse.json({
                error: 'Stock currently unavailable for this service. Please try a different country or service.'
            }, { status: 503 });
        }

        // 4. Deduct User Balance (Use the PRICE passed from frontend/strategy, NOT the cost)
        const newBalance = currentBalance - price;

        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ balance: newBalance })
            .eq('user_id', user.id);

        // 5. Store Order (Safe)
        try {
            const { error: insertError } = await supabaseAdmin.from('orders').insert({
                user_id: user.id,
                order_id: order.orderId,
                service: serviceName,
                phone: order.phoneNumber,
                cost: price, // Revenue
                provider_cost: order.cost, // Expense
                status: 'pending',
                provider: 'pvapins'
            });

            if (insertError) throw insertError;

        } catch (dbError) {
            console.error('Order storage failed, rolling back balance...', dbError);
            // ROLLBACK BALANCE
            await supabaseAdmin
                .from('users')
                .update({ balance: currentBalance }) // Restore original
                .eq('user_id', user.id);

            return NextResponse.json({ error: 'Transaction failed. Please try again. Balance refunded.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            phone: order.phoneNumber,
            order_id: order.orderId,
            new_balance: newBalance,
            expires_at: new Date(Date.now() + 15 * 60000).toISOString() // 15 mins default
        });

    } catch (error: any) {
        console.error('Purchase error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
