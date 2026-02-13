import { createClient } from '@supabase/supabase-js';
import { createPublicClient, createWalletClient, http, parseAbiItem, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc } from 'viem/chains';
import { getHDWallet } from './hdwallet';

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
    to: string; // The unique deposit address assigned to the user
    token: string; // Address or 'NATIVE'
    amount: bigint;
    isNative: boolean;
}

export async function processDeposit({ txHash, from, to, token, amount, isNative }: DepositData) {
    // Check if already processed
    const { data: existing } = await supabase.from('volt_splitter_payments').select('id').eq('tx_hash', txHash).single();
    if (existing) return { success: false, reason: 'Already processed' };

    console.log(`[Processor] Processing deposit: ${amount} of ${token} from ${from} to ${to}`);

    // 1. Identify User by the TARGET address (Unique Deposit Address)
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('user_id, derivation_index')
        .eq('deposit_address', to.toLowerCase())
        .single();

    if (!user) {
        console.warn(`[Processor] Unknown target address ${to}. Funds received but not credited.`);
        return { success: false, reason: 'Unknown target address' };
    }

    try {
        const userId = user.user_id;
        const derivationIndex = user.derivation_index;

        // 2. Setup Sub-Account for Sweeping
        const hdWallet = getHDWallet();
        const subAccount = hdWallet.getAccount(derivationIndex);
        const subWalletClient = createWalletClient({ chain: bsc, transport, account: subAccount });

        // 3. Forward 28% to SMSPool from SUB-ADDRESS
        // Note: BNB MUST be present in the sub-address for gas. 
        // If it's a Token deposit, we might need a "Gas Pump" from Hot Wallet first.

        const forwardAmount = (amount * 28n) / 100n; // 28% forwarded to SMSPool
        const hotWalletSweepAmount = amount - forwardAmount;

        let forwardTxHash = '';
        let sweepTxHash = '';

        try {
            if (isNative) {
                // For BNB: Everything is in the sub-address
                forwardTxHash = await subWalletClient.sendTransaction({
                    to: SMSPOOL_ADDRESS,
                    value: forwardAmount
                });
                console.log(`[Processor] Forwarded 28% to SMSPool: ${forwardTxHash}`);

                // Sweep remainder to Hot Wallet
                // Subtract a small amount for gas if we were doing a full sweep, 
                // but since we keep some for gas, we just sweep what's left
                sweepTxHash = await subWalletClient.sendTransaction({
                    to: HOT_WALLET_ADDRESS,
                    value: hotWalletSweepAmount
                });
                console.log(`[Processor] Swept remainder to Hot Wallet: ${sweepTxHash}`);
            } else {
                // For TOKENS: Sub-address needs gas (BNB)
                // 1. Pump Gas from Main Hot Wallet to Sub-address
                console.log(`[Processor] Pumping gas to sub-address for token sweep...`);
                const pumpTxHash = await walletClient.sendTransaction({
                    to: to as `0x${string}`,
                    value: 500000000000000n // 0.0005 BNB (~$0.30)
                });
                await publicClient.waitForTransactionReceipt({ hash: pumpTxHash });

                // 2. Forward 28% of tokens to SMSPool
                forwardTxHash = await subWalletClient.writeContract({
                    address: token as `0x${string}`,
                    abi: [TRANSFER_FUNC],
                    functionName: 'transfer',
                    args: [SMSPOOL_ADDRESS, forwardAmount]
                });
                console.log(`[Processor] Forwarded 28% tokens to SMSPool: ${forwardTxHash}`);

                // 3. Sweep remainder of tokens to Hot Wallet
                sweepTxHash = await subWalletClient.writeContract({
                    address: token as `0x${string}`,
                    abi: [TRANSFER_FUNC],
                    functionName: 'transfer',
                    args: [HOT_WALLET_ADDRESS, hotWalletSweepAmount]
                });
                console.log(`[Processor] Swept remainder tokens to Hot Wallet: ${sweepTxHash}`);
            }
        } catch (fwError) {
            console.error('[Processor] Sweeping/Forwarding failed:', fwError);
            // We still proceed with crediting user balance even if sweep fails 
            // because we HAVE the funds in the sub-wallet we control.
        }

        // 4. User Balance Logic
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
                    description: `Crypto Deposit (${symbol}) to Unique Address`,
                    reference: txHash
                });
            }
        } catch (cErr) {
            console.error('[Processor] Credit exception:', cErr);
        }

        // 5. Record Payment logic
        await supabase.from('volt_splitter_payments').insert({
            tx_hash: txHash,
            user_id: userId,
            amount_crypto: amount.toString(),
            amount_usd: usdValue,
            token_address: token,
            credited: creditSuccess,
            credited_amount: creditSuccess ? usdValue : 0,
            notes: `Forward Tx: ${forwardTxHash}, Sweep Tx: ${sweepTxHash}`
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
