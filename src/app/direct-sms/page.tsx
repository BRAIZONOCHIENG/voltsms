"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import { MagneticButton } from '../../components/MagneticButton';
import LiveActivityTicker from '../../components/LiveActivityTicker';
import { FaGlobe, FaBolt, FaCheckCircle, FaMobileAlt } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

export default function DirectSmsPage() {
    return (
        <main className="min-h-screen text-white overflow-x-hidden relative bg-[#050505]">
            <Navbar />
            <LiveActivityTicker />

            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse"></div>
            </div>

            {/* Hero / Direct Intent Section */}
            <section className="pt-32 pb-20 px-4 relative z-10">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                                <FaMobileAlt /> Direct Carrier SIM Network
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[0.9] text-white">
                                Global App <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                                    Activation Hub
                                </span>
                            </h1>

                            <p className="text-xl text-stone-300 mb-10 leading-relaxed font-light max-w-lg">
                                Instantly verify any website or app worldwide. Get real-carrier Non-VoIP phone numbers from USA, UK, and 150+ countries. 100% success rate guaranteed.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6">
                                <Link href="/register">
                                    <MagneticButton className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center gap-3">
                                        Get Your Number Now <span className="text-xl">→</span>
                                    </MagneticButton>
                                </Link>
                            </div>

                            <div className="mt-12 flex items-center gap-8 text-stone-500">
                                <div className="flex flex-col gap-1">
                                    <span className="text-white font-black text-2xl leading-none">500+</span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Services Supported</span>
                                </div>
                                <div className="w-px h-8 bg-white/10"></div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-white font-black text-2xl leading-none">Instant</span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Code Delivery</span>
                                </div>
                                <div className="w-px h-8 bg-white/10"></div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-white font-black text-2xl leading-none">Real SIM</span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Connections</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative z-10 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-3xl aspect-[16/9]">
                                <Image
                                    src="/ad-assets/phone-mockup.png"
                                    alt="Direct Activation Utility"
                                    fill
                                    className="object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/20">
                                            <FaCheckCircle className="text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white uppercase tracking-widest">Network: Real-Carrier SIM</p>
                                            <p className="text-[10px] text-stone-400">Direct access to physical hardware verified</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Value Pillars */}
            <section className="py-20 border-y border-white/5 bg-white/[0.02]">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="flex flex-col gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <FaBolt className="text-blue-400 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold">Lightning Fast</h3>
                            <p className="text-stone-400 text-sm leading-relaxed">Receive your OTP codes in seconds. Our automated system routes your request direct to the SIM array.</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                <FaCheckCircle className="text-green-400 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold">100% Success Rate</h3>
                            <p className="text-stone-400 text-sm leading-relaxed">By using real physical SIM cards, we guarantee success on platforms that block virtual/VoIP numbers.</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                <FaGlobe className="text-cyan-400 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold">Worldwide Coverage</h3>
                            <p className="text-stone-400 text-sm leading-relaxed">Choose from over 150 countries. Whether it's USA, UK, or Europe, we've got you covered.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Infrastructure Proof */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl font-black mb-12 uppercase tracking-tight">Direct Carrier Hardware</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative h-64 rounded-3xl overflow-hidden border border-white/10 group">
                            <Image src="/ad-assets/sim-cards.png" alt="Physical SIM Arrays" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-bold uppercase tracking-[0.3em]">Real Physical SIM Infrastructure</span>
                            </div>
                        </div>
                        <div className="relative h-64 rounded-3xl overflow-hidden border border-white/10 group">
                            <Image src="/ad-assets/success-checkmark.png" alt="Verification Success" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-bold uppercase tracking-[0.3em] font-mono">Guaranteed App Activation</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20">
                        <Link href="/register">
                            <div className="inline-block p-[2px] rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600">
                                <MagneticButton className="px-16 py-6 bg-black rounded-[0.9rem] text-2xl font-black hover:bg-transparent transition-colors">
                                    START ACTIVATION NOW
                                </MagneticButton>
                            </div>
                        </Link>
                        <p className="mt-6 text-stone-500 text-xs font-bold uppercase tracking-widest">Instant Setup • No ID Required</p>
                    </div>
                </div>
            </section>

            <footer className="py-10 border-t border-white/5 text-center text-stone-600 text-[10px] uppercase tracking-widest">
                VoltSMS &copy; 2026 • Direct Global Activation Hub • All Rights Reserved
            </footer>
        </main>
    );
}
