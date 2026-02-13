"use client";
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { MagneticButton } from '../../components/MagneticButton';

import { FaTelegramPlane, FaClock, FaCheckCircle, FaUserShield } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

export default function Contact() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-transparent pb-20 text-white">
            <Navbar />
            <div className="container mx-auto px-6 max-w-4xl py-12">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-10 shadow-xl">
                    <h1 className="text-3xl md:text-4xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
                        {t('contact_title')}
                    </h1>

                    <div className="prose prose-invert max-w-none text-white/80 leading-relaxed text-sm md:text-base mb-10">
                        <p>
                            Our support team is dedicated to ensuring your experience is seamless. For the fastest response times, we provide all support directly through Telegram.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Telegram Support Card */}
                        <div className="bg-gradient-to-b from-blue-500/20 to-transparent rounded-2xl p-8 border border-blue-500/30 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                                <FaTelegramPlane className="text-white text-4xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Telegram Support</h3>
                            <p className="text-blue-200/60 text-sm mb-8">Get instant help from our dedicated support team 24/7.</p>

                            <a
                                href="https://t.me/voltsms_support"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-blue-500 text-white font-black py-4 rounded-xl hover:bg-blue-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3"
                            >
                                <FaTelegramPlane /> @voltsms_support
                            </a>
                        </div>

                        {/* Why Telegram? */}
                        <div className="space-y-4">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                                    <FaClock className="text-green-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Response Time</h4>
                                    <p className="text-xs text-white/40">Average reply in under 15 minutes.</p>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                                    <FaCheckCircle className="text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Real-time Fixes</h4>
                                    <p className="text-xs text-white/40">Resolve deposit or verification issues instantly.</p>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                                    <FaUserShield className="text-cyan-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Verified Support</h4>
                                    <p className="text-xs text-white/40">Official VoltSMS account with security protocols.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 border-t border-white/10 pt-10 text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-4">Business Operating Hours</h3>
                        <p className="text-white/60 text-sm">
                            Support is active 24/7, 365 days a year for urgent verification issues.<br />
                            Administrative inquiries: Monday - Friday, 9:00 AM - 6:00 PM EST.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
