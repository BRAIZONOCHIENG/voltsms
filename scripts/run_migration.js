
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    const sqlPath = path.resolve(__dirname, '../supabase/affiliate_payouts_and_fixes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running migration...');

    // Try to use a common RPC if it exists, otherwise we might be stuck
    // Some projects have a 'exec_sql' or similar. 
    // If not, we can try to run it line by line or using a different method.
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Error running migration via RPC:', error);
        console.log('Attempting to run via direct commands (this might fail if RLS/Permissions block)...');

        // Split SQL by semicolons (naive approach)
        const commands = sql.split(';').filter(cmd => cmd.trim() !== '');
        for (const cmd of commands) {
            if (cmd.includes('DO $$')) continue; // Skip complex blocks in this mode
            // This is very limited.
        }
    } else {
        console.log('Migration completed successfully!');
    }
}

runMigration();
