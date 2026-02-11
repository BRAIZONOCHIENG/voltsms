
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function insertUser() {
    const userId = '2d130d5a-db5b-4d9c-be49-857b61ffda51'; // Original test user
    const email = 'test@example.com';

    // Insert into public.users
    const { data, error } = await supabase
        .from('users')
        .insert({
            user_id: userId,
            balance: 10.00
        })
        .select();

    if (error) {
        console.error('Error inserting user:', error);
    } else {
        console.log('Inserted user into public.users:', data);
    }
}

insertUser();
