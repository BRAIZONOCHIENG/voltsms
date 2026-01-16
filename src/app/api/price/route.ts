import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { service, country } = await req.json();

        if (!service || !country) {
            return NextResponse.json({ error: 'Service and country are required' }, { status: 400 });
        }

        const SMSPOOL_API_KEY = process.env.SMSPOOL_API_KEY;
        if (!SMSPOOL_API_KEY) {
            console.error("SMSPOOL_API_KEY is missing");
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // 1. Fetch Price from SMSPool
        // Using 'request/price' endpoint: https://smspool.net/api/request/price?key=...&country=...&service=...
        // MOCK_SERVICES id usually matches SMSPool service id.
        const smspoolRes = await fetch(`https://api.smspool.net/request/price?key=${SMSPOOL_API_KEY}&country=${country}&service=${service}`);
        const smspoolData = await smspoolRes.json();

        if (!smspoolData.price) {
            return NextResponse.json({ error: 'Service unavailable' }, { status: 404 });
        }

        const costPrice = parseFloat(smspoolData.price);

        // 2. Apply Smart Pricing Strategy
        // Goal: High margins on cheap numbers, competitive margins on mid-range, capped profit on expensive numbers.

        let sellingPrice = 0;

        if (costPrice < 0.50) {
            // Tier 1: Cheap Services (< $0.50)
            // Strategy: Fixed markup of +$0.40 to ensure minimum profit.
            // Example: $0.10 -> $0.50 (+fee) = $0.55
            sellingPrice = costPrice + 0.40;
        } else {
            // Tier 2: All Other Services (>= $0.50)
            // Strategy: Flat Profit of +$0.50.
            // This keeps prices low and competitive (closer to $2 range) while guaranteeing $0.50 profit.
            // Example $1.50 -> $2.00 (+fee) = $2.05
            sellingPrice = costPrice + 0.50;
        }

        // Add small fixed fee for fluctuations
        sellingPrice += 0.05;

        // Round to 2 decimal places
        sellingPrice = Math.round(sellingPrice * 100) / 100;

        return NextResponse.json({
            price: sellingPrice,
            cost: costPrice, // Optional: useful for debugging/admin
            service: service,
            country: country
        });

    } catch (error: any) {
        console.error('Price fetch error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch price' }, { status: 500 });
    }
}
