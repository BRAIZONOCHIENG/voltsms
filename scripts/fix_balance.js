const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
    'https://mbpyfuzclylnjccbzoem.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icHlmdXpjbHlsbmpjY2J6b2VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcwNzc3MSwiZXhwIjoyMDgzMjgzNzcxfQ.scPo-MqFoDrHQPmpFC7UpiqOYYyiITnO0O62Czsf6Y8'
);

async function main() {
    const userId = '4f848b52-6ba4-4c22-8ed8-3f77ad7e268a';
    const depositAmount = 4.5;

    console.log('=== FIXING USER BALANCE ===');

    // Check if user exists
    const { data: userData, error: checkErr } = await supabase
        .from('users')
        .select('balance')
        .eq('user_id', userId)
        .single();

    console.log('Existing user data:', userData);

    if (!userData) {
        // Create user record
        console.log('Creating user record...');
        const { error: insertErr } = await supabase
            .from('users')
            .insert({
                user_id: userId,
                balance: depositAmount
            });
        if (insertErr) {
            console.error('Insert error:', insertErr);
        } else {
            console.log('✅ User created with balance:', depositAmount);
        }
    } else {
        // Update balance
        const currentBalance = parseFloat(userData.balance) || 0;
        const newBalance = currentBalance + depositAmount;
        const { error: updateErr } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('user_id', userId);
        if (updateErr) {
            console.error('Update error:', updateErr);
        } else {
            console.log('✅ Balance updated:', currentBalance, '->', newBalance);
        }
    }

    // Verify final balance
    const { data: finalUser } = await supabase
        .from('users')
        .select('balance')
        .eq('user_id', userId)
        .single();
    console.log('Final balance:', finalUser?.balance);
}

main();
