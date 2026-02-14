"use client";

import React, { useState } from 'react';
import { FaCopy, FaCheck, FaExchangeAlt, FaSpinner, FaExternalLinkAlt } from 'react-icons/fa';

// Preset Amount Options (USD)
const AMOUNT_OPTIONS = [3, 5, 10, 20, 50, 100, 500, 1000];

export default function VoltSplitterPayment({ userId, userToken }: { userId: string, userToken?: string }) {
    const [amountUSD, setAmountUSD] = useState<number>(10);
    const [loading, setLoading] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

    const handleCreateInvoice = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/crypto/nowpayments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ amount: amountUSD })
            });

            const data = await res.json();

            if (data.invoice_url) {
                // If using the /v1/invoice endpoint
                window.location.href = data.invoice_url;
            } else if (data.pay_url) {
                // If using the /v1/payment endpoint (direct pay link)
                window.location.href = data.pay_url;
            } else {
                alert('Success! Redirecting you to the payment page...');
                // Fallback for some NP responses
                if (data.invoice_id) {
                    window.location.href = `https://nowpayments.io/payment/?iid=${data.invoice_id}`;
                } else {
                    console.error('NP Response:', data);
                    alert('Could not generate payment link. Please try again.');
                }
            }
        } catch (err) {
            console.error('Payment Error:', err);
            alert('Failed to initiate payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400">
                    <FaExchangeAlt className="text-xl" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white leading-tight">Crypto Deposit</h3>
                    <p className="text-xs text-stone-400">Auto-convert any coin to balance</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Amount Selector */}
                <div>
                    <label className="text-xs font-bold text-stone-500 uppercase mb-3 block">Deposit Amount (USD)</label>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {AMOUNT_OPTIONS.map((amt) => (
                            <button
                                key={amt}
                                onClick={() => setAmountUSD(amt)}
                                className={`py-2.5 rounded-xl text-sm font-bold transition-all border ${amountUSD === amt
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 border-purple-500'
                                    : 'bg-stone-800/50 text-stone-400 hover:bg-stone-700/50 hover:text-white border-stone-700/50'}`}
                            >
                                ${amt}
                            </button>
                        ))}
                    </div>

                    {/* Manual Input */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-stone-500 font-bold group-focus-within:text-purple-400">
                            $
                        </div>
                        <input
                            type="number"
                            min="3"
                            step="1"
                            value={amountUSD}
                            onChange={(e) => setAmountUSD(Number(e.target.value))}
                            className="w-full bg-stone-900/50 border border-white/10 rounded-xl py-3.5 pl-8 pr-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-stone-600"
                            placeholder="Enter custom amount"
                        />
                    </div>

                    {amountUSD < 3 && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">
                                Minimum $3. Deposits below this will be lost and not credited.
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Button & Attribution Area */}
                <div className="space-y-4">
                    <button
                        onClick={handleCreateInvoice}
                        disabled={loading || amountUSD < 3}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-purple-900/40 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:scale-100"
                    >
                        {loading ? (
                            <><FaSpinner className="animate-spin" /> Initializing...</>
                        ) : (
                            <>
                                {amountUSD < 3 ? 'Min Deposit $3' : `Pay $${amountUSD} with Crypto`}
                                <FaExternalLinkAlt className="text-xs opacity-60" />
                            </>
                        )}
                    </button>

                    <div className="flex flex-col items-center gap-2">
                        <p className="text-[10px] text-center text-stone-500 px-4">
                            Payments are processed securely via NOWPayments.
                        </p>
                        <a
                            href="https://nowpayments.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                        >
                            <span className="text-[9px] uppercase tracking-widest font-bold text-white">Powered by</span>
                            <img
                                src="https://nowpayments.io/images/logo-white.svg"
                                alt="NOWPayments"
                                className="h-3"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
