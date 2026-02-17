
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkById() {
    const userId = '78fffe4f-4610-4d3a-964a-a8cc2d1255b4';
    console.log(`Checking user ID: ${userId}`);

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching user:', error.message);
    } else {
        console.log('User found:', user);
    }

    const { data: payments, error: pError } = await supabase
        .from('volt_splitter_payments')
        .select('*')
        .eq('user_id', userId);

    if (pError) console.error('Error payments:', pError.message);
    else console.log('Splitter Payments:', payments);

    const { data: transactions, error: tError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

    if (tError) console.error('Error transactions:', tError.message);
    else console.log('Transactions:', transactions);
}

checkById();
