import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SMSPoolClient } from '@/lib/providers/SMSPoolClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ detail: 'Invalid token' }, { status: 401 });

    // Fetch standard orders (SMS/Voice)
    const { data: dbOrders, error: ordersError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('user_id', user.id);

    // Active Status Sync - Check pending orders against SMSPool
    if (dbOrders) {
        const pendingOrders = dbOrders.filter((o: any) => o.status === 'pending');
        if (pendingOrders.length > 0) {
            const SMSPOOL_API_KEY = process.env.SMSPOOL_API_KEY!;
            if (SMSPOOL_API_KEY) {
                const smsClient = new SMSPoolClient(SMSPOOL_API_KEY);
                await Promise.all(pendingOrders.map(async (order: any) => {
                    try {
                        // Check for Code
                        const code = await smsClient.getSMS(order.order_id);
                        if (code && typeof code === 'string') {
                            // Success!
                            await supabaseAdmin.from('orders').update({
                                status: 'completed',
                                code: code
                            }).eq('order_id', order.order_id);
                            order.status = 'completed';
                            order.code = code;
                        }
                    } catch (e) {
                        // Ignore errors during sync to prevent blocking the UI
                        console.warn(`Background sync failed for ${order.order_id}`, e);
                    }
                }));
            }
        }
    }

    const orders = dbOrders; // pass through

    // Fetch rentals (Safe)
    let rentals: any[] = [];
    const { data: rentalsData, error: rentalsError } = await supabaseAdmin
        .from('rentals')
        .select('*')
        .eq('user_id', user.id);

    if (rentalsData) rentals = rentalsData;
    if (rentalsError) console.warn("Rentals fetch failed:", rentalsError);

    if (ordersError) {
        console.error("Orders Error:", ordersError);
        return NextResponse.json({ detail: 'Error fetching history', debug: { ordersError } }, { status: 500 });
    }

    // Unify data
    const unifiedOrders = [
        ...(orders || []).map((o: any) => ({
            ...o,
            type: o.verificationMethod || (o.cost > 2 ? 'voice' : 'sms'), // Infer if missing
            created_at: o.created_at || o.timestamp // Handle standard timestamps
        })),
        ...(rentals || []).map((r: any) => ({
            order_id: r.smspool_rental_id,
            service: r.service,
            phone: r.phone_number,
            country: r.country,
            cost: 0, // Calculated dynamically mostly, or add cost column to rentals
            type: 'rental',
            created_at: r.created_at,
            expires_at: r.expires_at || (r.created_at ? new Date(new Date(r.created_at).getTime() + 20 * 60000).toISOString() : null) // Add fallback for rentals
        }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Auto-expire orders logic
    const uniqueOrders = unifiedOrders.map((order: any) => {
        // Check if expires_at is a valid date string or timestamp
        // Check if expires_at is a valid date string or timestamp. If missing from DB, calculate default (20m from creation)
        const dbExpiresAt = order.expires_at || (order.created_at ? new Date(new Date(order.created_at).getTime() + 15 * 60000).toISOString() : null);
        const expiresAtTime = dbExpiresAt ? new Date(dbExpiresAt).getTime() : null;

        // Inject calculated expires_at into response so frontend sees it
        order.expires_at = dbExpiresAt;

        if (order.status === 'pending' && expiresAtTime && expiresAtTime < Date.now()) {
            // Update in DB (async, don't await blocking response)
            if (order.type === 'rental') {
                supabaseAdmin.from('rentals').update({ status: 'expired' }).eq('smspool_rental_id', order.order_id).then();
            } else {
                supabaseAdmin.from('orders').update({ status: 'expired' }).eq('order_id', order.order_id).then();
            }
            return { ...order, status: 'expired' };
        }
        return order;
    });

    return NextResponse.json(uniqueOrders);
}
