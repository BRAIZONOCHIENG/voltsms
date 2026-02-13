import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { processDeposit } from '@/lib/crypto/processor';
import { parseUnits } from 'viem';

const ALCHEMY_WEBHOOK_SECRET = process.env.ALCHEMY_WEBHOOK_SECRET;

// Alchemy signature validation
function isValidSignature(requestBody: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(requestBody).digest('hex');
    return signature === digest;
}

export async function POST(req: NextRequest) {
    const signature = req.headers.get('x-alchemy-signature');
    const bodyText = await req.text();

    if (!signature || !ALCHEMY_WEBHOOK_SECRET) {
        console.warn('[Webhook] Missing signature or secret config');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isValidSignature(bodyText, signature, ALCHEMY_WEBHOOK_SECRET)) {
        console.error('[Webhook] Invalid signature');
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const payload = JSON.parse(bodyText);
        const activities = payload.event?.activity;

        if (!activities || !Array.isArray(activities)) {
            return NextResponse.json({ success: true, message: 'No activity found' });
        }

        console.log(`[Webhook] Received ${activities.length} activities from Alchemy`);

        for (const event of activities) {
            // We only care about incoming transfers to our Hot Wallet
            // Alchemy Notify 'activity' includes many fields.
            // Documentation: https://docs.alchemy.com/reference/notify-api-quickstart

            const txHash = event.hash;
            const fromAddress = event.fromAddress;
            const toAddress = event.toAddress;
            const value = event.value; // Float
            const asset = event.asset; // e.g. "USDT", "BNB"
            const rawValue = event.rawContract?.rawValue;

            if (!txHash || !fromAddress || !toAddress) {
                console.warn(`[Webhook] Skipping activity due to missing data: txHash: ${txHash}, from: ${fromAddress}, to: ${toAddress}`);
                continue;
            }

            console.log(`[Webhook] Activity: ${value} ${asset} from ${fromAddress} to ${toAddress}`);

            // Identify token address
            const isNative = asset === 'BNB';
            const tokenAddress = isNative ? 'NATIVE' : event.rawContract?.address || 'UNKNOWN';

            // Convert amount to BigInt decimals
            const decimals = 18; // Default for BSC Native & Common Tokens
            let amountBigInt = 0n;
            try {
                amountBigInt = parseUnits(value.toString(), decimals);
            } catch (e) {
                console.error(`[Webhook] Error parsing amount for tx ${txHash}: ${value}`, e);
                continue;
            }

            if (amountBigInt > 0n) {
                await processDeposit({
                    txHash,
                    from: fromAddress,
                    to: toAddress,
                    token: tokenAddress,
                    amount: amountBigInt,
                    isNative
                });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Webhook] Error processing payload:', error.message);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
