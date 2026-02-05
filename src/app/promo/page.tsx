"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MagneticButton } from '../../components/MagneticButton';
import {
    FaFire, FaTelegramPlane, FaWhatsapp, FaGoogle, FaFacebookF, FaShieldAlt,
    FaBolt, FaUserSecret, FaCheckCircle, FaStar
} from 'react-icons/fa';

export default function PromoPage() {
    const services = [
        { name: "Tinder", price: "$1.25", icon: <FaFire /> },
        { name: "Telegram", price: "$1.50", icon: <FaTelegramPlane /> },
        { name: "WhatsApp", price: "$1.50", icon: <FaWhatsapp /> },
        { name: "Google", price: "$1.25", icon: <FaGoogle /> },
        { name: "Facebook", price: "$1.00", icon: <FaFacebookF /> },
    ];

    return (
        <main className="min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-purple-500/30">

            {/* Simplified Header */}
            <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
                <div className="font-black text-2xl tracking-tighter">
                    VOLT<span className="text-purple-500">SMS</span>
                </div>
                <Link href="/login" className="text-sm font-bold text-stone-400 hover:text-white transition-colors">
                    Log In
                </Link>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />

                <div className="container mx-auto text-center max-w-4xl relative z-10">

                    {/* Trust Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 mb-8"
                    >
                        <div className="flex gap-1"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                        <span className="text-sm font-bold uppercase tracking-wide">Trusted by 10,000+ Users</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none"
                    >
                        Real SIM Verification <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-stone-500">
                            That Actually Works.
                        </span>
                    </motion.h1>

                    <p className="text-xl text-stone-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Stop getting banned with VoIP numbers. Get <b>Non-VoIP, Real SIM</b> numbers for Tinder, Telegram, and WhatsApp instantly.
                    </p>

                    <Link href="/register">
                        <MagneticButton className="px-10 py-6 bg-white text-black rounded-xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                            Get Your Number Now
                        </MagneticButton>
                    </Link>

                    <p className="mt-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                        <FaCheckCircle className="inline mb-0.5 mr-1 text-green-500" /> Instant Delivery • Crypto Accepted • No ID Required
                    </p>

                </div>
            </section>

            {/* Pricing Table - High Impact */}
            <section className="py-16 bg-white/[0.02] border-y border-white/5">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {services.map((s, i) => (
                            <motion.div
                                key={s.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center hover:bg-white/10 transition-colors"
                            >
                                <div className="text-3xl text-stone-400 mb-2 flex justify-center">{s.icon}</div>
                                <div className="font-bold text-white mb-1">{s.name}</div>
                                <div className="text-green-400 font-mono font-bold">{s.price}</div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="text-center mt-8 text-stone-500 text-sm">
                        + over 500 other services supported.
                    </div>
                </div>
            </section>

            {/* Value Props */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-6xl grid md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                        <FaShieldAlt className="text-4xl text-purple-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">100% Non-VoIP</h3>
                        <p className="text-stone-400 text-sm">We use physical SIM cards. Bypass VoIP blocks on Tinder and Telegram easily.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                        <FaBolt className="text-4xl text-yellow-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Instant Code</h3>
                        <p className="text-stone-400 text-sm">Automated system. Receive your SMS code within seconds of purchase.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                        <FaUserSecret className="text-4xl text-blue-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Anonymous</h3>
                        <p className="text-stone-400 text-sm">No KYC. No ID. Sign up with email and pay with Crypto.</p>
                    </div>
                </div>
            </section>

            {/* Sticky Bottom CTA for Mobile */}
            <div className="fixed bottom-0 w-full p-4 bg-black/80 backdrop-blur-lg border-t border-white/10 z-40 md:hidden">
                <Link href="/register">
                    <button className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg ring-1 ring-white/20">
                        Start Verifying
                    </button>
                </Link>
            </div>

        </main>
    );
}
