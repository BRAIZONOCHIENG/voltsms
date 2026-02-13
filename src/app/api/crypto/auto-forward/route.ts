import dns from 'dns';
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');
import { NextRequest, NextResponse } from 'next/server';

/**
 * DEPRECATED: Legacy Block Scanning
 * 
 * We have moved to real-time event-driven detection via Alchemy Notify Webhooks.
 * See: /api/crypto/webhook/route.ts
 * 
 * This route is kept for emergency manual triggering if needed, but its 
 * scanning logic has been removed to prevent double-processing/conflicts.
 */

export async function GET(req: NextRequest) {
    return NextResponse.json({
        message: 'This route is deprecated. Deposits are now handled via real-time webhooks.',
        status: 'ok'
    });
}
