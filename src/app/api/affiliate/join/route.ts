import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();

    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;

    // Check if profile already exists
    const { data: existingProfile } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (existingProfile) {
        return NextResponse.json({ success: true, profile: existingProfile });
    }

    // Generate unique referral code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = '';
    for (let i = 0; i < 8; i++) {
        referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const { fingerprint } = await request.json().catch(() => ({}));
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    const { data: profile, error: insertError } = await supabase
        .from('affiliate_profiles')
        .insert([
            {
                user_id: user.id,
                referral_code: referralCode,
                status: 'active',
                registration_ip: clientIp,
                registration_fingerprint: fingerprint || null
            }
        ])
        .select()
        .single();

    if (insertError) {
        console.error('Error creating affiliate profile:', insertError);
        return NextResponse.json({
            error: 'Failed to create affiliate profile',
            details: process.env.NODE_ENV === 'development' ? insertError.message : undefined
        }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile });
}
