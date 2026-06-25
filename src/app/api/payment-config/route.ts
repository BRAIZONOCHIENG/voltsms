import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    // We use bracket notation here because Next.js Webpack statically replaces dot-notation NEXT_PUBLIC variables 
    // at build time. By using brackets, we force Node.js to read them dynamically from the live runtime environment.
    return NextResponse.json({
        paystackPublicKey: process.env['NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY'] || process.env.PAYSTACK_PUBLIC_KEY || '',
        paypalClientId: process.env['NEXT_PUBLIC_PAYPAL_CLIENT_ID'] || process.env.PAYPAL_CLIENT_ID || ''
    });
}
