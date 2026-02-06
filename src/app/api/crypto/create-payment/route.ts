import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPPORTED_COINS } from '../../../../lib/addresses';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// OxaPay Merchant Request API
const OXAPAY_REQUEST_URL = 'https://api.oxapay.com/merchants/request';

export async function POST(req: NextRequest) {
    try {
        // Get auth token
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        // Verify user
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        const { amount, currency } = await req.json();

        // Validate amount
        if (!amount || amount < 1) {
            return NextResponse.json({ success: false, error: 'Minimum deposit is $1' }, { status: 400 });
        }

        // Validate currency (Optional for request, but good for tracking)
        const currencyUpper = currency?.toUpperCase() || 'USDT';

        // Check if merchant key is configured
        if (!process.env.OXAPAY_MERCHANT_KEY) {
            console.error('OXAPAY_MERCHANT_KEY not configured');
            return NextResponse.json({
                success: false,
                error: 'Payment gateway not configured'
            }, { status: 500 });
        }

        const orderId = `order-${user.id}-${Date.now()}`;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voltsms.store';

        // Generate Payment Link
        // OxaPay expects string for amount often
        const callbackUrl = `${siteUrl}/api/crypto/webhook`;
        const returnUrl = `${siteUrl}/dashboard`;
        const oxapayPayload = {
            merchant: process.env.OXAPAY_MERCHANT_KEY,
            amount: amount.toString(),
            currency: currencyUpper,
            callbackUrl: callbackUrl,
            returnUrl: returnUrl
        };

        console.log('OxaPay Callback URL:', callbackUrl);

        console.log('OxaPay Payload:', JSON.stringify(oxapayPayload, null, 2));

        console.log('OxaPay Request:', { ...oxapayPayload, merchant_api_key: '***' });

        const oxapayResponse = await fetch(OXAPAY_REQUEST_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(oxapayPayload)
        });

        const oxapayData = await oxapayResponse.json();
        console.log('OxaPay Response Status:', oxapayResponse.status);
        console.log('OxaPay Response Body:', JSON.stringify(oxapayData, null, 2));

        // Result 100 means success in OxaPay v1
        if ((oxapayData.result === 100 || oxapayData.message === 'success') && oxapayData.payLink) {

            // Log pending payment
            try {
                await supabaseAdmin.from('pending_crypto_payments').insert({
                    user_id: user.id,
                    track_id: oxapayData.trackId || orderId,
                    amount: amount,
                    currency: currencyUpper,
                    status: 'pending',
                    created_at: new Date().toISOString()
                });
            } catch (dbError) {
                console.error('DB insert error (non-fatal):', dbError);
            }

            return NextResponse.json({
                success: true,
                payLink: oxapayData.payLink,
                trackId: oxapayData.trackId
            });
        } else {
            console.error('OxaPay API Error:', oxapayData);
            return NextResponse.json({
                success: false,
                error: oxapayData.message || 'Payment generation failed',
                details: oxapayData
            }, { status: 400 });
        }

    } catch (error) {
        console.error('Create payment error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
