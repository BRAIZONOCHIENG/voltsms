const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    console.log("Checking DB Connection...");
    const { data, error } = await supabase.from('pending_crypto_payments').select('count').limit(1);

    if (error) {
        console.error("Error accessing table:", error.message);
        if (error.code === 'PGRST204' || error.message.includes('does not exist')) {
            console.log("TABLE DOES NOT EXIST. Needs creation.");
        }
    } else {
        console.log("Table 'pending_crypto_payments' exists and is accessible.");
    }
}

check();
