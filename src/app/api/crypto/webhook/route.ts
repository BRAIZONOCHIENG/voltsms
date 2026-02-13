import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { processDeposit } from '@/lib/crypto/processor';

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
        const activity = payload.event?.activity;

        if (!activity || !Array.isArray(activity)) {
            return NextResponse.json({ success: true, message: 'No activity found' });
        }

        console.log(`[Webhook] Received ${activity.length} activities from Alchemy`);

        for (const event of activity) {
            // We only care about incoming transfers to our Hot Wallet
            // Alchemy Notify 'activity' includes many fields.
            // Documentation: https://docs.alchemy.com/reference/notify-api-quickstart

            const txHash = event.hash;
            const fromAddress = event.fromAddress;
            const value = event.value; // Float
            const asset = event.asset; // e.g. "USDT", "BNB"
            const rawValue = event.rawContract?.rawValue; // Hex value for tokens or null for native?

            if (!txHash || !fromAddress) continue;

            let isNative = false;
            let tokenAddress = '';
            let amountBigInt = 0n;

            if (event.category === 'external') {
                // Native BNB transfer
                isNative = true;
                tokenAddress = 'NATIVE';
                // Value is in BNB (float). Conver to Wei.
                amountBigInt = BigInt(Math.floor(value * 10 ** 18));
            } else if (event.category === 'token') {
                // ERC20/BEP20 transfer
                isNative = false;
                tokenAddress = event.rawContract.address;
                // Use raw value if possible to avoid floating point precision issues
                amountBigInt = BigInt(rawValue || '0');
            }

            if (amountBigInt > 0n) {
                await processDeposit({
                    txHash,
                    from: fromAddress,
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
