"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCopy, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

interface Order {
    order_id: string; // or 'id' per dashboard
    service: string;
    phone: string;
    status: string;
    created_at?: string;
    expires_at?: number;
    code?: string;
    price?: number;
    type?: 'sms' | 'voice' | 'rental';
}

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void; // Minimizes the modal
    order: Order | null;
    onCancel: (orderId: string) => void;
    onReport?: (orderId: string) => void;
}

export default function VerificationModal({ isOpen, onClose, order, onCancel, onReport }: VerificationModalProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!order || !order.expires_at || order.status === 'completed' || order.status === 'expired' || order.status === 'cancelled') return;

        // Timer for countdown
        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(0, order.expires_at! - now);
            setTimeLeft(remaining);
        };

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);

        // POLL FOR SMS CODE
        // We poll every 3 seconds to check if the code arrived
        const checkInterval = setInterval(async () => {
            try {
                const res = await fetch('/api/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('supabase-auth-token')}` }, // We might need to pass auth token? 
                    // Actually, the page might not have the token easily accessible here unless passed as prop or context.
                    // For now, let's assume valid session cookie or handle existing auth patterns.
                    // The dashboard typically uses supabase client auth.
                    // The API routes use `supabaseAdmin.auth.getUser(token)`. 
                    // We need to send the token. 
                    body: JSON.stringify({ orderId: order.order_id })
                });

                // Since we need the token, let's get it from the standard Supabase session
                // We'll quick-fetch it inside the interval to be safe
                const { data: { session } } = await import('../lib/supabaseClient').then(m => m.supabase.auth.getSession());

                if (session?.access_token) {
                    const checkRes = await fetch('/api/check', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({ orderId: order.order_id })
                    });

                    const data = await checkRes.json();

                    if (data.status === 'completed' && data.code) {
                        // SUCCESS!
                        // We could trigger a refresh via a callback prop, or just force reload? 
                        // Better to call a callback.
                        if (onReport) {
                            // Wait, onReport is for reporting. We likely need an onComplete callback 
                            // OR we just rely on the user refreshing, but providing immediate feedback is better.
                            // For now, let's set a local state or reload.
                            // Actually, the `order` prop comes from the parent. If we don't update parent, UI won't update.
                            // The dashboard parent needs to know.
                            // We'll emit `onClose` to force refresh? No.
                            // We will imply it via window reload for MVP or just show it locally if we can.
                            // The dashboard parent polls api/orders, which now actively checks for codes.
                            // So we don't strictly need to force reload, but we should update the valid order prop if possible.
                            // Ideally, we just let the polling interval in this modal (lines 44+) update the local state?
                            // Ah, this effect relies on `order` prop updating.
                            // The `onReport` callback isn't suitable for success.
                            // We'll just let the UI re-render when `order` prop updates from parent, 
                            // OR if we wanted to be self-contained, we'd update a local state override.
                            // But for now, removing the reload is safer. The parent `fetchData` loop will catch the completion.
                            // We can trigger a quick parent refresh if we had a callback.
                            // window.location.reload(); // Removed to prevent jarring UX
                        }
                    }
                }

            } catch (e) {
                console.error("Polling error", e);
            }
        }, 3000);

        return () => {
            clearInterval(timerInterval);
            clearInterval(checkInterval);
        };
    }, [order]);

    const formatTime = (ms: number) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (!isOpen || !order) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose} // Close on backdrop click
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#1a1a1a] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            {order.type === 'voice' ? 'Voice Verification' : 'SMS Verification'}
                            <span className="text-xs font-normal text-stone-400 bg-black/30 px-2 py-0.5 rounded">
                                #{order.order_id.substring(0, 6)}
                            </span>
                        </h3>
                        <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Status Banner */}
                    <div className={`p-4 text-sm font-medium flex items-start gap-3 ${order.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-300'}`}>
                        {order.status === 'completed' ? (
                            <FaCheckCircle className="text-lg shrink-0 mt-0.5" />
                        ) : (
                            <FaSpinner className="text-lg shrink-0 mt-0.5 animate-spin" />
                        )}
                        <div>
                            {order.status === 'completed'
                                ? "Verification completed successfully!"
                                : `Waiting to receive ${order.type === 'voice' ? 'a call' : 'an SMS'} from ${order.service}. Please note that services may take multiple attempts.`
                            }
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-6 space-y-6">

                        {/* Number Section */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Use This Number</label>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white flex items-center gap-3">
                                    <span className="text-2xl pt-1">🇺🇸</span> {/* Flag logic handled by parent or passed in? Assuming US for now or update later */}
                                    {order.phone}
                                </div>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(order.phone); alert('Copied!'); }}
                                    className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-stone-300 font-bold transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        {/* Metdata Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Price</label>
                                <div className="text-white font-bold">${order.price?.toFixed(2) || '0.00'}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Time Left</label>
                                <div className={`font-mono font-bold ${timeLeft < 60000 ? 'text-red-400' : 'text-white'}`}>
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                        </div>

                        {/* Code Display Area */}
                        <div className="bg-white/5 rounded-xl border border-white/10 p-6 text-center min-h-[120px] flex flex-col items-center justify-center">
                            {order.status === 'completed' && order.code ? (
                                <div className="animate-in fade-in zoom-in duration-300">
                                    <div className="text-xs text-stone-400 mb-2">Verification Code</div>
                                    <div className="text-4xl font-black text-white tracking-widest mb-4 font-mono select-all">
                                        {order.code}
                                    </div>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(order.code!); alert('Code Copied!'); }}
                                        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] hover:underline"
                                    >
                                        <FaCopy /> Copy Code Only
                                    </button>
                                </div>
                            ) : (
                                <div className="text-stone-500 text-sm max-w-[200px]">
                                    {order.status === 'cancelled' ? (
                                        <span className="text-red-400">Order Cancelled</span>
                                    ) : (
                                        "SMS message content will appear here..."
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Tip/Info */}
                        <div className="text-xs text-stone-500 text-center leading-relaxed">
                            We recommend registering a new account with {order.service} due to occasional reports of services not sending codes to pre-existing accounts.
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-white/5 border-t border-white/10 flex gap-3">
                        <button
                            onClick={() => onCancel(order.order_id)}
                            disabled={order.status !== 'pending'}
                            className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-stone-300 hover:text-white hover:bg-white/5 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onReport?.(order.order_id)}
                            className="flex-1 px-4 py-3 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold transition-colors shadow-lg shadow-blue-900/20"
                        >
                            Report Problem
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
