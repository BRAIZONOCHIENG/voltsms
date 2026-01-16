
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Or anon key if RLS allows public read
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || '1'; // Default US

    const { data, error } = await supabase
        .from('price_cache')
        .select('service_id, selling_price')
        .eq('country_code', country);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to Map for easy frontend lookup: { 'google': 0.85, ... }
    const prices: Record<string, number> = {};
    data.forEach((row: any) => {
        prices[row.service_id] = row.selling_price;
    });

    return NextResponse.json({ prices });
}
