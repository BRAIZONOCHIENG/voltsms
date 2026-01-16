"use client";
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaWallet, FaBitcoin, FaPaypal, FaMobileAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import { supabase } from '../lib/supabaseClient';

const PaystackTrigger = dynamic(() => import('./PaystackTrigger'), { ssr: false });
const PayPalTrigger = dynamic(() => import('./PayPalTrigger'), { ssr: false });

interface DepositSectionProps {
    userEmail: string | null;
    onDepositSuccess: () => void;
}

// User-provided static addresses
// Note: LTC is missing from user input, temporarily omitting or using BTC placeholder? 
// User asked to "maintain" coins. I'll add LTC but maybe I need the address.
// I will map USDT to BSC as it is common and user provided BSC address.
const WALLETS = {
    'BTC': { address: 'bc1qnh7ve8xzsjsdpws2x467h0uu7htwq3rghn4uwt', network: 'Bitcoin', name: 'Bitcoin', icon: 'bitcoin' },
    'ETH': { address: '0x83C67a263773CB8dA9834d4965E9e5F1d4c9a5B1', network: 'Ethereum (ERC20)', name: 'Ethereum', icon: 'ethereum' },
    'BNB': { address: '0x83C67a263773CB8dA9834d4965E9e5F1d4c9a5B1', network: 'BSC (BEP20)', name: 'Binance Coin', icon: 'binance' },
    'USDT': { address: '0x83C67a263773CB8dA9834d4965E9e5F1d4c9a5B1', network: 'BSC (BEP20)', name: 'Tether', icon: 'tether' }, // USDT on BSC
    'MATIC': { address: '0x83C67a263773CB8dA9834d4965E9e5F1d4c9a5B1', network: 'Polygon', name: 'Polygon', icon: 'polygon' },
    'SOL': { address: '3BFdLqQqYjNKk6KsK6zyBn48miTRZPLEWPjYLAP9huoT', network: 'Solana', name: 'Solana', icon: 'solana' },
    // 'LTC': { address: 'MISSING', network: 'Litecoin', name: 'Litecoin', icon: 'litecoin' }
};

