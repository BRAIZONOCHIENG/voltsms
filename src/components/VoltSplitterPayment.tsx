"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useSendTransaction } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { FaWallet, FaCopy, FaCheck, FaExchangeAlt, FaTimes, FaSpinner } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';

// --- Configuration ---
// Hot Wallet Address (Receives 100% of funds, backend forwards 35% to SMSPool)
const RECEIVER_ADDRESS = "0x7A4DcEE7258f4cD1C141B70651de747408Ab800b" as const;

const ERC20_ABI = [
    { inputs: [{ name: "to", type: "address" }, { name: "value", type: "uint256" }], name: "transfer", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
    { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
    { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
    { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
] as const;

// Preset Amount Options (USD)
const AMOUNT_OPTIONS = [3, 5, 10, 20, 50, 100, 500, 1000];

// Token List - ONLY tokens accepted by SMSPool on BSC network
const TOKENS = [
    { symbol: 'BNB', name: 'Binance Coin', address: 'NATIVE', decimals: 18, coingeckoId: 'binancecoin', image: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=025' },
    { symbol: 'USDT', name: 'Tether USD (BSC)', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, coingeckoId: 'tether', image: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=025' },
    { symbol: 'USDC', name: 'USD Coin (BSC)', address: '0x8AC76a51cc950d9822D68b83fE1Ad97f1C0160f0', decimals: 18, coingeckoId: 'usd-coin', image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=025' },
];

// Price cache
let priceCache: { [key: string]: number } = {};
let priceCacheTime = 0;
const CACHE_DURATION = 60000;

async function fetchPrices(): Promise<{ [key: string]: number }> {
    const now = Date.now();
    if (now - priceCacheTime < CACHE_DURATION && Object.keys(priceCache).length > 0) {
        return priceCache;
    }

    try {
        const ids = TOKENS.map(t => t.coingeckoId).join(',');
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
        const data = await res.json();

        const prices: { [key: string]: number } = {};
        TOKENS.forEach(token => {
            if (data[token.coingeckoId]?.usd) {
                prices[token.symbol] = data[token.coingeckoId].usd;
            }
        });

        priceCache = prices;
        priceCacheTime = now;
        return prices;
    } catch (e) {
        console.error('Failed to fetch prices:', e);
        // Fallback prices for SMSPool-accepted BSC tokens only
        return { 'BNB': 650, 'USDT': 1, 'USDC': 1 };
    }
}

export default function VoltSplitterPayment({ userId, userToken }: { userId: string, userToken?: string }) {
    const { open } = useAppKit();
    const { address: connectedAddress, isConnected } = useAppKitAccount();

    const [amountUSD, setAmountUSD] = useState<number>(10);
    const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
    const [mode, setMode] = useState<'connect' | 'manual'>('manual');
    const [copied, setCopied] = useState(false);
    const [txStep, setTxStep] = useState<'idle' | 'approving' | 'paying'>('idle');
    const [prices, setPrices] = useState<{ [key: string]: number }>({});
    const [loadingPrices, setLoadingPrices] = useState(true);
    const [showManualModal, setShowManualModal] = useState(false);

    // Unique Deposit Address state
    const [depositAddress, setDepositAddress] = useState<string | null>(null);
    const [loadingAddress, setLoadingAddress] = useState(true);

    // Fetch unique deposit address
    useEffect(() => {
        const fetchAddress = async () => {
            try {
                setLoadingAddress(true);
                const res = await fetch('/api/crypto/allocate', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });
                const data = await res.json();
                if (data.address) {
                    setDepositAddress(data.address);
                }
            } catch (err) {
                console.error('Failed to fetch deposit address:', err);
            } finally {
                setLoadingAddress(false);
            }
        };

        if (userToken) fetchAddress();
    }, [userToken]);

    // Write Contract for ERC20 Transfers
    const { writeContract, data: writeHash, error: writeError, isPending: isWritePending, reset: resetWrite } = useWriteContract();

    // Send Transaction for Native BNB
    const { sendTransaction, data: sendHash, error: sendError, isPending: isSendPending } = useSendTransaction();

    // Track the active hash (either write or send)
    const hash = writeHash || sendHash;
    const isPending = isWritePending || isSendPending;
    const error = writeError || sendError;

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        const loadPrices = async () => {
            setLoadingPrices(true);
            const p = await fetchPrices();
            setPrices(p);
            setLoadingPrices(false);
        };
        loadPrices();
        const interval = setInterval(loadPrices, 60000);
        return () => clearInterval(interval);
    }, []);

    const getCryptoAmount = useCallback((): string => {
        const price = prices[selectedToken.symbol];
        if (!price || price === 0) return '0';
        const cryptoAmount = amountUSD / price;
        return cryptoAmount.toFixed(8).replace(/\.?0+$/, '');
    }, [amountUSD, selectedToken.symbol, prices]);

    const handlePayment = async () => {
        if (!isConnected) return open();
        if (!depositAddress) {
            alert('Deposit address not ready. Please refresh.');
            return;
        }

        const price = prices[selectedToken.symbol];
        if (!price) {
            alert('Prices are loading. Please wait a moment and try again.');
            return;
        }

        try {
            const cryptoAmount = amountUSD / price;
            const amountWei = selectedToken.address === 'NATIVE'
                ? parseEther(cryptoAmount.toFixed(18))
                : parseUnits(cryptoAmount.toFixed(selectedToken.decimals), selectedToken.decimals);

            setTxStep('paying');

            if (selectedToken.address === 'NATIVE') {
                // Send BNB directly to the UNIQUE sub-address
                sendTransaction({
                    to: depositAddress as `0x${string}`,
                    value: amountWei,
                });
            } else {
                // Send ERC20 Token directly to the UNIQUE sub-address
                writeContract({
                    address: selectedToken.address as `0x${string}`,
                    abi: ERC20_ABI,
                    functionName: 'transfer',
                    args: [depositAddress as `0x${string}`, amountWei]
                });
            }
        } catch (err) {
            console.error(err);
            setTxStep('idle');
        }
    };


    useEffect(() => {
        if (isConfirmed) {
            setTxStep('idle');
            // Trigger immediate scan
            fetch('/api/crypto/auto-forward').catch(console.error);
        }
    }, [isConfirmed]);

    const copyAddress = async () => {
        if (!depositAddress) return;
        try {
            await navigator.clipboard.writeText(depositAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            alert('Copy failed. Address: ' + depositAddress);
        }
    };



    // Clean error message for display
    const getCleanErrorMessage = (error: Error | null): string => {
        if (!error) return '';
        const msg = error.message.toLowerCase();
        if (msg.includes('rejected') || msg.includes('denied') || msg.includes('cancelled')) {
            return 'Transaction was cancelled.';
        }
        if (msg.includes('insufficient')) {
            return 'Insufficient balance for this transaction.';
        }
        if (msg.includes('network') || msg.includes('chain')) {
            return 'Please switch to BNB Smart Chain network.';
        }
        return 'Transaction failed. Please try again.';
    };

    const AmountSelector = () => (
        <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Select Amount (USD)</label>
            <div className="grid grid-cols-4 gap-2">
                {AMOUNT_OPTIONS.map((amt) => (
                    <button
                        key={amt}
                        onClick={() => setAmountUSD(amt)}
                        className={`py-2.5 rounded-lg text-sm font-bold transition-all ${amountUSD === amt
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-stone-800/50 text-stone-400 hover:bg-stone-700/50 hover:text-white border border-stone-700/50'}`}
                    >
                        ${amt}
                    </button>
                ))}
            </div>
        </div>
    );

    const TokenSelector = () => (
        <div>
            <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Pay With (BSC Network)</label>
            <div className="grid grid-cols-3 gap-2">
                {TOKENS.map((token) => (
                    <button
                        key={token.symbol}
                        onClick={() => setSelectedToken(token)}
                        className={`flex items-center gap-1.5 px-2 py-2 rounded-lg border transition-all text-xs ${selectedToken.symbol === token.symbol ? 'bg-purple-500/20 border-purple-500 text-purple-200' : 'bg-white/5 border-transparent text-stone-400 hover:bg-white/10'}`}
                    >
                        <img src={token.image} alt={token.symbol} className="w-4 h-4 rounded-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <span className="font-bold">{token.symbol}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            {/* Header Tabs */}
            <div className="flex gap-2 p-1 bg-black/40 rounded-xl mb-6">
                <button
                    onClick={() => setMode('connect')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'connect' ? 'bg-purple-600 text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
                >
                    <FaWallet /> Connect Wallet
                </button>
                <button
                    onClick={() => setMode('manual')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'manual' ? 'bg-purple-600 text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
                >
                    <FaExchangeAlt /> Manual Transfer
                </button>
            </div>

            {mode === 'connect' ? (
                <div className="space-y-5">
                    <AmountSelector />
                    <TokenSelector />

                    {!loadingPrices && prices[selectedToken.symbol] && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <p className="text-xs text-stone-400">You will pay approximately</p>
                            <p className="text-lg font-bold text-green-400">
                                {getCryptoAmount()} {selectedToken.symbol}
                            </p>
                            <p className="text-xs text-stone-500">
                                @ ${prices[selectedToken.symbol]?.toLocaleString()} per {selectedToken.symbol}
                            </p>
                        </div>
                    )}

                    {!isConnected ? (
                        <button onClick={() => open()} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 mt-2">
                            Connect Wallet to Pay ${amountUSD}
                        </button>
                    ) : (
                        <button
                            onClick={handlePayment}
                            disabled={isWritePending || isConfirming || loadingPrices}
                            className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {(isWritePending || isConfirming) ? (
                                <><FaSpinner className="animate-spin" /> Processing...</>
                            ) : loadingPrices ? (
                                <><FaSpinner className="animate-spin" /> Loading prices...</>
                            ) : (
                                <>
                                    Pay {getCryptoAmount()} {selectedToken.symbol} (${amountUSD})
                                </>
                            )}
                        </button>
                    )}

                    {isConfirmed && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg text-sm font-bold text-center">
                            ✅ Payment Successful! Your balance will update shortly.
                        </div>
                    )}

                    {writeError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-center">
                            <p className="font-medium mb-3">❌ {getCleanErrorMessage(writeError)}</p>
                            <button
                                onClick={() => resetWrite()}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold py-2 px-6 rounded-lg transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-5">
                    <AmountSelector />
                    <TokenSelector />

                    {!loadingPrices && prices[selectedToken.symbol] && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                            <p className="text-xs text-stone-400">You need to send</p>
                            <p className="text-lg font-bold text-purple-400">
                                {getCryptoAmount()} {selectedToken.symbol}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => setShowManualModal(true)}
                        disabled={loadingPrices}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50"
                    >
                        {loadingPrices ? 'Loading...' : `Show Deposit Address`}
                    </button>
                </div>
            )}

            {/* Manual Transfer Modal */}
            {showManualModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowManualModal(false)}>
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Manual Deposit</h3>
                            <button onClick={() => setShowManualModal(false)} className="text-stone-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6 text-center">
                            <p className="text-stone-400 text-sm mb-1">Send exactly</p>
                            <p className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                <img src={selectedToken.image} alt={selectedToken.symbol} className="w-7 h-7 rounded-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                {getCryptoAmount()} <span className="text-purple-400">{selectedToken.symbol}</span>
                            </p>
                            <p className="text-sm text-stone-400 mt-1">(≈ ${amountUSD} USD)</p>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-white p-4 rounded-xl shadow-xl min-h-[212px] min-w-[212px] flex items-center justify-center">
                                {loadingAddress ? (
                                    <FaSpinner className="animate-spin text-purple-600 text-3xl" />
                                ) : depositAddress ? (
                                    <QRCodeSVG
                                        value={depositAddress}
                                        size={180}
                                        level="H"
                                        includeMargin={true}
                                    />
                                ) : (
                                    <p className="text-stone-500 text-xs">Failed to load address</p>
                                )}
                            </div>
                        </div>

                        {/* Address with Copy */}
                        <div className="bg-black/40 p-4 rounded-xl border border-white/10 mb-4">
                            <label className="text-xs font-bold text-stone-500 uppercase block mb-2">Deposit Address (BSC Network)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={loadingAddress ? 'Loading...' : (depositAddress || 'Error')}
                                    className="flex-1 bg-transparent text-purple-300 font-mono text-xs border-none outline-none cursor-text select-all"
                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                />
                                <button
                                    onClick={copyAddress}
                                    className={`p-3 rounded-lg transition-all shrink-0 ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white'}`}
                                    title="Copy address"
                                >
                                    {copied ? <FaCheck /> : <FaCopy />}
                                </button>
                            </div>
                            {copied && <p className="text-green-400 text-xs mt-2 text-center font-medium">✓ Address copied to clipboard!</p>}
                        </div>

                        {/* Warning - cleaned up, no internal info */}
                        <div className="text-xs text-stone-400 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                            <div className="flex gap-2">
                                <span className="text-lg">⚠️</span>
                                <div>
                                    <strong className="text-yellow-500 block mb-1">Important:</strong>
                                    <ul className="list-disc pl-4 space-y-0.5 opacity-80">
                                        <li>Send <strong>{selectedToken.symbol}</strong> on <strong>BNB Smart Chain (BEP20)</strong> only.</li>
                                        <li>Wrong token or network may result in lost funds.</li>
                                        <li>Your balance will update automatically after confirmation.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowManualModal(false)}
                            className="w-full mt-4 py-3 rounded-xl border border-white/10 text-stone-400 hover:text-white hover:bg-white/5 transition-all font-bold"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
