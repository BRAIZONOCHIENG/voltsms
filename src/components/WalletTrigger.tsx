"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';

interface WalletTriggerProps {
    amountUSD: number;
    userToken: string | undefined;
    onSuccess: (txHash: string) => void;
    onError: (err: any) => void;
}

const DESTINATION_WALLET = "0x83C67a263773CB8dA9834d4965E9e5F1d4c9a5B1";
const SUPPORTED_CHAINS: Record<number, { symbol: string, binanceSymbol: string, name: string }> = {
    1: { symbol: 'ETH', binanceSymbol: 'ETHUSDT', name: 'Ethereum' },
    56: { symbol: 'BNB', binanceSymbol: 'BNBUSDT', name: 'BNB Chain' },
    137: { symbol: 'MATIC', binanceSymbol: 'MATICUSDT', name: 'Polygon' },
    8453: { symbol: 'ETH', binanceSymbol: 'ETHUSDT', name: 'Base' },
    59144: { symbol: 'ETH', binanceSymbol: 'ETHUSDT', name: 'Linea' }
};

export default function WalletTrigger({ amountUSD, userToken, onSuccess, onError }: WalletTriggerProps) {
    const { open, close } = useAppKit();
    const { address, isConnected, chainId } = useAccount();
    const { switchChainAsync } = useSwitchChain();
    const { sendTransactionAsync, isPending: isSending } = useSendTransaction();
    
    const [loading, setLoading] = useState(false);
    const [coinPrice, setCoinPrice] = useState<number | null>(null);

    const currentChainConfig = (chainId && SUPPORTED_CHAINS[chainId]) ? SUPPORTED_CHAINS[chainId] : SUPPORTED_CHAINS[56];
    const activeChainId = (chainId && SUPPORTED_CHAINS[chainId]) ? chainId : 56;

    // To track the hash to wait for it.
    const [txHashState, setTxHashState] = useState<`0x${string}` | undefined>(undefined);

    const { isLoading: isWaiting, isSuccess, isError: isReceiptError } = useWaitForTransactionReceipt({
        hash: txHashState,
    });

    const prevChainId = useRef(chainId);
    useEffect(() => {
        if (prevChainId.current !== chainId && chainId !== undefined) {
            close();
        }
        prevChainId.current = chainId;
    }, [chainId, close]);

    useEffect(() => {
        setCoinPrice(null);
        fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${currentChainConfig.binanceSymbol}`)
            .then(res => res.json())
            .then(data => setCoinPrice(parseFloat(data.price)))
            .catch(err => {
                console.error("Error fetching price", err);
                // Fallback for polygon POL if MATIC fails
                if (currentChainConfig.binanceSymbol === 'MATICUSDT') {
                    fetch(`https://api.binance.com/api/v3/ticker/price?symbol=POLUSDT`)
                        .then(res => res.json())
                        .then(data => setCoinPrice(parseFloat(data.price)))
                        .catch(e => console.error(e));
                }
            });
    }, [currentChainConfig.binanceSymbol]);

    const processedTx = useRef<string | null>(null);

    // Watch for success
    useEffect(() => {
        if (isSuccess && txHashState && processedTx.current !== txHashState) {
            processedTx.current = txHashState;
            
            // Notify backend
            fetch('/api/wallet-deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    txHash: txHashState,
                    amountUSD: amountUSD,
                    chainId: activeChainId
                })
            }).then(async (res) => {
                const data = await res.json();
                if (res.ok) {
                    onSuccess(txHashState);
                } else {
                    // If it was already processed by a concurrent request, just consider it success
                    if (data.error === 'Transaction already processed') {
                        onSuccess(txHashState);
                    } else {
                        throw new Error(data.error || "Backend verification failed");
                    }
                }
            }).catch(err => {
                console.error(err);
                onError(err);
                alert("Transaction failed: " + (err?.message || "Unknown error"));
            }).finally(() => {
                setLoading(false);
            });
        } else if (isReceiptError) {
            setLoading(false);
            onError(new Error("Transaction failed on-chain"));
            alert("Transaction failed on-chain");
        }
    }, [isSuccess, isReceiptError, txHashState, amountUSD, userToken, activeChainId, onSuccess, onError]);

    const handleConnectAndPay = async () => {
        if (!isConnected) {
            await open(); 
            return; 
        }

        if (!SUPPORTED_CHAINS[chainId as number]) {
            try {
                await switchChainAsync({ chainId: 56 });
            } catch (err: any) {
                alert("Please switch to a supported network (Ethereum, BNB, Polygon, Base, Linea)!");
                await open({ view: 'Networks' });
                return;
            }
        }

        if (!coinPrice) {
            alert("Waiting for coin price to load...");
            return;
        }

        setLoading(true);

        try {
            const coinAmount = amountUSD / coinPrice;
            const parsedAmount = parseEther(coinAmount.toFixed(6));

            const hash = await sendTransactionAsync({
                to: DESTINATION_WALLET as `0x${string}`,
                value: parsedAmount,
            });
            
            setTxHashState(hash);
            
        } catch (error: any) {
            setLoading(false);
            console.error(error);
            onError(error);
            // Ignore user rejected error from showing a gross popup
            if (!error?.message?.includes("User rejected")) {
                alert("Transaction failed: " + (error?.shortMessage || error?.message || "Unknown error"));
            }
        }
    };

    const isProcessing = loading || isSending || isWaiting;

    return (
        <div className="flex flex-col gap-3">
            {isConnected && (
                <div className="flex items-center justify-between bg-stone-900/50 p-3 rounded-lg border border-stone-800">
                    <div className="text-sm text-stone-300 flex items-center gap-2">
                        <span>Network:</span>
                        <span className="font-semibold text-white bg-stone-800 px-2 py-0.5 rounded">
                            {currentChainConfig.name}
                        </span>
                    </div>
                    <button 
                        onClick={() => open({ view: 'Networks' })}
                        className="text-xs bg-stone-800 hover:bg-stone-700 text-white px-3 py-1.5 rounded-md transition-colors border border-stone-700"
                    >
                        Change
                    </button>
                </div>
            )}
            <button
                onClick={handleConnectAndPay}
                disabled={isProcessing || amountUSD < 3}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    isProcessing || amountUSD < 3 ? 'bg-stone-800 text-stone-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-400 hover:to-yellow-500 shadow-lg'
                }`}
            >
                {isProcessing ? 'Processing...' : (!isConnected ? `Connect Wallet to Pay $${amountUSD}` : `Pay $${amountUSD} (${currentChainConfig.symbol} on ${currentChainConfig.name})`)}
            </button>
        </div>
    );
}
