import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Check payment status endpoint
export async function GET(req: NextRequest) {
    try {
        // Get auth token
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        // Verify user
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        // Get trackId from query params
        const { searchParams } = new URL(req.url);
        const trackId = searchParams.get('trackId');

        if (!trackId) {
            return NextResponse.json({ success: false, error: 'Missing trackId' }, { status: 400 });
        }

        // Check payment status in database
        const { data: payment, error } = await supabaseAdmin
            .from('pending_crypto_payments')
            .select('*')
            .eq('track_id', trackId)
            .eq('user_id', user.id)
            .single();

        if (error || !payment) {
            return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency
        });

    } catch (error) {
        console.error('Check payment error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
