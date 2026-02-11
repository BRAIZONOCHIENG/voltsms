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
    const [lastCheck, setLastCheck] = useState<string | null>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(HOT_WALLET_ADDRESS);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Manual validation removed for automation focus

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
                        <p className="text-stone-500 text-xs">Send crypto to your personal deposit address</p>
                    </div>
                </div>
                {/* Manual Check Button */}
                {/* Manual Check Button Removed */}
            </div>

            {/* Address & QR Code */}
            <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-6 flex flex-col items-center gap-6">

                {/* QR Code */}
                <div className="bg-white p-3 rounded-xl shadow-lg shadow-purple-500/10">
                    <QRCodeSVG
                        value={HOT_WALLET_ADDRESS}
                        size={180}
                        fgColor="#1c1917" // stone-900
                        bgColor="#ffffff"
                        level="H"
                        includeMargin={false}
                    />
                </div>

                {/* Address Text */}
                <div className="w-full text-center space-y-2">
                    <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">Deposit Address (EVM / BEP20)</p>
                    <div
                        onClick={handleCopy}
                        className="group relative cursor-pointer active:scale-95 transition-transform"
                    >
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-800/50 hover:bg-stone-800 rounded-lg border border-stone-700/50 hover:border-purple-500/50 transition-colors">
                            <span className="text-white font-mono text-sm break-all">{HOT_WALLET_ADDRESS}</span>
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
                        Supported Networks: <span className="text-purple-400 font-bold">BSC (BEP20), Polygon, ETH</span>. <br />
                        Send only supported tokens (USDT, USDC, BNB, MATIC). Use the correct network.
                    </p>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 flex gap-3 items-start">
                <FaWallet className="text-purple-400 mt-1 flex-shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-purple-200 text-sm font-bold">How it works</h4>
                    <ul className="text-stone-400 text-xs list-disc list-inside space-y-1">
                        <li>Send any amount to the address above.</li>
                        <li>Payments are detected automatically (usually within 1-2 mins).</li>
                        <li>Your balance will be updated instantly upon confirmation.</li>
                        <li>Checking for deposits runs continuously.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
