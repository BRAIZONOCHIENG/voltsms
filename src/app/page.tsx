"use client";
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { MagneticButton } from '../components/MagneticButton';
import { useState } from 'react';

import {
  FaFire, FaTelegramPlane, FaWhatsapp, FaGoogle, FaFacebookF, FaInstagram,
  FaDiscord, FaUber, FaTwitter, FaSnapchatGhost, FaTiktok, FaRobot,
  FaShieldAlt, FaBolt, FaUserSecret, FaCheckCircle, FaChevronDown,
  FaWallet, FaSms, FaUserPlus, FaBitcoin, FaEthereum, FaMonero
} from 'react-icons/fa';
import { SiTether, SiLitecoin } from 'react-icons/si';

export default function Home() {
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
    { q: "Do you accept Crypto?", a: "Yes, we accept Bitcoin, Litecoin, USDT (Tether), Ethereum, and Monero. Payments are credited automatically after 1 confirmation." },
    { q: "What if the code doesn't arrive?", a: "You don't pay. If the SMS doesn't arrive within the timeout period, the order is automatically cancelled and your credit is refunded instantly to your balance." },
    { q: "Can I use the same number twice?", a: "No. For security and privacy, each number is used once for a single verification code and then discarded. If you need another code, simply buy a new number." },
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

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="min-h-screen text-white overflow-x-hidden relative">
      <Navbar />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "VoltSMS",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "1.50",
              "priceCurrency": "USD"
            },
            "description": "Premium Non-VoIP SMS verification service using Real SIM cards. Bypass OTP verification on Tinder, Telegram, WhatsApp, and more securely.",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "1450"
            }
          })
        }}
      />

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4 relative z-10">
        <div className="container mx-auto text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-6 px-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-stone-300 font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-colors cursor-default">
              ⚡ Premium Non-VoIP Verification
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none"
          >
            Bypass Verification <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 animate-gradient-x">
              Instantly.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xl md:text-2xl text-stone-300 mb-10 leading-relaxed max-w-3xl mx-auto font-light"
          >
            Stop wasting money on fake numbers. <br className="hidden md:block" />
            Get <span className="text-white font-semibold">Real SIM</span> numbers for WhatsApp, Telegram, Tinder & more.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col items-center gap-8 mb-16"
          >
            <Link href="/register" className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-purple-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
              <MagneticButton className="relative px-12 py-5 bg-black rounded-xl border border-white/10 flex items-center justify-center gap-4 group-active:scale-95 transition-all">
                <span className="text-white font-black text-xl">Get Started</span>
                <span className="text-stone-400 group-hover:text-white transition-colors">→</span>
              </MagneticButton>
            </Link>

            {/* Crypto Icons Strip */}
            <div className="flex items-center gap-6 px-6 py-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-stone-400">
              <FaBitcoin className="text-2xl hover:text-[#F7931A] transition-colors" title="Bitcoin" />
              <SiLitecoin className="text-2xl hover:text-[#345D9D] transition-colors" title="Litecoin" />
              <SiTether className="text-2xl hover:text-[#53AE94] transition-colors" title="USDT" />
              <FaEthereum className="text-2xl hover:text-[#627EEA] transition-colors" title="Ethereum" />
              <FaMonero className="text-2xl hover:text-[#FF6600] transition-colors" title="Monero" />
              <span className="text-xs font-bold uppercase tracking-wider ml-2 border-l border-white/10 pl-4">Crypto Accepted</span>
            </div>
          </motion.div>

          {/* High Density Pricing Grid */}
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
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 transition-all cursor-pointer group hover:border-purple-500/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl text-stone-400 group-hover:text-purple-400 transition-colors">{s.icon}</span>
                  <span className="font-semibold text-sm text-stone-200">{s.name}</span>
                </div>
                <span className="text-sm font-bold text-green-400 bg-green-900/20 px-2 py-0.5 rounded">{s.price}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 relative z-10 border-t border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-4">How It Works</h2>
            <p className="text-stone-400">Get verified in 3 simple steps</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaUserPlus />,
                title: "1. Create Account",
                desc: "Sign up anonymously. No ID verification required. Just email and password."
              },
              {
                icon: <FaWallet />,
                title: "2. Deposit Crypto",
                desc: "Top up your balance instantly using Bitcoin, Litecoin, USDT, or Monero."
              },
              {
                icon: <FaSms />,
                title: "3. Get SMS",
                desc: "Select a service, get your number, and receive your verification code instantly."
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-center group"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-2xl text-white group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/10">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-stone-400 leading-relaxed text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-red-500/30 transition-colors"
            >
              <FaShieldAlt className="text-4xl text-red-500 mb-6" />
              <h3 className="text-xl font-bold mb-2">Non-VoIP Guarantee</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Our numbers come from real SIM cards, ensuring the highest success rates for platforms that block VoIP.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-purple-500/30 transition-colors"
            >
              <FaBolt className="text-4xl text-purple-500 mb-6" />
              <h3 className="text-xl font-bold mb-2">Instant Delivery</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Automated system delivers numbers and codes 24/7. No waiting for manual processing.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-blue-500/30 transition-colors"
            >
              <FaUserSecret className="text-4xl text-blue-500 mb-6" />
              <FaUserSecret className="text-4xl text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Protect your personal data. Use our temporary numbers to verify accounts without exposing your primary phone number.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 relative z-10 border-t border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-4">Questions?</h2>
            <p className="text-stone-400">Everything you need to know</p>
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

      {/* Final CTA */}
      <section className="py-24 relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-7xl font-black mb-8">
            Start bypassing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-500">
              verifications today.
            </span>
          </h2>
          <Link href="/register">
            <button className="bg-white text-black font-black text-xl px-16 py-6 rounded-full hover:bg-stone-200 transition-transform hover:scale-105 active:scale-95 shadow-2xl shadow-white/20">
              Create Free Account
            </button>
          </Link>
          <div className="mt-8 flex items-center justify-center gap-2 text-stone-500 text-sm font-medium">
            <FaCheckCircle className="text-green-500" /> No Credit Card Required
            <span className="mx-2">•</span>
            <FaCheckCircle className="text-green-500" /> Instant Access
          </div>
        </motion.div>
      </section>

    </main>
  );
}
