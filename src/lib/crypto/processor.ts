import { createClient } from '@supabase/supabase-js';
import { createPublicClient, createWalletClient, http, parseAbiItem, formatUnits } from 'viem';
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

const TRANSFER_FUNC = parseAbiItem('function transfer(address to, uint256 amount) returns (bool)');

export interface DepositData {
    txHash: string;
    from: string;
    token: string; // Address or 'NATIVE'
    amount: bigint;
    isNative: boolean;
}

export async function processDeposit({ txHash, from, token, amount, isNative }: DepositData) {
    // Check if already processed
    const { data: existing } = await supabase.from('volt_splitter_payments').select('id').eq('tx_hash', txHash).single();
    if (existing) return { success: false, reason: 'Already processed' };

    console.log(`[Processor] Processing deposit: ${amount} of ${token} from ${from}`);

    // Identify User
    const { data: wallet } = await supabase.from('user_wallets').select('user_id').eq('address', from.toLowerCase()).single();

    if (!wallet) {
        console.warn(`[Processor] Unknown sender ${from}. Funds received but not credited.`);
        return { success: false, reason: 'Unknown wallet' };
    }

    try {
        const userId = wallet.user_id;

        // 1. Calculate Amounts
        const forwardAmount = (amount * 28n) / 100n; // 28% forwarded to SMSPool

        // 2. Forward 28% to SMSPool
        let forwardTxHash = '';
        try {
            if (isNative) {
                forwardTxHash = await walletClient.sendTransaction({
                    to: SMSPOOL_ADDRESS,
                    value: forwardAmount
                });
            } else {
                forwardTxHash = await walletClient.writeContract({
                    address: token as `0x${string}`,
                    abi: [TRANSFER_FUNC],
                    functionName: 'transfer',
                    args: [SMSPOOL_ADDRESS, forwardAmount]
                });
            }
            console.log(`[Processor] Forwarded 28% to SMSPool: ${forwardTxHash}`);
        } catch (fwError) {
            console.error('[Processor] Forwarding failed (check gas):', fwError);
        }

        // 3. User Balance Logic
        const symbol = isNative ? 'BNB' : token.toLowerCase() === TOKENS.USDT.toLowerCase() ? 'USDT' : 'USDC';
        const decimals = isNative ? 18 : 18;
        const amountFloat = parseFloat(formatUnits(amount, decimals));

        const price = await fetchPrice(symbol);
        const usdValue = amountFloat * price;

        let creditSuccess = false;
        try {
            // Add to user balance
            const { error: creditError } = await supabase.rpc('increment_balance', {
                target_user_id: userId,
                amount: usdValue
            });

            if (creditError) {
                console.error('[Processor] Credit failed for user:', userId, creditError);
            } else {
                creditSuccess = true;
                console.log(`[Processor] Credited user ${userId} with $${usdValue.toFixed(2)}`);

                // Log in transactions table
                await supabase.from('transactions').insert({
                    user_id: userId,
                    type: 'deposit',
                    amount: usdValue,
                    currency: symbol,
                    status: 'completed',
                    description: `Crypto Deposit (${symbol}) via Volt Splitter`,
                    reference: txHash
                });
            }
        } catch (cErr) {
            console.error('[Processor] Credit exception:', cErr);
        }

        // 4. Record Payment logic
        await supabase.from('volt_splitter_payments').insert({
            tx_hash: txHash,
            user_id: userId,
            amount_crypto: amount.toString(),
            amount_usd: usdValue,
            token_address: token,
            credited: creditSuccess,
            credited_amount: creditSuccess ? usdValue : 0,
            notes: `Forward Tx: ${forwardTxHash}`
        });

        return { success: true, txHash, forwardTxHash };

    } catch (err) {
        console.error('[Processor] Error processing deposit logic:', err);
        return { success: false, error: err };
    }
}

async function fetchPrice(symbol: string) {
    try {
        if (symbol === 'USDT' || symbol === 'USDC') return 1;
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
        const data = await res.json();
        return data.binancecoin.usd;
    } catch {
        return 650; // Fallback
    }
}
