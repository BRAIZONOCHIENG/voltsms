import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc } from 'viem/chains';

const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
const SMSPOOL_ADDRESS = "0xdc9325dcd68ec9c83e6f7e1aa65d1ef1a014cad0" as `0x${string}`; // The static address provided by user

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-nowpayments-sig');

        // 1. Verify NOWPayments Signature
        const hmac = crypto.createHmac('sha512', IPN_SECRET!);
        hmac.update(JSON.stringify(JSON.parse(body), Object.keys(JSON.parse(body)).sort()));
        const expectedSignature = hmac.digest('hex');

        if (signature !== expectedSignature) {
            console.error('[NOWPayments Webhook] Invalid Signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(body);
        const { payment_status, pay_amount, pay_currency, order_id, actually_paid, price_amount, payment_id } = payload;

        console.log(`[NOWPayments Webhook] Received Event:
            - Status: ${payment_status}
            - Payment ID: ${payment_id}
            - Order ID: ${order_id}`);

        // Only process finished/confirmed payments
        if (payment_status !== 'finished' && payment_status !== 'confirmed') {
            console.log(`[NOWPayments Webhook] Skipping non-final status: ${payment_status}`);
            return NextResponse.json({ ok: true });
        }

        // Extract user ID from order_id (format: user_UUID_timestamp)
        const userId = order_id.split('_')[1];
        if (!userId) {
            console.error('[NOWPayments Webhook] Missing UserId in order_id:', order_id);
            return NextResponse.json({ error: 'Invalid order_id' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 2. Prevent Double Processing
        const { data: existing } = await supabase
            .from('volt_splitter_payments')
            .select('id')
            .eq('tx_hash', payment_id)
            .single();

        if (existing) {
            console.log(`[NOWPayments Webhook] Already processed: ${payment_id}`);
            return NextResponse.json({ ok: true });
        }

        // 3. Calculation Phase
        const requestedPrice = parseFloat(price_amount);
        const requestedCrypto = parseFloat(pay_amount);
        const paidCrypto = parseFloat(actually_paid);

        // Safety: outcome_amount is the amount received AFTER NOWPayments fees.
        // If not present, we fall back to actually_paid.
        const incomingAmount = parseFloat(payload.outcome_amount || payload.actually_paid || "0");

        // actualUsd = fraction of requested crypto sent * requested price
        // This handles over/under payments correctly.
        let usdValue = (paidCrypto / requestedCrypto) * requestedPrice;
        usdValue = Math.round(usdValue * 100) / 100;

        console.log(`[NOWPayments Webhook] Processing Confirmed Payment:
            - USD Value: $${usdValue}
            - Net Crypto Received: ${incomingAmount} ${pay_currency}`);

        // 4. INSTANT SPLIT: Forward 28% to SMSPool
        try {
            const hotWalletPrivateKey = process.env.HOT_WALLET_PRIVATE_KEY as `0x${string}`;
            if (!hotWalletPrivateKey) throw new Error('Missing Hot Wallet Key');

            const account = privateKeyToAccount(hotWalletPrivateKey);
            const client = createWalletClient({
                account,
                chain: bsc,
                transport: http(process.env.ALCHEMY_BSC_RPC || 'https://bsc-dataseed1.binance.org')
            });

            const receivedWei = parseEther(incomingAmount.toString());
            const forwardWei = (receivedWei * 28n) / 100n;

            if (forwardWei > 0n) {
                console.log(`[NOWPayments Webhook] Initiating 28% split (${forwardWei} wei) to ${SMSPOOL_ADDRESS}`);
                const fTx = await client.sendTransaction({
                    to: SMSPOOL_ADDRESS,
                    value: forwardWei
                });
                console.log(`[NOWPayments Webhook] Split Success: ${fTx}`);

                // Log the record for internal tracking
                await supabase.from('volt_splitter_payments').insert({
                    user_id: userId,
                    tx_hash: payment_id,
                    amount_crypto: incomingAmount.toString(),
                    amount_usd: usdValue,
                    token_address: 'BNB_BSC',
                    credited: usdValue >= 3,
                    credited_amount: usdValue >= 3 ? usdValue : 0,
                    forward_tx_hash: fTx,
                    notes: usdValue < 3 ? 'PROFIT-ONLY: Sub-min deposit split but not credited.' : 'Auto-Split 28/72'
                });
            }
        } catch (splitErr: any) {
            console.error('[NOWPayments Webhook] Split forwarding failed:', splitErr.message || splitErr);
        }

        // 5. User Crediting (ONLY if >= $3)
        if (usdValue >= 3) {
            console.log(`[NOWPayments Webhook] Crediting user ${userId} with $${usdValue}`);
            const { error: creditError } = await supabase.rpc('increment_balance', {
                target_user_id: userId,
                amount: usdValue
            });

            if (!creditError) {
                await supabase.from('transactions').insert({
                    user_id: userId,
                    type: 'deposit',
                    amount: usdValue,
                    currency: 'CRYPTO_NP',
                    status: 'completed',
                    description: `Deposit via NOWPayments (${pay_currency.toUpperCase()})`,
                    reference: payment_id
                });
            } else {
                console.error('[NOWPayments Webhook] Balance increment failed:', creditError);
            }
        } else {
            console.warn(`[NOWPayments Webhook] Sub-minimum deposit ($${usdValue}) NOT credited.`);
        }

        return NextResponse.json({ ok: true });

    } catch (error: any) {
        console.error('[NOWPayments Webhook] Fatal Error:', error.message || error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
