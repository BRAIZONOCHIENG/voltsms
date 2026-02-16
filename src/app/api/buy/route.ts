import dns from 'dns';
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SMSPoolClient } from '@/lib/providers/SMSPoolClient';
import { GrizzlySMSClient } from '@/lib/providers/GrizzlySMSClient';
/*
 * -----------------------------------------------------------------------------
 * 🔒 LOCKED FILE - CRITICAL PAYMENT INFRASTRUCTURE
 * -----------------------------------------------------------------------------
 * DO NOT MODIFY this file without extreme caution.
 * It handles real money transactions, balance deductions, and external API calls.
 * Accidental changes here can cause financial loss or service outage.
 * 
 * See .agent/workflows/protected-files.md for details.
 * -----------------------------------------------------------------------------
 */
import { SMSPOOL_SERVICE_MAPPING } from '@/lib/smspool_service_mapping';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// SMSPool Config
const SMSPOOL_API_KEY = process.env.SMSPOOL_API_KEY!;
const GRIZZLY_API_KEY = process.env.GRIZZLY_API_KEY;

// SMSPool uses numeric IDs. Map ISO country codes to SMSPool country IDs.
const COUNTRY_CODE_TO_SMSPOOL: Record<string, string> = {
    'US': '1',    // United States
    'GB': '2',    // United Kingdom
    'CA': '36',   // Canada
    'AU': '60',   // Australia
    'DE': '24',   // Germany
    'NL': '3',    // Netherlands
    'FR': '16',   // France
    'ES': '64',   // Spain
    'IT': '122',  // Italy
    'IN': '22',   // India
    'ID': '6',    // Indonesia
    'PH': '67',   // Philippines
    'MY': '12',   // Malaysia
    'TH': '123',  // Thailand
    'VN': '4',    // Vietnam
    'BR': '11',   // Brazil
    'MX': '53',   // Mexico
    'RU': '56',   // Russia
    'PL': '25',   // Poland
    'UA': '7',    // Ukraine
    'NG': '152',  // Nigeria
    'KE': '116',  // Kenya
    'ZA': '152',  // South Africa (approximation)
    'PK': '50',   // Pakistan
    'BD': '153',  // Bangladesh
    'TR': '97',   // Turkey
    'SE': '69',   // Sweden
    'NO': '117',  // Norway
    'DK': '44',   // Denmark
    'FI': '43',   // Finland
    'BE': '62',   // Belgium
    'AT': '66',   // Austria
    'CH': '37',   // Switzerland
    'PT': '41',   // Portugal
    'RO': '35',   // Romania
    'HU': '42',   // Hungary
    'IE': '59',   // Ireland
    'NZ': '63',   // New Zealand
    'SG': '52',   // Singapore
    'HK': '51',   // Hong Kong
    'JP': '10',   // Japan
    'KR': '65',   // South Korea
    'CN': '156',  // China
};

// Special overrides for common service names (supplements the full SMSPOOL_SERVICE_MAPPING)
const SERVICE_OVERRIDES: Record<string, string> = {
    '9999': '817', // "Service Not Listed" / "Not Listed / Other / Any"
    'anyother': '817',
    'other': '817',
};

export async function POST(req: Request) {
    try {
        const reqBody = await req.json();
        const { service, country, price, serviceName } = reqBody;

        if (!SMSPOOL_API_KEY) {
            console.error("SMSPool Config Missing");
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

        // 3. Purchase Number (Grizzly or SMSPool)
        let order;
        let providerUsed = 'smspool';

        if (GRIZZLY_API_KEY) {
            console.log("Using Grizzly SMS Provider");
            providerUsed = 'grizzly';
            try {
                // Grizzly returns { order_id, number, price? }
                // Note: Grizzly price is often not returned in purchase, we might need to estimate or fetch
                // For now, we assume cost <= price (user paid limit)
                const result = await GrizzlySMSClient.purchaseNumber(service, country);

                if (!result) {
                    throw new Error("No numbers available (Grizzly)");
                }

                order = {
                    orderId: result.order_id,
                    phoneNumber: result.number,
                    cost: price, // We deduct the user's max price for now (or exact if known)
                    expiresAt: new Date(Date.now() + 20 * 60000) // 20 min default
                };

            } catch (e: any) {
                console.error("Grizzly Purchase Error:", e.message || e);
                return NextResponse.json({
                    error: 'Grizzly SMS Service Unavailable. Try again.'
                }, { status: 503 });
            }

        } else {
            // SMSPool Fallback
            const smsClient = new SMSPoolClient(SMSPOOL_API_KEY);

            // Convert country code to SMSPool country ID
            const countryUpper = country?.toUpperCase() || '';
            const smspoolCountry = COUNTRY_CODE_TO_SMSPOOL[countryUpper] || country;

            // Convert service name to SMSPool service ID
            const serviceLower = service?.toLowerCase() || '';
            // Normalize: remove special characters for lookup
            const serviceNormalized = serviceLower.replace(/[^a-z0-9]/g, '');

            // First check overrides, then the full static mapping
            let smspoolService = SERVICE_OVERRIDES[serviceLower] ||
                SERVICE_OVERRIDES[serviceNormalized] ||
                SMSPOOL_SERVICE_MAPPING[serviceLower] ||
                SMSPOOL_SERVICE_MAPPING[serviceNormalized];

            if (!smspoolService) {
                console.log(`[Buy API] No mapping found for service="${serviceLower}" (normalized: "${serviceNormalized}")`);
                // Last resort: use raw service value
                smspoolService = service;
            }

            console.log(`[Buy API] SMSPool Purchase: service=${smspoolService} (${serviceLower}), country=${smspoolCountry} (${country})`);

            try {
                // Reverting to static $1.00 limit as per user request.
                // pricing_option: '1' ensures we always fetch the highest quality number.
                order = await smsClient.purchaseNumber(smspoolService, smspoolCountry, '1', 1.00);
            } catch (e: any) {
                console.error("SMSPool Purchase Error:", e.message || e);
                return NextResponse.json({
                    error: "no numbers available for this country at the moment, try again later or choose a different country"
                }, { status: 503 });
            }
        }

        // 4. Deduct User Balance
        const newBalance = currentBalance - price;

        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ balance: newBalance })
            .eq('user_id', user.id);

        if (updateError) {
            console.error("Balance update error:", updateError);
        }

        // 5. Store Order
        try {
            const { error: insertError } = await supabaseAdmin.from('orders').insert({
                user_id: user.id,
                order_id: order.orderId,
                service: serviceName || service,
                phone: order.phoneNumber,
                cost: price,
                provider_cost: order.cost || price, // Fallback if provider doesn't return cost
                status: 'pending',
                provider: providerUsed // Store which provider was used (Requires migration!)
            });

            if (insertError) throw insertError;

        } catch (dbError) {
            console.error('Order storage failed, rolling back balance...', dbError);
            // ROLLBACK BALANCE
            await supabaseAdmin
                .from('users')
                .update({ balance: currentBalance })
                .eq('user_id', user.id);

            return NextResponse.json({ error: 'Transaction failed. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            phone: order.phoneNumber,
            order_id: order.orderId,
            new_balance: newBalance,
            expires_at: order.expiresAt ? order.expiresAt.toISOString() : new Date(Date.now() + 20 * 60000).toISOString()
        });

    } catch (error: any) {
        console.error('Purchase error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
