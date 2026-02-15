"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

const ACTIVITIES = [
    { name: "John", location: "London, UK", service: "WhatsApp", time: "34s ago" },
    { name: "Satoshi", location: "Tokyo, JP", service: "Telegram", time: "1m ago" },
    { name: "Elena", location: "Madrid, ES", service: "OpenAI", time: "12s ago" },
    { name: "Michael", location: "New York, US", service: "Google", time: "45s ago" },
    { name: "Chloe", location: "Paris, FR", service: "Tinder", time: "2m ago" },
    { name: "David", location: "Toronto, CA", service: "Discord", time: "18s ago" },
    { name: "Ahmed", location: "Dubai, AE", service: "WhatsApp", time: "5s ago" },
    { name: "Luca", location: "Milan, IT", service: "Telegram", time: "24s ago" },
    { name: "Sarah", location: "Sydney, AU", service: "Amazon", time: "1m ago" },
    { name: "Emma", location: "Berlin, DE", service: "Instagram", time: "30s ago" },
];

export default function LiveActivityTicker() {
    const [index, setIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Initial delay
        const timer = setTimeout(() => setIsVisible(true), 3000);

        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % ACTIVITIES.length);
                setIsVisible(true);
            }, 1000); // Wait for exit animation
        }, 8000); // Show each for 8 seconds

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    const activity = ACTIVITIES[index];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: -50, y: 50 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                    className="fixed bottom-6 left-6 z-[100] hidden md:flex items-center gap-3 p-3 pr-5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] pointer-events-none"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center border border-white/5 relative">
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                        <FaCheckCircle className="text-green-400" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-none mb-1">
                            Recent Verification
                        </p>
                        <p className="text-xs text-white font-medium">
                            <span className="font-bold">{activity.name}</span> in {activity.location}
                        </p>
                        <p className="text-[11px] text-stone-300">
                            Verified <span className="text-purple-400 font-bold">{activity.service}</span> <span className="text-stone-500">• {activity.time}</span>
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
