"use client";

import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { createPublicClient, http, formatEther, parseEther } from 'viem';
import { bsc } from 'viem/chains';

const HOT_WALLET = "0x7A4DcEE7258f4cD1C141B70651de747408Ab800b";

export default function CryptoAdmin() {
    const { address, isConnected } = useAppKitAccount();
    const [balance, setBalance] = useState('0');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawToken, setWithdrawToken] = useState('BNB');
    const [status, setStatus] = useState('');
    const [secret, setSecret] = useState('');

    useEffect(() => {
        const fetchBalance = async () => {
            const publicClient = createPublicClient({
                chain: bsc,
                transport: http('https://bsc-dataseed.binance.org')
            });
            const bal = await publicClient.getBalance({ address: HOT_WALLET });
            setBalance(formatEther(bal));
        };
        fetchBalance();
        const interval = setInterval(fetchBalance, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleSetMax = () => {
        if (withdrawToken === 'BNB') {
            // Leave 0.0005 BNB for gas
            const currentBal = parseFloat(balance);
            const safeMax = Math.max(0, currentBal - 0.0005);
            setWithdrawAmount(safeMax.toFixed(4));
        } else {
            // For tokens, we'd need to fetch token balance.
            // Since we only query native BNB balance above, we can't reliably do Max for tokens yet without updating the fetch logic.
            // For now, let's just alert or handle BNB max.
            alert("Max button currently supports BNB. For tokens, please check your token balance on BscScan.");
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || !secret) return;
        setStatus('Processing...');

        try {
            const res = await fetch('/api/crypto/withdraw-profit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: withdrawAmount,
                    address: address || "0x83C67a263773CB8dA9834d4965E9e5F1d4c9a5B1",
                    token: withdrawToken,
                    secret: secret
                })
            });

            const data = await res.json();
            if (data.success) {
                setStatus(`Success! Hash: ${data.hash}`);
                setWithdrawAmount(''); // Clear after success
            } else {
                setStatus(`Error: ${data.error}`);
            }
        } catch (e: any) {
            setStatus(`Error: ${e.message}`);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Profit Withdrawal</h1>
                <p className="text-stone-400">Manage and withdraw earnings from the automatic hot wallet.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Balance Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                    <h2 className="text-lg font-bold text-white mb-4">Hot Wallet Balance</h2>
                    <div className="flex items-end gap-3 mb-2">
                        <span className="text-4xl font-bold text-green-400">{parseFloat(balance).toFixed(4)}</span>
                        <span className="text-xl font-bold text-stone-500 mb-1">BNB</span>
                    </div>
                    <p className="text-xs font-mono text-stone-500 break-all bg-black/20 p-2 rounded border border-white/5">{HOT_WALLET}</p>

                    <div className={`mt-4 p-3 rounded-lg border text-xs ${parseFloat(balance) < 0.01 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                        <p className="font-bold mb-1">{parseFloat(balance) < 0.01 ? '⚠️ CRITICAL: Low Gas' : '⚠️ Important'}</p>
                        Always leave ~0.005 BNB for gas fees. If gas runs out, auto-forwarding will stop.
                    </div>
                </div>

                {/* Withdrawal Form */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                    <h2 className="text-lg font-bold text-white mb-6">Withdraw Funds</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Withdraw As</label>
                            <select
                                value={withdrawToken}
                                onChange={(e) => setWithdrawToken(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500/50 transition-colors"
                            >
                                <option value="BNB">BNB (Native)</option>
                                <option value="USDT">USDT (BEP20)</option>
                                <option value="USDC">USDC (BEP20)</option>
                            </select>
                        </div>

                        <div>
                            <label className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-stone-500 uppercase">Amount (in {withdrawToken})</span>
                                {withdrawToken === 'BNB' && (
                                    <button
                                        onClick={handleSetMax}
                                        className="text-xs font-bold text-purple-400 hover:text-purple-300"
                                    >
                                        MAX (Safe)
                                    </button>
                                )}
                            </label>
                            <input
                                type="text"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                placeholder={`0.00 ${withdrawToken}`}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500/50 transition-colors"
                            />
                            <p className="text-[10px] text-stone-500 mt-1">Enter the amount of <b>crypto</b> tokens to withdraw, NOT dollars.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Admin Secret</label>
                            <input
                                type="password"
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                placeholder="Enter Admin Secret"
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500/50 transition-colors"
                            />
                        </div>

                        <button
                            onClick={handleWithdraw}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-900/20 mt-2"
                        >
                            Withdraw {withdrawAmount || '0'} {withdrawToken}
                        </button>

                        {status && (
                            <div className={`mt-4 p-3 rounded-xl text-sm font-bold break-all text-center ${status.includes('Success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {status}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
