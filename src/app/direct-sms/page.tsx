"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import { MagneticButton } from '../../components/MagneticButton';
import {
    FaGlobe, FaBolt, FaCheckCircle, FaMobileAlt, FaSms, FaUserPlus,
    FaWallet, FaShieldAlt, FaChevronDown, FaUsers,
    FaMoneyBillWave, FaFire, FaTelegramPlane, FaWhatsapp, FaGoogle,
    FaFacebookF, FaInstagram, FaDiscord, FaUber, FaTwitter,
    FaSnapchatGhost, FaTiktok, FaRobot
} from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

export default function DirectSmsPage() {
    const { t } = useLanguage();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const services = [
        { name: "Tinder", price: "$1.50", icon: <FaFire /> },
        { name: "Telegram", price: "$1.50", icon: <FaTelegramPlane /> },
        { name: "WhatsApp", price: "$1.50", icon: <FaWhatsapp /> },
        { name: "Google / Gmail", price: "$1.50", icon: <FaGoogle /> },
        { name: "Facebook", price: "$1.50", icon: <FaFacebookF /> },
        { name: "Instagram", price: "$1.50", icon: <FaInstagram /> },
        { name: "OpenAI / ChatGPT", price: "$1.50", icon: <FaRobot /> },
        { name: "Discord", price: "$1.50", icon: <FaDiscord /> },
        { name: "Uber", price: "$1.50", icon: <FaUber /> },
        { name: "Twitter / X", price: "$1.50", icon: <FaTwitter /> },
        { name: "Snapchat", price: "$0.75", icon: <FaSnapchatGhost /> },
        { name: "TikTok", price: "$1.50", icon: <FaTiktok /> },
    ];

    const faqs = [
        { q: "Is this really Non-VoIP?", a: "Yes. We use real SIM cards from physical devices. This means our numbers work on services that block virtual numbers (VoIP) like Tinder, Telegram, and WhatsApp." },
        { q: "How long does the number work?", a: "These are temporary numbers for one-time verification (OTP). The number is active for 15-20 minutes to receive your code. After that, it is closed for security." },
        { q: "What if the code doesn't arrive?", a: "You don't pay. If the SMS doesn't arrive within the timeout period, the order is automatically cancelled and your credit is refunded instantly to your balance." },
        { q: "Do I need ID Verification?", a: "Never. We value your privacy. No ID, no KYC, no personal details required. Just sign up and pay with Crypto." },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <main className="min-h-screen text-white overflow-x-hidden relative bg-[#050505]">
            <Navbar />

            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[5%] left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse"></div>
            </div>

            {/* Hero / Direct Intent Section - Reduced padding-top to bring it closer to Navbar */}
            <section className="pt-12 pb-16 px-4 relative z-10">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                                <FaMobileAlt /> Direct Carrier SIM Verification
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[0.9] text-white">
                                Premium <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                                    Non-VoIP Numbers
                                </span>
                            </h1>

                            <p className="text-xl text-stone-300 mb-10 leading-relaxed font-light max-w-lg">
                                Access real physical SIM cards for instant app verification. Bypasses all VoIP filters on WhatsApp, Telegram, Tinder, and 500+ other services.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6">
                                <Link href="/register">
                                    <MagneticButton className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center gap-3">
                                        Activate Your SIM Now <span className="text-xl">→</span>
                                    </MagneticButton>
                                </Link>
                            </div>

                            <div className="mt-12 flex items-center gap-8 text-stone-500">
                                <div className="flex flex-col gap-1">
                                    <span className="text-white font-black text-2xl leading-none">100%</span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Physical SIMs</span>
                                </div>
                                <div className="w-px h-8 bg-white/10"></div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-white font-black text-2xl leading-none">Instant</span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold">SMS Delivery</span>
                                </div>
                                <div className="w-px h-8 bg-white/10"></div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-white font-black text-2xl leading-none">$0.50</span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Starting Price</span>
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
                                    alt="Physical SIM SMS Verification"
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
                                            <p className="text-xs font-bold text-white uppercase tracking-widest">Network Mode: Real SIM Online</p>
                                            <p className="text-[10px] text-stone-400">Direct carrier routing enabled via 4G hardware</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Popular Services Section - Direct Parity with Main Page */}
            <section className="py-16 relative z-10 border-t border-white/5 bg-white/[0.01]">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-black mb-4">Supported Platforms</h2>
                        <p className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Guaranteed verification for top global apps</p>
                    </div>
                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                        {services.map((s) => (
                            <motion.div
                                key={s.name}
                                variants={item}
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                className="flex flex-col p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 transition-all cursor-pointer group hover:border-blue-500/30"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl text-stone-400 group-hover:text-blue-400 transition-colors">{s.icon}</span>
                                        <span className="font-semibold text-sm text-stone-200">{s.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-green-400 bg-green-900/20 px-2 py-0.5 rounded">{s.price}</span>
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter text-blue-400">
                                        <FaBolt className="text-[7px]" /> Fast Delivery
                                    </div>
                                    <div className="text-[8px] font-black uppercase tracking-tighter text-stone-500">
                                        Success: <span className="text-green-500">100%</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Comparison Section (Real SIM vs Virtual) */}
            <section className="py-20 relative z-10 border-t border-white/5">
                <div className="container mx-auto px-4 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Real SIM vs <span className="text-stone-500">Virtual</span></h2>
                        <p className="text-stone-400 text-lg max-w-2xl mx-auto font-light">
                            Most apps block Virtual (VoIP) numbers. VoltSMS uses physical SIM cards from real carriers like AT&T, T-Mobile, and Vodafone.
                        </p>
                    </motion.div>

                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="px-8 py-8 text-stone-500 font-bold uppercase tracking-widest text-xs">Features</th>
                                        <th className="px-8 py-8 text-white font-black text-center text-lg">
                                            <span className="text-blue-400">Real SIM</span>
                                            <br /><span className="text-[10px] text-stone-500 font-bold uppercase">(Non-VoIP)</span>
                                        </th>
                                        <th className="px-8 py-8 text-stone-500 font-black text-center text-lg">
                                            Virtual
                                            <br /><span className="text-[10px] text-stone-700 font-bold uppercase">(VoIP)</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { f: "Physical SIM card in a real hardware hub", rs: true, v: false },
                                        { f: "Recognized as a legitimate mobile user", rs: true, v: false },
                                        { f: "Bypasses strict VoIP/Virtual filters", rs: true, v: false },
                                        { f: "Private numbers, not publicly accessible", rs: true, v: false },
                                        { f: "Acceptable for WhatsApp, Telegram, Tinder", rs: true, v: false },
                                        { f: "Works where free numbers fail 100%", rs: true, v: false },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-6 text-stone-300 font-medium text-sm md:text-base">{row.f}</td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex items-center justify-center">
                                                    <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                                                        <FaCheckCircle className="text-green-500 text-xs" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className="text-stone-700 font-bold">—</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 relative z-10 border-t border-white/5 bg-white/[0.02] backdrop-blur-sm">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-5xl font-black mb-4">How it Works</h2>
                        <p className="text-stone-400">Get your verification code in 3 simple steps</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FaUserPlus />,
                                title: "Create Account",
                                desc: "Sign up in seconds. No identity verification or KYC required."
                            },
                            {
                                icon: <FaWallet />,
                                title: "Top Up Balance",
                                desc: "Add funds using Bitcoin, USDT, or other cryptos instantly."
                            },
                            {
                                icon: <FaSms />,
                                title: "Receive Code",
                                desc: "Pick your service and country, then receive your OTP code in sub-30 seconds."
                            }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="relative p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-center group"
                            >
                                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 text-2xl text-white group-hover:scale-110 transition-transform">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-stone-400 leading-relaxed text-sm">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Global Statistics Section */}
            <section className="py-20 relative z-10 border-y border-white/5">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { label: "SMS Delivered", val: "25,400+", icon: <FaSms className="text-blue-400" /> },
                            { label: "Active Users", val: "12,800+", icon: <FaUsers className="text-purple-400" /> },
                            { label: "Countries", val: "184+", icon: <FaGlobe className="text-cyan-400" /> },
                            { label: "Services", val: "1,000+", icon: <FaShieldAlt className="text-green-400" /> },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                    {stat.icon}
                                </div>
                                <div className="text-3xl md:text-4xl font-black mb-1">{stat.val}</div>
                                <div className="text-[10px] text-stone-500 uppercase font-black tracking-widest">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 relative z-10 border-b border-white/5">
                <div className="container mx-auto px-4 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-5xl font-black mb-4">FAQ</h2>
                        <p className="text-stone-400">Helpful information about our SIM verification service</p>
                    </motion.div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => toggleFaq(i)}
                                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                            >
                                <div className="p-6 flex items-center justify-between">
                                    <h3 className="font-bold text-lg">{faq.q}</h3>
                                    <motion.div
                                        animate={{ rotate: openFaq === i ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <FaChevronDown className="text-stone-400" />
                                    </motion.div>
                                </div>
                                <motion.div
                                    initial={false}
                                    animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <p className="px-6 pb-6 text-stone-400 leading-relaxed text-sm">
                                        {faq.a}
                                    </p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Affiliate Program Section */}
            <section className="py-20 relative z-10">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 overflow-hidden relative">
                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
                            <div className="lg:w-1/2">
                                <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-xs uppercase tracking-widest">
                                    Affiliate Program
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                                    Earn while you <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                        Refer Partners
                                    </span>
                                </h2>
                                <p className="text-stone-300 text-lg mb-8 leading-relaxed font-light">
                                    Join our network and earn 10-15% commission on every deposit made by your referrals. Direct rewards, instant tracking.
                                </p>
                                <Link href="/affiliate">
                                    <button className="bg-white text-black font-black px-10 py-4 rounded-full hover:bg-stone-200 transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-white/10">
                                        Join Program Now
                                    </button>
                                </Link>
                            </div>
                            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                                    <FaMoneyBillWave className="text-3xl text-green-400 mb-4" />
                                    <div className="text-xl font-black mb-1">10-15%</div>
                                    <div className="text-[10px] text-stone-500 uppercase tracking-widest">Commission</div>
                                </div>
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                                    <FaUsers className="text-3xl text-blue-400 mb-4" />
                                    <div className="text-xl font-black mb-1">Unlimited</div>
                                    <div className="text-[10px] text-stone-500 uppercase tracking-widest">Referrals</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 relative z-10 text-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="text-4xl md:text-7xl font-black mb-8">
                        Ready to get <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                            Verified Instant?
                        </span>
                    </h2>
                    <Link href="/register">
                        <MagneticButton className="px-20 py-8 bg-blue-600 rounded-full text-2xl font-black hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/20">
                            GET STARTED NOW
                        </MagneticButton>
                    </Link>
                    <div className="mt-10 flex items-center justify-center gap-4 text-stone-500 text-sm font-medium">
                        <div className="flex items-center gap-1"><FaCheckCircle className="text-green-500" /> Physical SIM</div>
                        <div className="flex items-center gap-1"><FaCheckCircle className="text-green-500" /> Non-VoIP</div>
                        <div className="flex items-center gap-1"><FaCheckCircle className="text-green-500" /> Instant SMS</div>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}
