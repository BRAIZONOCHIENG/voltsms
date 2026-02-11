import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SERVICES_DATA } from '@/app/dashboard/services_data';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer sk_live_')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const apiKey = authHeader.replace('Bearer ', '');

        // Validate Key
        const { data: keyData, error: keyError } = await supabaseAdmin
            .from('api_keys')
            .select('user_id')
            .eq('key', apiKey)
            .eq('is_active', true)
            .single();

        if (keyError || !keyData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update last used
        supabaseAdmin.from('api_keys').update({ last_used_at: new Date() }).eq('key', apiKey).then();

        // Optional: Filter by Country to get specific price
        const { searchParams } = new URL(req.url);
        const country = searchParams.get('country');

        // Return Services from our local definition (faster than proxying PVAPins every time)
        // We map them to a clean API format
        const services = SERVICES_DATA.map(s => {
            let price = s.price;
            if (country && s.prices && s.prices[country]) {
                price = s.prices[country];
            }
            return {
                id: s.id,
                name: s.name,
                price: price,
                category: s.category
            };
        });

        return NextResponse.json({ services });

    } catch (e: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
