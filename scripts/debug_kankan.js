
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUser() {
    const email = 'kankanr66@gmail.com';
    console.log(`Checking user: ${email}`);

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error) {
        console.error('Error fetching user:', error.message);
        return;
    }

    console.log('User found:', {
        id: user.user_id,
        email: user.email,
        balance: user.balance,
        banned: user.banned
    });

    const { data: payments, error: pError } = await supabase
        .from('volt_splitter_payments')
        .select('*')
        .eq('user_id', user.user_id);

    if (pError) {
        console.error('Error fetching payments:', pError.message);
    } else {
        console.log('Splitter Payments:', payments);
    }

    const { data: transactions, error: tError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.user_id);

    if (tError) {
        console.error('Error fetching transactions:', tError.message);
    } else {
        console.log('Transactions:', transactions);
    }
}

checkUser();
