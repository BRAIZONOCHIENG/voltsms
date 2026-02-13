import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ... imports ...

export async function GET(req: NextRequest) {
    const start = Date.now();
    try {
        // --- 1. Latency Check ---
        await supabaseAdmin.from('users').select('id').limit(1);
        const latency = Date.now() - start;

        // --- 2. Revenue & Profit (Completed Orders Only) ---
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

        // Fetch ALL completed orders for accurate totals
        // For larger scale, we would use Supabase .rpc() or aggregate queries, but for now fetching is fine.
        const { data: allOrders } = await supabaseAdmin
            .from('orders')
            .select('cost, provider_cost, timestamp, status, service')
            .eq('status', 'completed'); // STRICT Filter: Only successful orders count

        // Calculate Totals since inception
        const totalProfit = allOrders?.reduce((acc, o) => acc + ((o.cost || 0) - (o.provider_cost || 0)), 0) || 0;

        // Filter in memory for periods (saves DB calls)
        const currentMonthOrders = allOrders?.filter(o =>
            new Date(o.timestamp * 1000) >= new Date(startOfMonth)
        ) || [];

        const lastMonthOrders = allOrders?.filter(o => {
            const date = new Date(o.timestamp * 1000);
            return date >= new Date(startOfLastMonth) && date <= new Date(endOfLastMonth);
        }) || [];

        const currentMonthProfit = currentMonthOrders.reduce((acc, o) => acc + ((o.cost || 0) - (o.provider_cost || 0)), 0);
        const lastMonthProfit = lastMonthOrders.reduce((acc, o) => acc + ((o.cost || 0) - (o.provider_cost || 0)), 0);

        // Calculate Trend
        let profitTrend = 0;
        if (lastMonthProfit > 0) {
            profitTrend = ((currentMonthProfit - lastMonthProfit) / lastMonthProfit) * 100;
        } else if (currentMonthProfit > 0) {
            profitTrend = 100;
        }

        // --- 3. Active Users ---
        const { count: totalUsers } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true });

        // User Trend (Simplified for speed)
        // Ideally we fetch user creation dates
        const { count: newUsersLastMonth } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfLastMonth)
            .lte('created_at', endOfLastMonth);

        const { count: newUsersThisMonth } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfMonth);

        let userTrend = 0;
        if ((newUsersLastMonth || 0) > 0) {
            userTrend = (((newUsersThisMonth || 0) - (newUsersLastMonth || 0)) / (newUsersLastMonth || 0)) * 100;
        } else if ((newUsersThisMonth || 0) > 0) {
            userTrend = 100;
        }

        // --- 4. Success Rate Calculation ---
        const { data: recentOrders } = await supabaseAdmin
            .from('orders')
            .select('status')
            .neq('status', 'pending'); // Only count final states

        const totalFinal = recentOrders?.length || 0;
        const completed = recentOrders?.filter(o => o.status === 'completed').length || 0;
        const actualSuccessRate = totalFinal > 0 ? (completed / totalFinal) * 100 : 0;

        // --- 5. Active Services ---
        const uniqueServices = new Set(allOrders?.map(o => o.service)).size;

        return NextResponse.json({
            revenue: totalProfit,
            activeUsers: totalUsers || 0,
            activeServices: uniqueServices || 0,
            revenueTrend: profitTrend.toFixed(1),
            userTrend: userTrend.toFixed(1),
            latency: latency,
            successRate: actualSuccessRate,
            success: true
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
