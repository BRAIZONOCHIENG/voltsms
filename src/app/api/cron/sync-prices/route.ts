
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MOCK_SERVICES } from '@/app/dashboard/services';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: Request) {
    const SMSPOOL_API_KEY = process.env.SMSPOOL_API_KEY;
    if (!SMSPOOL_API_KEY) {
        return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
    }

    const FAMOUS_BRANDS = [
        'google', 'whatsapp', 'telegram', 'facebook', 'tinder', 'instagram', 'tiktok',
        'uber', 'openai', 'discord', 'twitter', 'snapchat', 'netflix', 'amazon'
    ];

    // Split services into High Priority and Normal
    const famousServices = MOCK_SERVICES.filter(s => FAMOUS_BRANDS.includes(s.id));
    const otherServices = MOCK_SERVICES.filter(s => !FAMOUS_BRANDS.includes(s.id));

    // Combine with famous first
    const sortedServices = [...famousServices, ...otherServices];

    const countries = ['1']; // US
    const errors: any[] = [];
    let totalUpdated = 0;

    for (const country of countries) {
        const chunkSize = 5;
        let batchUpdates: any[] = [];

        for (let i = 0; i < sortedServices.length; i += chunkSize) {
            const chunk = sortedServices.slice(i, i + chunkSize);

            await Promise.all(chunk.map(async (service) => {
                try {
                    const res = await fetch(`https://api.smspool.net/request/price?key=${SMSPOOL_API_KEY}&country=${country}&service=${service.id}`);
                    const data = await res.json();

                    if (data.price) {
                        const costPrice = parseFloat(data.price);

                        // Markup Formula
                        let sellingPrice = 0;
                        if (costPrice < 0.50) {
                            sellingPrice = costPrice + 0.40;
                        } else {
                            sellingPrice = costPrice + 0.50;
                        }
                        sellingPrice += 0.05;
                        sellingPrice = Math.round(sellingPrice * 100) / 100;

                        batchUpdates.push({
                            service_id: service.id,
                            country_code: country,
                            cost_price: costPrice,
                            selling_price: sellingPrice
                        });
                    } else {
                        // errors.push({ service: service.id, error: data.message || 'No price' });
                    }
                } catch (err: any) {
                    errors.push({ service: service.id, error: err.message });
                }
            }));

            // Save every 20 items (4 chunks) or if high priority
            if (batchUpdates.length >= 20 || i < famousServices.length) {
                if (batchUpdates.length > 0) {
                    const { error } = await supabase
                        .from('price_cache')
                        .upsert(batchUpdates, { onConflict: 'service_id,country_code' });

                    if (!error) {
                        totalUpdated += batchUpdates.length;
                        batchUpdates = []; // Clear batch
                    } else {
                        console.error('Upsert error:', error);
                    }
                }
            }

            // Small delay to prevent rate limits
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        // Flush remaining
        if (batchUpdates.length > 0) {
            const { error } = await supabase
                .from('price_cache')
                .upsert(batchUpdates, { onConflict: 'service_id,country_code' });
            if (!error) totalUpdated += batchUpdates.length;
        }
    }

    return NextResponse.json({
        success: true,
        updated: totalUpdated,
        errors: errors.slice(0, 50) // Return top 50 errors
    });
}
