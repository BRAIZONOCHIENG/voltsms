import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
    try {
        // 1. Fetch Affiliates
        const { data: affs, error: affsError } = await supabaseAdmin
            .from('affiliate_profiles')
            .select('*')
            .order('total_earned', { ascending: false });

        if (affsError) throw affsError;

        // 2. Fetch referral counts
        const { data: refs, error: refsError } = await supabaseAdmin
            .from('affiliate_referrals')
            .select('referrer_id');

        if (refsError) throw refsError;

        const processedAffiliates = (affs || []).map(a => ({
            ...a,
            referral_count: (refs || []).filter(r => r.referrer_id === a.user_id).length
        }));

        // 3. Fetch Commissions (Pending & Approved)
        const { data: comms, error: commsError } = await supabaseAdmin
            .from('affiliate_commissions')
            .select('*')
            .in('status', ['pending', 'approved'])
            .order('created_at', { ascending: false });

        if (commsError) throw commsError;

        return NextResponse.json({
            success: true,
            affiliates: processedAffiliates,
            commissions: comms || []
        });

    } catch (error: any) {
        console.error('[AdminAffiliates API GET] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { action, id, amount, affiliate_id, method, details, total_withdrawn } = await req.json();

        if (action === 'approve') {
            const { error } = await supabaseAdmin
                .from('affiliate_commissions')
                .update({ status: 'approved' })
                .eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === 'reject') {
            const { error } = await supabaseAdmin
                .from('affiliate_commissions')
                .update({ status: 'rejected' })
                .eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === 'payout') {
            // 1. Create payout record
            const { error: payoutError } = await supabaseAdmin
                .from('affiliate_payouts')
                .insert([
                    {
                        affiliate_id: affiliate_id,
                        amount_usd: amount,
                        payout_method: method,
                        payout_details: details,
                        status: 'paid',
                    },
                ]);

            if (payoutError) throw payoutError;

            // 2. Update total_withdrawn
            const { error: updateError } = await supabaseAdmin
                .from('affiliate_profiles')
                .update({
                    total_withdrawn: Number(total_withdrawn) + amount,
                })
                .eq('id', affiliate_id);

            if (updateError) throw updateError;

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('[AdminAffiliates API POST] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
