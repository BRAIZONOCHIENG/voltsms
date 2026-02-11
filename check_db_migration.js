const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMigration() {
    // Try to select the 'provider' column from 'orders'
    const { data, error } = await supabase
        .from('orders')
        .select('provider')
        .limit(1);

    if (error) {
        console.error("Migration Check FAILED:", error.message);
        if (error.message.includes('column "provider" does not exist') || error.code === '42703') {
            console.log("Details: The 'provider' column is MISSING.");
        }
    } else {
        console.log("Migration Check SUCCESS: 'provider' column exists.");
    }
}

checkMigration();
