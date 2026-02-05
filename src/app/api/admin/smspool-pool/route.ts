import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Admin endpoint to view SMSPool forwarding pool status
// This helps you know how much to forward to SMSPool
export async function GET(req: NextRequest) {
    try {
        // Simple admin auth check - check for admin API key
        const adminKey = req.headers.get('x-admin-key');
        const expectedKey = process.env.ADMIN_API_KEY;

        if (!expectedKey || adminKey !== expectedKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get pending forwarding amount
        const { data: pendingPool, error: poolError } = await supabaseAdmin
            .from('smspool_forwarding_pool')
            .select('*, pending_crypto_payments(track_id, currency)')
            .eq('forwarded', false);

        if (poolError) {
            console.error('Error fetching pool:', poolError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // Calculate totals
        const totalPending = pendingPool?.reduce((sum, p) => sum + parseFloat(p.amount_usd), 0) || 0;

        // Get total profit
        const { data: profitData } = await supabaseAdmin
            .from('profit_ledger')
            .select('amount_usd');

        const totalProfit = profitData?.reduce((sum, p) => sum + parseFloat(p.amount_usd), 0) || 0;

        // Get recent completed payments
        const { data: recentPayments } = await supabaseAdmin
            .from('pending_crypto_payments')
            .select('*')
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            smspoolForwarding: {
                pendingAmountUSD: totalPending.toFixed(2),
                pendingCount: pendingPool?.length || 0,
                targetAddress: '9VMSFJVYGaTHdmJ2A5W9XU3z7wA7Sqwt9eYkoq34zNem',
                network: 'SOL'
            },
            profit: {
                totalUSD: totalProfit.toFixed(2)
            },
            recentPayments: recentPayments?.map(p => ({
                trackId: p.track_id,
                amount: p.amount,
                currency: p.currency,
                smsPoolAmount: p.smspool_amount,
                profitAmount: p.profit_amount,
                completedAt: p.completed_at
            })) || []
        });

    } catch (error) {
        console.error('Admin API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Mark items as forwarded (after you manually send to SMSPool)
export async function POST(req: NextRequest) {
    try {
        const adminKey = req.headers.get('x-admin-key');
        const expectedKey = process.env.ADMIN_API_KEY;

        if (!expectedKey || adminKey !== expectedKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { ids, notes } = await req.json();

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ error: 'Missing ids array' }, { status: 400 });
        }

        // Mark as forwarded
        const { error: updateError } = await supabaseAdmin
            .from('smspool_forwarding_pool')
            .update({
                forwarded: true,
                forwarded_at: new Date().toISOString(),
                notes: notes || 'Manually forwarded'
            })
            .in('id', ids);

        if (updateError) {
            return NextResponse.json({ error: 'Update failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true, marked: ids.length });

    } catch (error) {
        console.error('Admin API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
