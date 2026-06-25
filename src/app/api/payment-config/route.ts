import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || '',
        paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || ''
    });
}
