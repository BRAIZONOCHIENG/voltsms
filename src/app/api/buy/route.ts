import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const reqBody = await req.json();
        const { service, country, price, serviceName } = reqBody;
        const verificationMethod = reqBody.verificationMethod; // 'sms' or 'voice'

        // 0. Check Maintenance Mode
        const { readJson } = await import('@/lib/json-db');
        const settings = await readJson('settings.json', { maintenance_mode: false });
        if (settings.maintenance_mode) {
            return NextResponse.json({
                error: 'Service Temporarily Unavailable due to maintenance. Please try again later.'
            }, { status: 503 });
        }

        // 1. Validate User Session
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // 2. Check User Balance
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        let currentBalance = 0;

        if (profileError || !profile) {
            // Self-healing: create user if missing
            console.log("User row missing, creating default for:", user.id);
            const { error: insertErr } = await supabaseAdmin
                .from('users')
                .insert({ user_id: user.id, balance: 0 });

            if (insertErr) {
                console.error("Failed to auto-create user:", insertErr);
                return NextResponse.json({ error: 'User profile not found and creation failed' }, { status: 500 });
            }
            currentBalance = 0;
        } else {
            currentBalance = profile.balance;
        }

        if (currentBalance < price) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }

        // 3. Prepare SMSPool Request
        const SMSPOOL_API_KEY = process.env.SMSPOOL_API_KEY;
        if (!SMSPOOL_API_KEY) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        let purchaseUrl = `https://api.smspool.net/purchase/sms?key=${SMSPOOL_API_KEY}&country=${country}&service=${service}`;

        // Handle Voice Verification
        if (verificationMethod === 'voice') {
            // "Mike" pool is often used for Voice/Flash in SMSPool context
            // If this pool is incorrect, the API will fail and we return that error.
            purchaseUrl += `&pool=Mike`;

            // Security: Ensure price is correct for voice
            if (price < 2.20) {
                return NextResponse.json({ error: 'Invalid price for voiced verification' }, { status: 400 });
            }
        }

        // 4. Execute Purchase
        const purchaseRes = await fetch(purchaseUrl);
        const purchaseData = await purchaseRes.json();

        if (purchaseData.success === 0) {
            return NextResponse.json({ error: purchaseData.message || 'Failed to purchase number from provider' }, { status: 503 });
        }

        // Success! We have a number.
        const phoneNumber = purchaseData.phonenumber;
        const orderId = purchaseData.order_id;
        const region = purchaseData.cc;

        // 5. Deduct User Balance
        const newBalance = currentBalance - price;
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ balance: newBalance })
            .eq('user_id', user.id);

        if (updateError) {
            console.error("CRITICAL: Failed to deduct balance after successful purchase", updateError);
        }

        // 6. Store Order in Database
        const { error: insertError } = await supabaseAdmin
            .from('orders')
            .insert({
                user_id: user.id,
                order_id: orderId, // SMSPool Order ID
                service: serviceName, // e.g. "Google"
                phone: phoneNumber,
                cost: price, // The price the user paid
                provider_cost: purchaseData.cost || 0, // The actual cost from SMSPool
                status: 'pending', // Waiting for SMS
                country: region
            });

        if (insertError) {
            console.error("Failed to store order:", insertError);
        }

        return NextResponse.json({
            success: true,
            phone: phoneNumber,
            order_id: orderId,
            new_balance: newBalance
        });

    } catch (error: unknown) {
        console.error('Purchase error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
