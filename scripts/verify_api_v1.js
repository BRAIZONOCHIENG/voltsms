// Load env vars
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
// const fetch = require('node-fetch'); // Native fetch in Node 18+

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testApi() {
    console.log("1. Setting up Test User & Key...");
    // Get a user from Auth (Source of Truth for UUIDs)
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !users || users.length === 0) {
        console.error("No auth users found to test with.", userError);
        return;
    }
    const userId = users[0].id;
    console.log("   Target User ID:", userId);

    // Create a temp key
    const testKey = `sk_live_TEST_${crypto.randomBytes(8).toString('hex')}`;
    const { error: insertError } = await supabase.from('api_keys').insert({
        user_id: userId,
        key: testKey,
        label: 'Automated Test Key'
    });

    if (insertError) {
        console.error("   CREATION FAILED:", insertError);
        return;
    }
    console.log("   Created Key:", testKey);

    const baseUrl = 'http://localhost:3000/api/v1';

    try {
        console.log("\n2. Testing /balance endpoint...");
        const balanceRes = await fetch(`${baseUrl}/balance`, {
            headers: { 'Authorization': `Bearer ${testKey}` }
        });
        const balanceData = await balanceRes.json();
        console.log("   Status:", balanceRes.status);
        console.log("   Response:", JSON.stringify(balanceData));

        if (balanceRes.status !== 200) throw new Error("Balance check failed");

        console.log("\n3. Testing /services endpoint...");
        const servicesRes = await fetch(`${baseUrl}/services`, {
            headers: { 'Authorization': `Bearer ${testKey}` }
        });
        const servicesData = await servicesRes.json();
        console.log("   Status:", servicesRes.status);
        console.log("   Response (First 2 items):", JSON.stringify(servicesData.services?.slice(0, 2) || servicesData));

        if (servicesRes.status !== 200) throw new Error("Services check failed");

        console.log("\n4. Testing /order endpoint (Dry Run - Insufficient Balance Check)...");
        // We'll try to buy something expensive or just check validation
        const orderRes = await fetch(`${baseUrl}/order`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${testKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ service: 'invalid_service_test', country: 'US' })
        });
        const orderData = await orderRes.json();
        console.log("   Status:", orderRes.status);
        console.log("   Response:", JSON.stringify(orderData));
        // We expect an error or 400/402/500, essentially establishing the endpoint is reachable

    } catch (e) {
        console.error("TEST FAILED:", e.message);
    } finally {
        console.log("\n5. Cleanup...");
        await supabase.from('api_keys').delete().eq('key', testKey);
        console.log("   Test key deleted.");
    }
}

testApi();
