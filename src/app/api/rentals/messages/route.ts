import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRentalMessages } from '../../../../lib/smspool-rentals';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

        const { rentalId } = await req.json();
        if (!rentalId) return NextResponse.json({ error: 'Missing rentalId' }, { status: 400 });

        // Security Check: Ensure rental belongs to user
        const { data: rental, error: rentalError } = await supabaseAdmin
            .from('rentals')
            .select('smspool_rental_id')
            .eq('id', rentalId) // Check by internal UUID first
            .eq('user_id', user.id)
            .single();

        let smspoolIds = rental ? [rental.smspool_rental_id] : [];

        // Fallback: If passed ID is actually the SMSPool ID directly (for simplicity in some flows)
        if (!rental) {
            const { data: directRental } = await supabaseAdmin
                .from('rentals')
                .select('smspool_rental_id')
                .eq('smspool_rental_id', rentalId)
                .eq('user_id', user.id)
                .single();
            if (directRental) smspoolIds = [directRental.smspool_rental_id];
        }

        if (smspoolIds.length === 0) {
            return NextResponse.json({ error: 'Rental not found or unauthorized' }, { status: 404 });
        }

        const messages = await getRentalMessages(smspoolIds[0]);
        return NextResponse.json({ messages });

    } catch (error: any) {
        console.error("Fetch Rental Messages Error:", error);
        return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
    }
}
