const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const { createPublicClient, http } = require('viem');
const { bsc } = require('viem/chains');

// Note: We'll import the processor function directly if possible, or just re-implement the call.
// Since we are in a script context, we'll just hit the processing logic.
const { processDeposit } = require('../src/lib/crypto/processor');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function forceProcess() {
    const targetAddress = '0xddfb94b4377efdabe1b2ab46830ac00390735617';
    console.log(`Force processing for: ${targetAddress}`);

    const publicClient = createPublicClient({
        chain: bsc,
        transport: http('https://bsc-dataseed1.binance.org')
    });

    // 1. Get latest transaction for this address
    // Since we don't have a txHash from user, we can't easily query Alchemy from here without API key.
    // However, if the balance is > 0, we can assume a deposit happened.
    const balance = await publicClient.getBalance({ address: targetAddress });

    if (balance === 0n) {
        console.log('No balance found at this address. Nothing to process.');
        return;
    }

    console.log(`Found balance: ${balance.toString()} wei`);

    // We'll simulate a DepositData object. 
    // We don't have the real from/txHash, so we'll use a placeholder or dummy for the repair.
    // Ideally we want the REAL txHash so it's recorded correctly.
    // But if we just want to CREDIT the user and SWEEP:

    const depositData = {
        txHash: 'MANUAL_RECOVERY_' + Date.now(), // Unique placeholder
        from: 'UNKNOWN',
        to: targetAddress,
        token: 'NATIVE',
        amount: balance,
        isNative: true
    };

    console.log('Triggering processDeposit...');
    const result = await processDeposit(depositData);
    console.log('Result:', result);
}

forceProcess();
