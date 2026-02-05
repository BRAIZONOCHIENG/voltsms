import { NextResponse } from 'next/server';
import { PVAPinsClient } from '@/lib/providers/PVAPinsClient';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // Basic Security: Check for CRON_SECRET if desired, but for now open (obscure URL)
    // or assume Vercel Cron headers: 'x-vercel-cron': 'true'

    // const auth = req.headers.get('authorization');
    // if (auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const PVAPINS_API_KEY = process.env.PVAPINS_API_KEY;
    const PVAPINS_USER_ID = process.env.PVAPINS_USER_ID;
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID; // Your TG ID

    if (!PVAPINS_API_KEY || !TELEGRAM_BOT_TOKEN || !ADMIN_TELEGRAM_ID) {
        return NextResponse.json({ error: 'Missing Config' }, { status: 500 });
    }

    try {
        const client = new PVAPinsClient(PVAPINS_API_KEY);
        const balance = await client.getBalance();

        console.log(`[Balance Check] Current PVAPins Balance: $${balance}`);

        // THRESHOLD to Alert
        if (balance < 3.00) {
            // Send Alert
            const message = `⚠️ *URGENT WARNING*\n\nPVAPins Balance is LOW: *$${balance.toFixed(2)}*\n\nRefill immediately to avoid service interruption!`;

            const tgUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            await fetch(tgUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: ADMIN_TELEGRAM_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });

            return NextResponse.json({ status: 'alert_sent', balance: balance });
        }

        return NextResponse.json({ status: 'ok', balance: balance });

    } catch (error: any) {
        console.error('Balance Check Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
