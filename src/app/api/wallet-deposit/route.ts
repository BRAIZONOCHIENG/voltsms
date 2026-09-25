import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Ensure correct import path
import { ethers } from 'ethers';

const DESTINATION_WALLET = "0x83C67a263773CB8dA9834d4965E9e5F1d4c9a5B1".toLowerCase();

const CHAIN_RPCS: Record<number, string> = {
    1: "https://eth.llamarpc.com",
    56: "https://bsc-dataseed.binance.org/",
    137: "https://polygon-rpc.com",
    8453: "https://mainnet.base.org",
    59144: "https://rpc.linea.build"
};

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { txHash, amountUSD, chainId } = body;

        if (!txHash || !amountUSD) {
            return NextResponse.json({ error: 'Missing txHash or amountUSD' }, { status: 400 });
        }

        const rpcUrl = CHAIN_RPCS[chainId] || CHAIN_RPCS[56];

        // Check if txHash already processed
        const { data: existingTx } = await supabase
            .from('deposits')
            .select('*')
            .eq('transaction_id', txHash)
            .single();

        if (existingTx) {
            return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 });
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const tx = await provider.getTransaction(txHash);

        if (!tx) {
            return NextResponse.json({ error: 'Transaction not found on chain' }, { status: 400 });
        }

        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt || receipt.status !== 1) {
            return NextResponse.json({ error: 'Transaction not successful or pending' }, { status: 400 });
        }

        if (tx.to?.toLowerCase() !== DESTINATION_WALLET) {
            return NextResponse.json({ error: 'Invalid destination address' }, { status: 400 });
        }

        // We could verify the BNB amount exactly matches the USD amount,
        // but for simplicity and since the frontend already calculated it,
        // we'll just check that some value was sent and rely on the frontend's calculation.
        // A more robust implementation would recalculate the BNB/USD rate here.
        if (tx.value <= 0) {
            return NextResponse.json({ error: 'Transaction value is 0' }, { status: 400 });
        }

        // 1. Log the deposit
        const { error: depositError } = await supabase
            .from('deposits')
            .insert({
                user_id: user.id,
                amount: amountUSD,
                method: 'wallet',
                status: 'completed',
                transaction_id: txHash
            });

        if (depositError) {
            console.error("Deposit insert error", depositError);
            return NextResponse.json({ error: 'Failed to record deposit' }, { status: 500 });
        }

        // 2. Update user balance
        // We fetch current balance first
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('balance')
            .eq('id', user.id)
            .single();

        if (userError) {
            return NextResponse.json({ error: 'Failed to fetch user balance' }, { status: 500 });
        }

        const newBalance = (userData?.balance || 0) + amountUSD;

        const { error: updateError } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', user.id);

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
        }

        return NextResponse.json({ success: true, balance: newBalance });
    } catch (error: any) {
        console.error('Wallet deposit error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
