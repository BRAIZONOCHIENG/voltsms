import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
    try {
        // 1. Fetch Auth Users (for Emails)
        const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) throw authError;

        // 2. Fetch Public Users (for Balances/Status)
        const { data: dbUsers, error: dbError } = await supabaseAdmin
            .from('users')
            .select('*');
        if (dbError) throw dbError;

        // 3. Fetch Affiliate Profiles (for IPs and Ref codes)
        const { data: profiles } = await supabaseAdmin
            .from('affiliate_profiles')
            .select('user_id, registration_ip, referral_code');

        // 4. Merge data
        const processedUsers = authUsers.map((authU: any) => {
            // Prioritize user_id as it's the identifier used by the user dashboard
            const dbU = dbUsers?.find(d => d.user_id === authU.id) ||
                dbUsers?.find(d => d.id === authU.id);

            const profile = profiles?.find(p => p.user_id === authU.id);

            return {
                id: authU.id,
                email: authU.email || '---',
                balance: dbU?.balance ?? 0,
                is_banned: dbU?.is_banned ?? false,
                created_at: authU.created_at,
                registration_ip: profile?.registration_ip || dbU?.registration_ip || '---',
                referral_code: profile?.referral_code || '---'
            };
        });

        // Sort by created_at desc
        processedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return NextResponse.json({ success: true, users: processedUsers });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId, balance, is_banned } = await req.json();

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
        }

        const updateData: any = {};
        if (balance !== undefined) updateData.balance = balance;
        if (is_banned !== undefined) updateData.is_banned = is_banned;

        let error;
        if (balance !== undefined) {
            // 1. Get current balance to calculate adjustment
            const { data: currentDb } = await supabaseAdmin
                .from('users')
                .select('balance')
                .eq('user_id', userId)
                .single();

            const currentVal = currentDb?.balance ?? 0;
            const adjustment = balance - currentVal;

            if (adjustment !== 0 || !currentDb) {
                // 2. Use atomic increment RPC or upsert
                // If the record exists, use RPC for safety
                if (currentDb) {
                    const { error: rpcError } = await supabaseAdmin.rpc('increment_balance', {
                        target_user_id: userId,
                        amount: adjustment
                    });
                    error = rpcError;
                } else {
                    // Create the record if it doesn't exist
                    const { error: upsertError } = await supabaseAdmin
                        .from('users')
                        .upsert({
                            user_id: userId,
                            balance: balance,
                            is_banned: false
                        });
                    error = upsertError;
                }

                // 3. Log the manual adjustment in transactions
                if (!error) {
                    await supabaseAdmin.from('transactions').insert({
                        user_id: userId,
                        type: 'admin_edit',
                        amount: adjustment,
                        balance_before: currentVal,
                        balance_after: balance,
                        description: `Manual balance adjustment by admin.`,
                        status: 'completed'
                    });
                }
            }
        }

        if (is_banned !== undefined) {
            const { error: banError } = await supabaseAdmin
                .from('users')
                .upsert({
                    user_id: userId,
                    is_banned
                }, { onConflict: 'user_id' });
            error = error || banError;
        }

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
