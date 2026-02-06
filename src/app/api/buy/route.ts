import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PVAPinsClient } from '@/lib/providers/PVAPinsClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// PVAPins Config
const PVAPINS_API_KEY = process.env.PVAPINS_API_KEY!;

// PVAPins uses country NAMES, not ISO codes. Map common codes to PVAPins names.
const COUNTRY_CODE_TO_PVAPINS: Record<string, string> = {
    'US': 'USA',
    'GB': 'UK',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'NL': 'Netherlands',
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'IN': 'India',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'MY': 'Malaysia',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'RU': 'Russia',
    'PL': 'Poland',
    'UA': 'Ukraine',
    'NG': 'Nigeria',
    'KE': 'Kenya',
    'ZA': 'South Africa',
    'EG': 'Egypt',
    'PK': 'Pakistan',
    'BD': 'Bangladesh',
    'TR': 'Turkey',
    'AE': 'UAE',
    'SA': 'Saudi Arabia',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'HK': 'Hong Kong',
    'SG': 'Singapore',
    'TW': 'Taiwan',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Peru',
    'VE': 'Venezuela',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'BE': 'Belgium',
    'AT': 'Austria',
    'CH': 'Switzerland',
    'PT': 'Portugal',
    'GR': 'Greece',
    'CZ': 'Czech Republic',
    'RO': 'Romania',
    'HU': 'Hungary',
    'IE': 'Ireland',
    'NZ': 'New Zealand',
    'IL': 'Israel',
};



export async function POST(req: Request) {
    try {
        const reqBody = await req.json();
        const { service, country, price, serviceName } = reqBody;

        if (!PVAPINS_API_KEY) {

            console.error("PVAPins Config Missing");
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // 1. Validate User Session
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        // 2. Check User Balance
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        let currentBalance = profile?.balance || 0;

        if (currentBalance < price) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }

        // 3. Purchase from PVAPins
        const pvaClient = new PVAPinsClient(PVAPINS_API_KEY);

        // Convert country code to PVAPins country name
        const countryUpper = country?.toUpperCase() || '';
        const pvapinsCountry = COUNTRY_CODE_TO_PVAPINS[countryUpper] || country;

        // Normalize service name (lowercase for PVAPins API)
        // Map special service IDs to PVAPins-compatible names
        let pvapinsService = service?.toLowerCase() || '';
        if (pvapinsService === '9999' || pvapinsService === 'other' || pvapinsService === 'ot') {
            pvapinsService = 'anyother'; // PVAPins uses 'anyother' for generic services
        }

        console.log(`[Buy API] Purchasing: service=${pvapinsService}, country=${pvapinsCountry} (original: ${service}, ${country})`);

        let order;

        try {
            order = await pvaClient.purchaseNumber(pvapinsService, pvapinsCountry);
        } catch (e: any) {
            console.error("PVAPins Purchase Error:", e.message || e);
            return NextResponse.json({
                error: 'Stock currently unavailable for this service. Please try a different country or service.'
            }, { status: 503 });
        }

        // 4. Deduct User Balance (Use the PRICE passed from frontend/strategy, NOT the cost)
        const newBalance = currentBalance - price;

        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ balance: newBalance })
            .eq('user_id', user.id);

        // 5. Store Order (Safe)
        try {
            const { error: insertError } = await supabaseAdmin.from('orders').insert({
                user_id: user.id,
                order_id: order.orderId,
                service: serviceName,
                phone: order.phoneNumber,
                cost: price, // Revenue
                provider_cost: order.cost, // Expense
                status: 'pending',
                provider: 'pvapins'
            });

            if (insertError) throw insertError;

        } catch (dbError) {
            console.error('Order storage failed, rolling back balance...', dbError);
            // ROLLBACK BALANCE
            await supabaseAdmin
                .from('users')
                .update({ balance: currentBalance }) // Restore original
                .eq('user_id', user.id);

            return NextResponse.json({ error: 'Transaction failed. Please try again. Balance refunded.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            phone: order.phoneNumber,
            order_id: order.orderId,
            new_balance: newBalance,
            expires_at: new Date(Date.now() + 15 * 60000).toISOString() // 15 mins default
        });

    } catch (error: any) {
        console.error('Purchase error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
