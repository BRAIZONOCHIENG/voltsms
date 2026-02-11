import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http, parseAbiItem, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc } from 'viem/chains';

// Env variables
const RPC_URL = process.env.ALCHEMY_BSC_RPC || 'https://bsc-dataseed.binance.org';
const HOT_WALLET_PK = process.env.HOT_WALLET_PRIVATE_KEY as `0x${string}`;

// Clients
const transport = http(RPC_URL);
const account = privateKeyToAccount(HOT_WALLET_PK);
const walletClient = createWalletClient({ chain: bsc, transport, account });

// Tokens
const TOKENS = {
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97f1C0160f0',
};

const TRANSFER_FUNC = parseAbiItem('function transfer(address to, uint256 amount) returns (bool)');

export async function POST(req: NextRequest) {
    // Basic security: Check for admin secret or session (for now, simple secret)
    const { amount, address, token, secret } = await req.json();

    if (secret !== process.env.CRON_SECRET && secret !== process.env.ADMIN_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!address || !amount) {
        return NextResponse.json({ error: 'Missing address or amount' }, { status: 400 });
    }

    try {
        let hash = '';
        if (token === 'BNB' || !token) {
            // SEND BNB
            // Leave some gas
            const value = parseEther(amount.toString());
            hash = await walletClient.sendTransaction({
                to: address as `0x${string}`,
                value: value
            });
        } else {
            // SEND TOKEN
            const tokenAddr = TOKENS[token as keyof typeof TOKENS];
            if (!tokenAddr) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });

            // We assume 18 decimals for USDT/USDC on BSC
            const value = parseEther(amount.toString());

            hash = await walletClient.writeContract({
                address: tokenAddr as `0x${string}`,
                abi: [TRANSFER_FUNC],
                functionName: 'transfer',
                args: [address as `0x${string}`, value]
            });
        }

        return NextResponse.json({ success: true, hash });
    } catch (error: any) {
        console.error('Withdraw Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
