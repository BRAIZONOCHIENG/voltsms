import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;

export async function POST(req: Request) {
    try {
        const { amount, orderId } = await req.json();

        if (!amount || amount < 3) {
            return NextResponse.json({ error: 'Minimum deposit is $3' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create NOWPayments Invoice (Redirect Flow)
        const response = await fetch('https://api.nowpayments.io/v1/invoice', {
            method: 'POST',
            headers: {
                'x-api-key': NOWPAYMENTS_API_KEY!,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                price_amount: amount,
                price_currency: 'usd',
                order_id: `user_${user.id}_${Date.now()}`,
                order_description: `Deposit to VoltSMS - User: ${user.email}`,
                ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://voltsms.store'}/api/crypto/nowpayments/webhook`,
                success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://voltsms.store'}/dashboard?payment=success`,
                cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://voltsms.store'}/dashboard?payment=cancel`,
            }),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('NOWPayments Create Error:', error);
        return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }
}
