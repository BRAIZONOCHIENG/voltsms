
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function forceUpdate() {
    const userId = '2d130d5a-db5b-4d9c-be49-857b61ffda51';

    // Use RPC to be safe
    const { data: rpcData, error: rpcError } = await supabase.rpc('increment_balance', {
        target_user_id: userId,
        amount: 5.00
    });

    if (rpcError) {
        console.error('Error RPC balance:', rpcError);
    } else {
        console.log('Incremented balance by $5.00 via RPC.');
    }

    // Verify
    const { data: user } = await supabase.from('users').select('balance').eq('user_id', userId).single();
    console.log('New Balance:', user?.balance);
}

forceUpdate();