export default function DepositSection({ userEmail, onDepositSuccess }: DepositSectionProps) {
    const [depositAmount, setDepositAmount] = useState('1');
    const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'paypal' | 'card' | 'mpesa'>('crypto');
    const [loading, setLoading] = useState(false);



    // Crypto State
    const [selectedCoin, setSelectedCoin] = useState<keyof typeof WALLETS | ''>('');

    const getAccessToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || null;
    };

    const handleVerifyParams = async (type: string, data: Record<string, unknown>) => {
        setLoading(true);
        const token = await getAccessToken();
        if (!token) return;

        try {
            // Note: reusing /deposit endpoint or we need a verify one. 
            // For now let's assume /deposit can handle verification or we create one.
            // Actually, let's call a new endpoint /deposit/verify in backend
            const res = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type, ...data })
            });
            const result = await res.json();
            if (result.success) {
                alert(`Success! Deposit credited ($${result.newBalance})`);
                onDepositSuccess();
                setDepositAmount('');
            } else {
                alert(`Verification failed: ${result.detail}`);
            }
        } catch (e) {
            console.error(e);
            alert("Verification error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async () => {
        alert("For crypto payments, please send funds to the displayed address. Contact support for confirmation.");
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Payment Method Toggle */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                <button
                    onClick={() => setPaymentMethod('crypto')}
                    className={clsx(
                        "h-14 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-3 relative overflow-hidden group border",
                        paymentMethod === 'crypto'
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white shadow-lg"
                            : "bg-transparent border-transparent text-stone-400 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <FaBitcoin className="text-xl opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span>Crypto</span>
                </button>
                <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={clsx(
                        "h-14 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-3 relative overflow-hidden group border",
                        paymentMethod === 'paypal'
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white shadow-lg"
                            : "bg-transparent border-transparent text-stone-400 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <FaPaypal className="text-xl opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span>PayPal</span>
                </button>
                <button
                    onClick={() => setPaymentMethod('card')}
                    className={clsx(
                        "h-14 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-3 relative overflow-hidden group border",
                        paymentMethod === 'card'
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white shadow-lg"
                            : "bg-transparent border-transparent text-stone-400 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <FaWallet className="text-xl opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span>Card</span>
                </button>
                <button
                    onClick={() => setPaymentMethod('mpesa')}
                    className={clsx(
                        "h-14 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-3 relative overflow-hidden group border",
                        paymentMethod === 'mpesa'
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white shadow-lg"
                            : "bg-transparent border-transparent text-stone-400 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <FaMobileAlt className="text-xl opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span>M-Pesa</span>
                </button>
            </div>

            {paymentMethod === 'crypto' ? (
                <div className="space-y-4 pt-2">
                    <label className="text-xs font-semibold uppercase text-stone-400 tracking-wider ml-1">Select Coin</label>
                    <div className="grid grid-cols-3 gap-3">
                        {/* 
                            Original Request: BTC, ETH, LTC, USDT, DOGE, SOL 
                            New Request: Replace DOGE with BNB.
                            Since I don't have LTC address, I'm omitting it to avoid issues.
                            USDT mapped to BSC.
                        */}
                        {['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'MATIC'].map(coin => (
                            <button
                                key={coin}
                                onClick={() => setSelectedCoin(coin as keyof typeof WALLETS)}
                                className={`border rounded-xl py-3 flex flex-col items-center justify-center gap-2 transition-all ${selectedCoin === coin
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white shadow-lg shadow-purple-500/20'
                                    : 'bg-white/5 border-white/5 text-stone-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <img
                                    src={`https://cdn.simpleicons.org/${WALLETS[coin as keyof typeof WALLETS].icon}/white`}
                                    alt={coin}
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                                <span className="font-bold text-xs">{coin}</span>
                            </button>
                        ))}
                    </div>

                    {selectedCoin && WALLETS[selectedCoin] && (
                        <div className="bg-black/40 border border-white/10 rounded-xl p-4 mt-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="bg-white p-2 rounded-lg">
                                    <QRCodeSVG
                                        value={WALLETS[selectedCoin].address}
                                        size={128}
                                        fgColor="#000000"
                                        bgColor="#ffffff"
                                        level="M"
                                    />
                                </div>
                                <div className="w-full">
                                    <label className="text-xs text-stone-500 uppercase font-semibold mb-1 block">Send {WALLETS[selectedCoin].name} to:</label>
                                    <div
                                        onClick={() => {
                                            navigator.clipboard.writeText(WALLETS[selectedCoin].address);
                                            alert("Address Copied!");
                                        }}
                                        className="bg-[#111] border border-white/20 rounded-lg p-3 font-mono text-sm break-all text-white cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-between group"
                                    >
                                        {WALLETS[selectedCoin].address}
                                        <span className="text-xs bg-white/10 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">COPY</span>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center mt-3 text-xs text-stone-400">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                        Only send <span className="text-white font-bold">{WALLETS[selectedCoin].network}</span> network funds.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-stone-400 tracking-wider ml-1">Deposit Amount (USD)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                            <input
                                type="number"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl pl-8 pr-4 py-4 text-white text-lg font-bold focus:outline-none focus:border-[var(--color-secondary)] transition-colors"
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {['1', '5', '10', '25'].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setDepositAmount(amt)}
                                    className={`py-2 rounded-lg text-sm font-medium border transition-all ${depositAmount === amt
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent text-white shadow-lg'
                                        : 'bg-white/5 border-white/5 text-stone-400 hover:bg-white/10'
                                        }`}
                                >
                                    ${amt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        {paymentMethod === 'paypal' ? (
                            <PayPalTrigger
                                amount={parseFloat(depositAmount) || 0}
                                getAccessToken={getAccessToken}
                                onSuccess={(orderID) => handleVerifyParams('paypal', { orderID })}
                                onError={(err) => {
                                    console.error("PayPal Button Error:", err);
                                    alert("PayPal failed to load or process. Check console.");
                                }}
                            />
                        ) : (paymentMethod === 'card' || paymentMethod === 'mpesa') ? (
                            <PaystackTrigger
                                email={userEmail || ''}
                                amountUSD={parseFloat(depositAmount) || 0}
                                method={paymentMethod}
                                onSuccess={(ref: { reference: string }) => handleVerifyParams('paystack', { reference: ref.reference, amount: parseFloat(depositAmount) })}
                            />
                        ) : null}
                    </div>
                </>
            )}
        </div>
    );
}
