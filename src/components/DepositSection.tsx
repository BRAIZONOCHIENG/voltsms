"use client";
/*
 * -----------------------------------------------------------------------------
 * 🔒 LOCKED FILE - PAYMENT COMPONENT
 * -----------------------------------------------------------------------------
 * Crypto payment logic (Hot Wallet).
 * 
 * See .agent/workflows/protected-files.md for details.
 * -----------------------------------------------------------------------------
 */
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaBitcoin, FaCopy, FaSpinner, FaCheckCircle, FaWallet } from 'react-icons/fa';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface DepositSectionProps {
    userToken?: string | null;
    onDepositSuccess?: () => void;
}

const HOT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_HOT_WALLET_ADDRESS || "0x0000000000000000000000000000000000000000";

export default function DepositSection({ userToken, onDepositSuccess }: DepositSectionProps) {
    const [copied, setCopied] = useState(false);
    const [checking, setChecking] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [loadingAddress, setLoadingAddress] = useState(true);

    // Fetch unique deposit address
    React.useEffect(() => {
        if (!userToken) return;

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
                    setAddress(data.address);
                }
            } catch (err) {
                console.error('Failed to fetch deposit address:', err);
            } finally {
                setLoadingAddress(false);
            }
        };

        fetchAddress();
    }, [userToken]);

    const handleCopy = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayAddress = address || 'Generating address...';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                        <FaBitcoin className="text-white text-lg" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Crypto Deposit</h3>
                        <p className="text-stone-500 text-xs text-wrap">Send crypto to your personal deposit address</p>
                    </div>
                </div>
            </div>

            {/* Address & QR Code */}
            <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-6 flex flex-col items-center gap-6">

                {/* QR Code */}
                <div className="bg-white p-3 rounded-xl shadow-lg shadow-purple-500/10 min-h-[204px] min-w-[204px] flex items-center justify-center">
                    {loadingAddress ? (
                        <FaSpinner className="animate-spin text-purple-600 text-4xl" />
                    ) : address ? (
                        <QRCodeSVG
                            value={address}
                            size={180}
                            fgColor="#1c1917" // stone-900
                            bgColor="#ffffff"
                            level="H"
                            includeMargin={false}
                        />
                    ) : (
                        <div className="text-stone-400 text-xs text-center p-4">Failed to generate address</div>
                    )}
                </div>

                {/* Address Text */}
                <div className="w-full text-center space-y-2">
                    <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">Deposit Address (EVM / BEP20)</p>
                    <div
                        onClick={handleCopy}
                        className={clsx(
                            "group relative cursor-pointer active:scale-95 transition-transform",
                            loadingAddress && "opacity-50 pointer-events-none"
                        )}
                    >
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-800/50 hover:bg-stone-800 rounded-lg border border-stone-700/50 hover:border-purple-500/50 transition-colors">
                            <span className="text-white font-mono text-sm break-all">
                                {loadingAddress ? '0x' + '.'.repeat(38) : displayAddress}
                            </span>
                            <div className="bg-stone-700 p-1.5 rounded-md text-stone-400 group-hover:text-white transition-colors">
                                {copied ? <FaCheckCircle className="text-green-500" /> : <FaCopy />}
                            </div>
                        </div>
                        <AnimatePresence>
                            {copied && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full shadow-lg"
                                >
                                    Copied!
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <p className="text-stone-500 text-[10px] mt-2">
                        Supported: <span className="text-purple-400 font-bold">BSC (BEP20), Polygon, ETH</span>. <br />
                        Tokens: <span className="text-white/70">BNB, USDT, USDC, MATIC, ETH</span>.
                    </p>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 flex gap-3 items-start">
                <FaWallet className="text-purple-400 mt-1 flex-shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-purple-200 text-sm font-bold">How it works</h4>
                    <ul className="text-stone-400 text-xs list-disc list-inside space-y-1 leading-relaxed">
                        <li>Send any amount to your unique address.</li>
                        <li>Deposits detected instantly (<span className="text-white">5-30s</span>).</li>
                        <li>$3 Minimum recommended for gas.</li>
                        <li>Balance updates automatically on confirmation.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
