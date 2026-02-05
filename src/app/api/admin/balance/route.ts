import { NextResponse } from 'next/server';
import { PVAPinsClient } from '@/lib/providers/PVAPinsClient';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // 1. Auth Check (Admin Only)
    // For now, simpler check or rely on calling context. 
    // Ideally check for Admin Role in Supabase

    // const authHeader = req.headers.get('Authorization');
    // if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const PVAPINS_API_KEY = process.env.PVAPINS_API_KEY;

    if (!PVAPINS_API_KEY) {
        return NextResponse.json({ error: 'Config Missing' }, { status: 500 });
    }

    try {
        const client = new PVAPinsClient(PVAPINS_API_KEY);
        const balance = await client.getBalance();

        return NextResponse.json({ balance: balance, currency: 'USD' });
    } catch (error: any) {
        console.error('Admin Balance Check Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
