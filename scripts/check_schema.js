const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    console.log('Checking users table columns...');
    const { data, error } = await supabase
        .from('users')
        .select('deposit_address, derivation_index')
        .limit(1);

    if (error) {
        console.error('Error fetching columns:', error);
        console.log('Columns might be missing. Please run the SQL migration manually in Supabase Dashboard.');
    } else {
        console.log('Schema confirmed! deposit_address and derivation_index exist.');
    }
}

checkSchema();
