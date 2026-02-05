"use client";
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaBitcoin, FaCopy, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { supabase } from '../lib/supabaseClient';

interface DepositSectionProps {
    userToken?: string | null;
    onDepositSuccess?: () => void;
}

interface PaymentDetails {
    address: string;
    currency: string;
    network: string;
    trackId: string;
    amount: number;
    memo?: string;
}

// All supported coins with their networks
const CRYPTO_COINS: { symbol: string; name: string; networks: { id: string; name: string }[] }[] = [
    { symbol: 'BTC', name: 'Bitcoin', networks: [{ id: 'BTC', name: 'Bitcoin' }] },
    { symbol: 'ETH', name: 'Ethereum', networks: [{ id: 'ETH', name: 'Ethereum (ERC20)' }] },
    {
        symbol: 'USDT', name: 'Tether', networks: [
            { id: 'BSC', name: 'BSC (BEP20) - Low Fees' },
            { id: 'ERC20', name: 'Ethereum (ERC20)' },
            { id: 'TRC20', name: 'Tron (TRC20)' }
        ]
    },
    {
        symbol: 'USDC', name: 'USD Coin', networks: [
            { id: 'BSC', name: 'BSC (BEP20) - Low Fees' },
            { id: 'ERC20', name: 'Ethereum (ERC20)' }
        ]
    },
    { symbol: 'LTC', name: 'Litecoin', networks: [{ id: 'LTC', name: 'Litecoin' }] },
    { symbol: 'SOL', name: 'Solana', networks: [{ id: 'SOL', name: 'Solana' }] },
    { symbol: 'BNB', name: 'BNB', networks: [{ id: 'BSC', name: 'BSC (BEP20)' }] },
    { symbol: 'TRX', name: 'Tron', networks: [{ id: 'TRX', name: 'Tron (TRC20)' }] },
    { symbol: 'DOGE', name: 'Dogecoin', networks: [{ id: 'DOGE', name: 'Dogecoin' }] },
    { symbol: 'MATIC', name: 'Polygon', networks: [{ id: 'POLYGON', name: 'Polygon' }] },
    { symbol: 'POL', name: 'POL (Polygon)', networks: [{ id: 'POLYGON', name: 'Polygon' }] },
    {
        symbol: 'SHIB', name: 'Shiba Inu', networks: [
            { id: 'BEP20', name: 'BSC (BEP20) - Low Fees' },
            { id: 'ERC20', name: 'Ethereum (ERC20)' },
        ]
    },
    { symbol: 'AVAX', name: 'Avalanche', networks: [{ id: 'AVAX', name: 'Avalanche C-Chain' }] },
    { symbol: 'LINK', name: 'Chainlink', networks: [{ id: 'ERC20', name: 'Ethereum (ERC20)' }] },
    {
        symbol: 'DAI', name: 'Dai', networks: [
            { id: 'ERC20', name: 'Ethereum (ERC20)' },
            { id: 'BEP20', name: 'BSC (BEP20) - Low Fees' },
        ]
    },
    { symbol: 'BCH', name: 'Bitcoin Cash', networks: [{ id: 'BCH', name: 'Bitcoin Cash' }] },
    { symbol: 'XMR', name: 'Monero', networks: [{ id: 'XMR', name: 'Monero' }] },
    { symbol: 'XRP', name: 'Ripple', networks: [{ id: 'XRP', name: 'Ripple' }] },
    { symbol: 'ADA', name: 'Cardano', networks: [{ id: 'ADA', name: 'Cardano' }] },
    { symbol: 'NANO', name: 'Nano', networks: [{ id: 'NANO', name: 'Nano' }] },
    { symbol: 'BUSD', name: 'Binance USD', networks: [{ id: 'BEP20', name: 'BSC (BEP20)' }] },
    { symbol: 'USDP', name: 'Pax Dollar', networks: [{ id: 'ERC20', name: 'Ethereum' }] },
    { symbol: 'TUSD', name: 'TrueUSD', networks: [{ id: 'ERC20', name: 'Ethereum' }, { id: 'TRC20', name: 'Tron' }] },
    { symbol: 'ETC', name: 'Ethereum Classic', networks: [{ id: 'ETC', name: 'Ethereum Classic' }] },
    { symbol: 'XLM', name: 'Stellar', networks: [{ id: 'XLM', name: 'Stellar' }] },
];

