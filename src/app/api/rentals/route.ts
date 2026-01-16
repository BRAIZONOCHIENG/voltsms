
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { purchaseRental, getRentalStatus } from '../../../lib/smspool-rentals';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// GET: List user's rentals
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    // Fetch from Supabase 'rentals' table
    const { data: rentals, error } = await supabaseAdmin
        .from('rentals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        // Table might not exist yet during dev, fail gracefully or return empty
        console.error("Supabase Error:", error);
        return NextResponse.json([]);
    }

    return NextResponse.json(rentals || []);
}

// POST: Purchase a new rental
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

        const body = await req.json();
        const { service, country, days, autoCheck, areaCode, autoRenew } = body;

        if (!country || !days) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

        // 1. Calculate Price (Dynamic based on days, etc.)
        // Pricing logic typically: Base + (DayRate * Days). 
        // For simplicity using fixed rate for demo: $1.50/day base + service markup
        const dailyRate = 1.50;
        let cost = dailyRate * days;
        if (service === 'unlimited') cost *= 1.5; // Premium for unlimited
        if (autoCheck) cost += 0.30; // Auto-check fee

        // Check User Balance
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('balance')
            .eq('id', user.id)
            .single();

        if (!profile || profile.balance < cost) {
            return NextResponse.json({ error: 'Insufficient Balance' }, { status: 402 });
        }

        // 2. Purchase from SMSPool
        const rental = await purchaseRental(country, days, service || 'unlimited', autoRenew, areaCode);

        // 3. Deduct Balance
        await supabaseAdmin.rpc('decrement_balance', { user_id: user.id, amount: cost });

        // 4. Save to Database
        const { data: newRental, error: dbError } = await supabaseAdmin
            .from('rentals')
            .insert({
                user_id: user.id,
                smspool_rental_id: rental.rental_id,
                phone_number: rental.number,
                service: service || 'unlimited',
                country: country,
                status: 'active',
                expires_at: new Date(rental.expiry!).toISOString(),
                auto_renew: !!autoRenew // Save preference
            })
            .select()
            .single();

        if (dbError) {
            console.error("DB Save Error:", dbError);
            // In a real app we might need to rollback the purchase or refund
            return NextResponse.json({ error: 'Database save failed, please contact support with ID: ' + rental.rental_id }, { status: 500 });
        }

        return NextResponse.json({ success: true, rental: newRental });

    } catch (error: any) {
        console.error("Rental Purchase Error:", error);
        return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
    }
}
