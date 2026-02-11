
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function reassignKey() {
    const apiKey = 'vk_7k7nop0vj0cmksll6y6is';
    const targetUserId = '2d130d5a-db5b-4d9c-be49-857b61ffda51'; // Back to original user

    const { error } = await supabase
        .from('api_keys')
        .update({ user_id: targetUserId })
        .eq('key', apiKey);

    if (error) {
        console.error('Error reassigning key:', error);
    } else {
        console.log(`Reassigned key ${apiKey} to user ${targetUserId}`);
    }
}

reassignKey();