// Coin logo URLs - using multiple CDN sources for reliability
const getCoinLogo = (symbol: string) => {
    const s = symbol.toLowerCase();
    return `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/32/color/${s}.png`;
};

export default function DepositSection({ userToken, onDepositSuccess }: DepositSectionProps) {
    const [depositAmount, setDepositAmount] = useState('10');
    const [selectedCoin] = useState('USDT'); // Default to USDT for API compatibility
    const [loading, setLoading] = useState(false);

    // Reset loading state if the user navigates back to this page
    useEffect(() => {
        setLoading(false);
    }, []);

    const getAccessToken = async () => {
        if (userToken) return userToken;
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (error) {
            const currentSession = await supabase.auth.getSession();
            return currentSession.data.session?.access_token || null;
        }
        return session?.access_token || null;
    };

    const handleCreatePayment = async () => {
        if (!selectedCoin) return;

        const amount = parseFloat(depositAmount);
        if (isNaN(amount) || amount < 5) {
            alert('Minimum deposit is $5');
            return;
        }

        setLoading(true);
        try {
            const token = await getAccessToken();
            if (!token) {
                alert('Please login first');
                setLoading(false);
                return;
            }

            const res = await fetch('/api/crypto/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: selectedCoin
                    // Network is selected on OxaPay page if applicable, or we send valid defaults if needed.
                    // But Merchant Link usually handles it.
                })
            });

            const data = await res.json();
            console.log('Payment response status:', res.status);
            console.log('Payment response body:', data);

            if (data.success && data.payLink) {
                // Redirect to OxaPay
                window.location.href = data.payLink;
            } else {
                alert(`Payment Error: ${data.error || data.message || 'Unknown error'}`);
                setLoading(false);
            }
        } catch (error) {
            console.error('Payment creation error:', error);
            alert('Failed to create payment. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                    <FaBitcoin className="text-white text-lg" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Crypto Deposit</h3>
                    <p className="text-stone-500 text-xs">Redirects to Secure Checkout</p>
                </div>
            </div>

            {/* Amount */}
            <div>
                <label className="text-xs font-medium text-stone-400 mb-2 block">Amount (USD)</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-lg">$</span>
                    <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full bg-stone-900/50 border border-stone-700/50 rounded-xl pl-10 pr-4 py-4 text-white text-xl font-bold focus:outline-none focus:border-purple-500 transition-all"
                        placeholder="10"
                        min="5"
                        max="1000"
                    />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3">
                    {['5', '10', '25', '50', '100', '200', '500', '1000'].map(amt => (
                        <button
                            key={amt}
                            onClick={() => setDepositAmount(amt)}
                            className={clsx(
                                "py-2.5 rounded-lg text-sm font-bold transition-all",
                                depositAmount === amt
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-stone-800/50 text-stone-400 hover:bg-stone-700/50 hover:text-white'
                            )}
                        >
                            ${amt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Button */}
            <button
                onClick={handleCreatePayment}
                disabled={loading}
                className={clsx(
                    "w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2",
                    !loading
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
                        : "bg-stone-800 text-stone-500 cursor-not-allowed"
                )}
            >
                {loading ? <><FaSpinner className="animate-spin" /> Redirecting...</> : `Pay Now`}
            </button>

            <div className="flex flex-col items-center justify-center gap-2 mt-4 opacity-60 hover:opacity-100 transition-opacity">
                <p className="text-center text-xs text-stone-500">
                    You will choose your preferred cryptocurrency on the next step.
                </p>
                <p className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">
                    Powered by <span className="font-bold text-stone-400">OxaPay</span>
                </p>
            </div>
        </div>
    );
}
