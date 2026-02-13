import * as dotenv from 'dotenv';
import path from 'path';

// 1. Initialize dotenv
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';
import { createPublicClient, http } from 'viem';
import { bsc } from 'viem/chains';

async function forceProcess() {
    // Dynamically import processor to ensure envs are loaded first
    const { processDeposit } = await import('../src/lib/crypto/processor');

    // Standardize to lowercase for lookup
    const targetAddress = '0xddfb94b4377efdabe1b2ab46830ac00390735617'.toLowerCase();
    const txHash = 'MANUAL_RECOVERY_V3_' + Date.now();

    console.log(`Force processing for: ${targetAddress}`);

    const publicClient = createPublicClient({
        chain: bsc,
        transport: http('https://bsc-dataseed1.binance.org')
    });

    const balance = await publicClient.getBalance({ address: targetAddress as `0x${string}` });

    if (balance === 0n) {
        console.log('No balance found at this address. Nothing to process.');
        return;
    }

    console.log(`Found balance: ${balance.toString()} wei (${(Number(balance) / 1e18).toFixed(6)} BNB)`);

    const depositData = {
        txHash: txHash,
        from: 'MANUAL_RECOVERY',
        to: targetAddress,
        token: 'NATIVE',
        amount: balance,
        isNative: true
    };

    console.log('Triggering processDeposit...');
    try {
        const result = await processDeposit(depositData);
        console.log('Result:', result);
    } catch (e: any) {
        console.error('Error during processing:', e.message);
        console.error(e);
    }
}

forceProcess();
