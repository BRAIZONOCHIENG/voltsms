import { NextResponse } from 'next/server';
import { getFreeProxies } from '@/lib/webshare';

export async function GET() {
    try {
        const proxies = await getFreeProxies();
        return NextResponse.json({ success: true, proxies });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
