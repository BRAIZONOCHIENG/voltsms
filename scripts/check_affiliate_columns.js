
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'affiliate_profiles' });

    if (error) {
        // If RPC doesn't exist, try a direct query to information_schema if possible, 
        // but usually service role can do it or just try a select * limit 0
        const { data: selectData, error: selectError } = await supabase
            .from('affiliate_profiles')
            .select('*')
            .limit(0);

        if (selectError) {
            console.error('Error fetching columns:', selectError);
        } else {
            console.log('Columns found:', Object.keys(selectData[0] || {}));

            // Also try to specifically check for crypto_address
            const { data: colData, error: colError } = await supabase
                .from('affiliate_profiles')
                .select('crypto_address')
                .limit(0);

            if (colError) {
                console.log('crypto_address column seems to be MISSING');
            } else {
                console.log('crypto_address column EXISTS');
            }
        }
    } else {
        console.log('Columns:', data);
    }
}

checkColumns();
