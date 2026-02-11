
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugKey() {
    const apiKey = 'vk_7k7nop0vj0cmksll6y6is';

    // 1. Get User ID from Key
    const { data: keyData, error: keyError } = await supabase
        .from('api_keys')
        .select('user_id')
        .eq('key', apiKey)
        .single();

    if (keyError || !keyData) {
        console.error('Key not found:', keyError);
        return;
    }

    console.log('Key belongs to User ID:', keyData.user_id);

    // 2. Get Balance
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance, email')
        .eq('user_id', keyData.user_id) // Use the user_id from the key!
        .single();

    if (userError) {
        console.error('User not found:', userError);
    } else {
        console.log('Current DB Balance:', user.balance);
        console.log('User Email:', user.email);
    }

    // 3. List All Users (to find the right one)
    const { data: users, error: listError } = await supabase
        .from('users')
        .select('user_id, email, balance')
        .limit(5);

    if (listError) console.error(listError);
    else console.log('Public Users Table:', users);
}

debugKey();
