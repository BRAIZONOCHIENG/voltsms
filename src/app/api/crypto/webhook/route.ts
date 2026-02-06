import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendPayout } from '../../../../lib/oxapay';
import { SMSPOOL_ADDRESSES } from '../../../../lib/addresses';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Revised Split: 40% Forward / 60% Profit

// Revised Split: 25% Forward (Operations) / 75% Profit (Owner)
const SMSPOOL_PERCENTAGE = 0.25;
const PROFIT_PERCENTAGE = 0.75;

/**
 * OxaPay Webhook Handler
 * 
 * Handles payment confirmations and:
 * 1. Credits user USD balance (full amount)
 * 2. Calculates 40% for SMSPool forwarding
 * 3. ATTEMPTS INSTANT FORWARDING via OxaPay Payout
 * 4. Tracks 60% as profit
 */
export async function POST(req: NextRequest) {
    let rawBody: string;
    let body: Record<string, unknown>;

    try {
        rawBody = await req.text();
        body = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    try {
        // 1. VERIFY HMAC SIGNATURE
        const hmacHeader = req.headers.get('hmac');
        const merchantKey = process.env.OXAPAY_MERCHANT_KEY;

        if (!merchantKey) {
            console.error('OXAPAY_MERCHANT_KEY not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (hmacHeader) {
            const calculatedHmac = crypto
                .createHmac('sha512', merchantKey)
                .update(rawBody)
                .digest('hex');

            if (hmacHeader !== calculatedHmac) {
                console.error('❌ Invalid HMAC signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        // 2. EXTRACT PAYMENT DATA
        const trackId = body.trackId as string || body.track_id as string;
        const status = body.status as string;
        const payAmount = parseFloat(body.payAmount as string || body.amount as string || '0');
        const currency = body.currency as string; // e.g., 'USDT', 'LTC', 'SOL'

        console.log(`📥 OxaPay Webhook [${trackId}]: ${status} ${payAmount} ${currency}`);

        if (!trackId) return NextResponse.json({ error: 'Missing trackId' }, { status: 400 });

        // 3. FIND PENDING PAYMENT
        const { data: pendingPayment, error: findError } = await supabaseAdmin
            .from('pending_crypto_payments')
            .select('*')
            .eq('track_id', trackId)
            .single();

        if (findError || !pendingPayment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // 4. IDEMPOTENCY
        if (pendingPayment.status === 'completed') {
            return NextResponse.json({ success: true, message: 'Already processed' });
        }

        // 5. STATUS UPDATES
        if (status !== 'Paid') {
            await supabaseAdmin.from('pending_crypto_payments')
                .update({ status: status.toLowerCase() })
                .eq('track_id', trackId);
            return NextResponse.json({ success: true, message: 'Status updated' });
        }

        // 6. CREDIT USER BALANCE (Full USD Amount)
        const userId = pendingPayment.user_id;
        const depositAmount = parseFloat(pendingPayment.amount); // The original USD amount

        // Calculate Splits
        const smsPoolAmountUSD = depositAmount * SMSPOOL_PERCENTAGE;
        const profitAmountUSD = depositAmount * PROFIT_PERCENTAGE;

        // Calculate crypto amount to forward
        // We assume we pay forward in the SAME currency received to avoid complex conversion logic here.
        // If user paid 100 USDT, we forward 40 USDT.
        // If user paid 1 SOL, we forward 0.4 SOL.
        const cryptoToForward = payAmount * SMSPOOL_PERCENTAGE;

        // Get current user balance and update
        const { data: currentUser } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('user_id', userId)
            .single();

        const balanceBefore = parseFloat(currentUser?.balance || 0);
        const balanceAfter = balanceBefore + depositAmount;

        // Upsert: create user if not exists, or update balance
        await supabaseAdmin.from('users')
            .upsert({
                user_id: userId,
                balance: balanceAfter
            }, { onConflict: 'user_id' });

        // 7. MARK PAYMENT COMPLETE
        await supabaseAdmin.from('pending_crypto_payments')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                profit_amount: profitAmountUSD,
                smspool_amount: smsPoolAmountUSD
            })
            .eq('track_id', trackId);

        // 8. LOG TRANSACTION
        await supabaseAdmin.from('transactions').insert({
            user_id: userId,
            type: 'deposit',
            amount: depositAmount,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            currency: currency,
            status: 'completed',
            description: `Crypto deposit - ${depositAmount} USD`,
            reference: trackId
        });

        // 9. AUTOMATED PAYOUT (THE NEW LOGIC)
        console.log(`🚀 Attempting Auto-Forward: ${cryptoToForward} ${currency} to SMSPool...`);
        let payoutResult = { success: false, message: 'Skipped' };

        // Only attempt payout if supported currency (Example logic)
        // SMSPool accepts SOL, LTC, USDT.
        // We will default to sending to the configured SOL address if the currency is SOL, 
        // OR try to send to that address if it supports the token (dangerous assumption).
        // SAFEST: Only auto-forward if currency matches the address type, or hold for manual.

        // Resolve Target Address
        let targetAddress = SMSPOOL_ADDRESSES[currency];

        // Handle USDT/USDC cases where we might need more specific network checks
        // For now, we use the default EVM address from our map, which covers most cases.
        // If we need TRC20 for USDT, we could check the network here if available.
        // (Our map defaults USDT to the EVM address, but notice user provided one address for USDT(BSC))

        if (targetAddress) {
            console.log(`🎯 Routing ${currency} to ${targetAddress}`);
            payoutResult = await sendPayout({
                address: targetAddress,
                amount: cryptoToForward,
                currency: currency,
                network: currency
            });
        } else {
            console.log(`⚠️ Auto-forward skipped: No configured address for ${currency}. Queued for manual.`);
            payoutResult = { success: false, message: 'No forwarding address config' };
        }

        const isForwarded = payoutResult.success;

        // 10. TRACK SMSPOOL FORWARDING
        await supabaseAdmin.from('smspool_forwarding_pool').insert({
            payment_id: pendingPayment.id,
            amount_usd: smsPoolAmountUSD,
            forwarded: isForwarded, // Mark as true if auto-payout worked
            forwarded_at: isForwarded ? new Date().toISOString() : null,
            notes: isForwarded ? `Auto-Forward Success: ${cryptoToForward} ${currency}` : `Pending: ${payoutResult.message}`
        });

        // 11. TRACK PROFIT
        await supabaseAdmin.from('profit_ledger').insert({
            payment_id: pendingPayment.id,
            amount_usd: profitAmountUSD
        });

        console.log(`✅ DEPOSIT COMPLETE & ${isForwarded ? 'FORWARDED' : 'QUEUED'}`);

        return NextResponse.json({
            success: true,
            newBalance: balanceAfter,
            forwarded: isForwarded
        });

    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'active',
        payoutMode: 'AUTOMATED',
        split: { smspool: '40%', profit: '60%' }
    });
}
