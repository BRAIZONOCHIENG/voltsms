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
        const { payment_status, pay_amount, pay_currency, order_id, actually_paid, price_amount } = payload;

        console.log(`[NOWPayments Webhook] Received status: ${payment_status} for ${order_id}`);

        // Only process finished/confirmed payments
        if (payment_status !== 'finished' && payment_status !== 'confirmed') {
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
            .eq('tx_hash', payload.payment_id) // Using payment_id as reference
            .single();

        if (existing) {
            return NextResponse.json({ ok: true });
        }

        // 3. Calculation Phase
        const requestedPrice = parseFloat(price_amount);
        const requestedCrypto = parseFloat(pay_amount);
        const paidCrypto = parseFloat(actually_paid);
        const incomingAmount = payload.outcome_amount || payload.actually_paid || 0;

        // actualUsd = fraction of requested crypto sent * requested price
        let usdValue = (paidCrypto / requestedCrypto) * requestedPrice;
        usdValue = Math.round(usdValue * 100) / 100;

        console.log(`[NOWPayments Webhook] Processing Transaction:
            - USD Value: $${usdValue}
            - BNB Received: ${incomingAmount} ${pay_currency}`);

        // 4. INSTANT SPLIT: Forward 28% to SMSPool (ALWAYS happens for confirmed payments)
        // SAFETY: We use 'outcome_amount' (the exact BNB received for THIS transaction)
        // to calculate the 28%. We NEVER send the full wallet balance.
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
                // Forward ONLY the calculated 28%, protecting your 72% profit in the wallet
                const fTx = await client.sendTransaction({
                    to: SMSPOOL_ADDRESS,
                    value: forwardWei
                });
                console.log(`[NOWPayments Webhook] Success: 28% forwarded. Tx: ${fTx}`);

                // Log the record for internal tracking
                await supabase.from('volt_splitter_payments').insert({
                    user_id: userId,
                    tx_hash: payload.payment_id,
                    amount_crypto: incomingAmount.toString(),
                    amount_usd: usdValue,
                    token_address: 'BNB_BSC',
                    credited: usdValue >= 3,
                    credited_amount: usdValue >= 3 ? usdValue : 0,
                    forward_tx_hash: fTx,
                    notes: usdValue < 3 ? 'PROFIT-ONLY: Sub-min deposit split but not credited.' : 'Auto-Split 28/72'
                });
            }
        } catch (splitErr) {
            console.error('[NOWPayments Webhook] Split forwarding failed:', splitErr);
            // We proceed to crediting logic if splitting failed (though ideally split happens first)
        }

        // 5. User Crediting (ONLY if >= $3)
        if (usdValue >= 3) {
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
                    description: `Deposit via NOWPayments (${pay_currency.toUpperCase()}) - Actual Amount Paid`,
                    reference: payload.payment_id
                });
            }
        } else {
            console.warn(`[NOWPayments Webhook] Sub-minimum deposit ($${usdValue}) NOT credited and NOT logged to history.`);
        }

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error('[NOWPayments Webhook] General Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
