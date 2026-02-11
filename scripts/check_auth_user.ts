
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAuthUser() {
    const userId = '8cc00609-0d3a-4464-9be1-3f62243d639b';
    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error) {
        console.error('Auth User Check Error:', error);
    } else {
        console.log('Auth User Found:', data.user ? data.user.id : 'No');
    }
}

checkAuthUser();
