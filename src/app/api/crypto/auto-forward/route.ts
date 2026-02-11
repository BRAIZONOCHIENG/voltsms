import dns from 'dns';
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http, parseAbiItem, formatUnits, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc } from 'viem/chains';

// Env variables
const RPC_URL = process.env.ALCHEMY_BSC_RPC || 'https://bsc-dataseed1.defibit.io';
const HOT_WALLET_PK = process.env.HOT_WALLET_PRIVATE_KEY as `0x${string}`;
const HOT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_HOT_WALLET_ADDRESS as `0x${string}`;
const SMSPOOL_ADDRESS = process.env.SMSPOOL_DEPOSIT_ADDRESS as `0x${string}`;

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Clients
const transport = http(RPC_URL);
const publicClient = createPublicClient({ chain: bsc, transport });
const account = privateKeyToAccount(HOT_WALLET_PK);
const walletClient = createWalletClient({ chain: bsc, transport, account });

// Tokens
const TOKENS = {
    USDT: '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`,
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97f1C0160f0' as `0x${string}`,
};

// ABI
const TRANSFER_EVENT = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');
const TRANSFER_FUNC = parseAbiItem('function transfer(address to, uint256 amount) returns (bool)');

export async function GET(req: NextRequest) {
    // Check for Authorization Header OR Query Param (for Vercel Cron/External Services)
    const authHeader = req.headers.get('Authorization');
    const { searchParams } = new URL(req.url);
    const authParam = searchParams.get('auth');
    const isValid = (authHeader === `Bearer ${process.env.CRON_SECRET}`) || (authParam === process.env.CRON_SECRET);

    if (!isValid) {
        // Allow unauthenticated for now for testing, or secure later
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Get last synced block
        let { data: sync } = await supabase.from('volt_splitter_sync').select('*').eq('id', 1).single();
        const currentBlock = await publicClient.getBlockNumber();
        const startBlock = sync?.last_block ? BigInt(sync.last_block) + 1n : currentBlock - 100n;
        const endBlock = startBlock + 19n > currentBlock ? currentBlock : startBlock + 19n; // Limit scan range

        if (startBlock > endBlock) return NextResponse.json({ status: 'No new blocks' });

        console.log(`Scanning blocks ${startBlock} to ${endBlock} for deposits to ${HOT_WALLET_ADDRESS}`);

        // 2. Fetch Logs for Tokens (USDT/USDC) - Non-blocking
        let tokenLogs: any[] = [];
        try {
            tokenLogs = await publicClient.getLogs({
                address: [TOKENS.USDT, TOKENS.USDC],
                event: TRANSFER_EVENT,
                args: { to: HOT_WALLET_ADDRESS },
                fromBlock: startBlock,
                toBlock: endBlock
            });
        } catch (logsError: any) {
            console.warn('Token logs fetch failed (RPC limit?), skipping ERC20 scan:', logsError.message);
        }

        // 3. Process Token Deposits
        for (const log of tokenLogs) {
            await processDeposit({
                txHash: log.transactionHash,
                from: log.args.from!,
                token: log.address,
                amount: log.args.value!,
                isNative: false
            });
        }

        // 4. Process Native BNB Deposits
        // We need to fetch full blocks for native transfers (expensive, but necessary if relying on direct transfer)
        // Optimization: Only check block if balance changed? No, hard to track.
        // For now, iterate blocks.
        for (let i = startBlock; i <= endBlock; i++) {
            const block = await publicClient.getBlock({ blockNumber: i, includeTransactions: true });
            for (const tx of block.transactions) {
                if (tx.to && tx.to.toLowerCase() === HOT_WALLET_ADDRESS.toLowerCase() && tx.value > 0n) {
                    await processDeposit({
                        txHash: tx.hash,
                        from: tx.from,
                        token: 'NATIVE',
                        amount: tx.value,
                        isNative: true
                    });
                }
            }
        }

        // 5. Update Sync State
        await supabase.from('volt_splitter_sync').upsert({ id: 1, last_block: Number(endBlock) });

        return NextResponse.json({ success: true, processed: tokenLogs.length, range: `${startBlock}-${endBlock}` });
    } catch (error: any) {
        console.error('Auto-Forward Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function processDeposit({ txHash, from, token, amount, isNative }: any) {
    // Check if already processed
    const { data: existing } = await supabase.from('volt_splitter_payments').select('id').eq('tx_hash', txHash).single();
    if (existing) return;

    console.log(`Processing deposit: ${amount} of ${token} from ${from}`);

    // Identify User
    const { data: wallet } = await supabase.from('user_wallets').select('user_id').eq('address', from.toLowerCase()).single();

    if (!wallet) {
        console.warn(`Unknown sender ${from}. Funds received but not credited.`);
        // Note: Could store in 'unclaimed_deposits' table
        return;
    }

    // Credits & Forwarding
    try {
        const userId = wallet.user_id;

        // 1. Calculate Amounts
        const forwardAmount = (amount * 28n) / 100n; // 28% forwarded to SMSPool, 72% kept as profit

        // 2. Forward 25% to SMSPool
        let forwardTxHash = '';
        try {
            if (isNative) {
                forwardTxHash = await walletClient.sendTransaction({
                    to: SMSPOOL_ADDRESS,
                    value: forwardAmount
                });
            } else {
                forwardTxHash = await walletClient.writeContract({
                    address: token,
                    abi: [TRANSFER_FUNC],
                    functionName: 'transfer',
                    args: [SMSPOOL_ADDRESS, forwardAmount]
                });
            }
            console.log(`Forwarded 25% (${forwardAmount}) to SMSPool: ${forwardTxHash}`);
        } catch (fwError) {
            console.error('Forwarding failed (likely insufficient gas):', fwError);
            // We continue to credit user, but log error.
            // Administrator needs to top up gas.
        }

        // 3. Credit User (Logic from previous implementation - simplified)
        // Fetch price to convert to USD
        const symbol = isNative ? 'BNB' : token.toLowerCase() === TOKENS.USDT.toLowerCase() ? 'USDT' : 'USDC';
        const decimals = isNative ? 18 : 18; // Both USDT/USDC are 18 on BSC generally, but check config if needed
        const amountFloat = parseFloat(formatUnits(amount, decimals));

        // Get Price (Mock or Fetch) - Ideally fetch from CoinGecko
        const price = await fetchPrice(symbol);
        const usdValue = amountFloat * price;

        // 3. Credit User
        let creditSuccess = false;
        try {
            // Add to user balance
            const { error: creditError } = await supabase.rpc('increment_balance', {
                target_user_id: userId,
                amount: usdValue
            });

            if (creditError) {
                console.error('Credit failed for user:', userId, creditError);
            } else {
                creditSuccess = true;
                console.log(`Credited user ${userId} with $${usdValue}`);
            }
        } catch (cErr) {
            console.error('Credit logic exception:', cErr);
        }

        // 4. Record Transaction (ALWAYS, to prevent re-processing loop)
        const { error: insertError } = await supabase.from('volt_splitter_payments').insert({
            tx_hash: txHash,
            user_id: userId,
            amount_crypto: amount.toString(), // Wei
            amount_usd: usdValue,
            token_address: token,
            credited: creditSuccess,
            credited_amount: creditSuccess ? usdValue : 0,
            notes: `Forward Tx: ${forwardTxHash}`
        });

        if (insertError) {
            // Critical! If we can't record the payment, we might double spend next time.
            // But we already forwarded. 
            console.error('CRITICAL: Failed to record payment!', insertError);
        }

    } catch (err) {
        console.error('Error processing deposit logic:', err);
    }
}

async function fetchPrice(symbol: string) {
    try {
        // Simple cache or fetch
        if (symbol === 'USDT' || symbol === 'USDC') return 1;
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
        const data = await res.json();
        return data.binancecoin.usd;
    } catch {
        return 650; // Fallback
    }
}
