import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function resetTest() {
    const userId = '78fffe4f-4610-4d3a-964a-a8cc2d1255b5';

    console.log(`Resetting test state for user: ${userId}`);

    // 1. Delete manual recovery transactions
    const { data: txs, error: txError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', userId)
        .ilike('reference', 'MANUAL_RECOVERY%');

    if (txError) console.error('Error deleting transactions:', txError);
    else console.log('Cleaned up manual recovery transactions.');

    // 2. Delete payments logs
    const { data: payments, error: payError } = await supabase
        .from('volt_splitter_payments')
        .delete()
        .eq('user_id', userId);

    if (payError) console.error('Error deleting payments:', payError);
    else console.log('Cleaned up payment logs.');

    // 3. Reset balance to a baseline (e.g. 11.00)
    // Looking at previous logs, the balance was around 11.12 before the last recovery.
    // We'll just deduct the total amount recovered today.
    const totalDeduction = 0.65 + 0.77 + 1.01; // Sum of the recent manual recoveries

    console.log(`Deducting $${totalDeduction} from balance...`);

    const { error: balanceError } = await supabase.rpc('increment_balance', {
        target_user_id: userId,
        amount: -totalDeduction
    });

    if (balanceError) console.error('Error resetting balance:', balanceError);
    else console.log(`Balance reset successful. Deducted $${totalDeduction}.`);
}

resetTest();
