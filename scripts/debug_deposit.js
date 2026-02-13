const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const { createPublicClient, http, formatEther } = require('viem');
const { bsc } = require('viem/chains');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugDeposit() {
    const targetAddress = '0xdDfB94b4377eFDaBE1B2aB46830aC00390735617';
    console.log(`Checking status for: ${targetAddress}`);

    // 1. Check DB for User
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('user_id, email, balance, deposit_address, derivation_index')
        .eq('deposit_address', targetAddress.toLowerCase())
        .single();

    if (userError) {
        console.error('Error finding user in DB:', userError.message);
    } else {
        console.log('User found in DB:', user);
    }

    // 2. Check On-chain Balance
    const publicClient = createPublicClient({
        chain: bsc,
        transport: http('https://bsc-dataseed1.binance.org')
    });

    try {
        const balance = await publicClient.getBalance({ address: targetAddress });
        console.log(`On-chain Native Balance (BNB): ${formatEther(balance)}`);

        // Check for common tokens (USDT)
        const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
        const ERC20_ABI = [{
            "constant": true,
            "inputs": [{ "name": "_owner", "type": "address" }],
            "name": "balanceOf",
            "outputs": [{ "name": "balance", "type": "uint256" }],
            "type": "function"
        }];

        const usdtBalance = await publicClient.readContract({
            address: USDT_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [targetAddress]
        });
        console.log(`On-chain USDT Balance: ${formatEther(usdtBalance)} (if 18 decimals)`);

    } catch (e) {
        console.error('Error checking on-chain balance:', e.message);
    }

    // 3. Check Transactions Table
    const { data: txs, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .ilike('description', `%${targetAddress}%`)
        .limit(10);

    if (txError) {
        console.error('Error checking transactions:', txError.message);
    } else {
        console.log('Relevant Transactions:', txs);
    }
}

debugDeposit();
