
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function grantBalance() {
    const userId = '2d130d5a-db5b-4d9c-be49-857b61ffda51'; // From previous step

    const { data, error } = await supabase.rpc('increment_balance', {
        target_user_id: userId,
        amount: 5.00
    });

    if (error) {
        console.error('Error granting balance:', error);
    } else {
        console.log('Granted $5.00 to user.');
    }
}

grantBalance();
