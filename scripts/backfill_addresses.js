const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const { HDKey } = require('viem/accounts');
const { mnemonicToSeedSync } = require('viem/accounts');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Minimal HDWallet derivation for the script
function deriveAddress(mnemonic, index) {
    // This needs to match the logic in src/lib/crypto/hdwallet.ts
    // viem uses internal helpers for this. For simplicity in script:
    const { mnemonicToAccount } = require('viem/accounts');
    const account = mnemonicToAccount(mnemonic, {
        path: `m/44'/60'/0'/0/${index}`,
    });
    return account.address;
}

async function backfill() {
    const mnemonic = process.env.DEPOSIT_MNEMONIC;
    if (!mnemonic) {
        console.error('DEPOSIT_MNEMONIC not found in .env.local');
        return;
    }

    console.log('Fetching users without deposit addresses...');
    const { data: users, error } = await supabase
        .from('users')
        .select('user_id')
        .is('deposit_address', null);

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    if (users.length === 0) {
        console.log('No users need backfilling.');
        return;
    }

    console.log(`Found ${users.length} users to backfill.`);

    // Get current max index
    const { data: maxIdxData } = await supabase
        .from('users')
        .select('derivation_index')
        .order('derivation_index', { ascending: false })
        .limit(1)
        .single();

    let currentIndex = (maxIdxData && maxIdxData.derivation_index !== null) ? maxIdxData.derivation_index + 1 : 0;

    for (const user of users) {
        const address = deriveAddress(mnemonic, currentIndex);
        console.log(`Assigning index ${currentIndex} (${address}) to user ${user.user_id}`);

        const { error: updateError } = await supabase
            .from('users')
            .update({
                deposit_address: address,
                derivation_index: currentIndex
            })
            .eq('user_id', user.user_id);

        if (updateError) {
            console.error(`Failed to update user ${user.user_id}:`, updateError);
        } else {
            currentIndex++;
        }
    }

    console.log('Backfill complete!');
}

backfill();
