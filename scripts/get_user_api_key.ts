
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getKey() {
    // Get the first user
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !users.users.length) {
        console.error('No users found');
        return;
    }
    const userId = users.users[0].id; // Use the first user found (braizon)

    // Check for existing key
    let { data: key, error } = await supabase
        .from('api_keys')
        .select('key')
        .eq('user_id', userId)
        .single();

    if (!key) {
        // Create one if missing
        const newKey = 'vk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const { data: created, error: createError } = await supabase
            .from('api_keys')
            .insert({ user_id: userId, key: newKey, label: 'Test Key' })
            .select()
            .single();

        if (createError) {
            console.error('Failed to create key:', createError);
            return;
        }
        key = created;
    }

    console.log(`API_KEY=${key.key}`);
    console.log(`USER_ID=${userId}`);
}

getKey();
