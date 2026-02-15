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
  FaWallet, FaSms, FaUserPlus, FaBitcoin, FaEthereum, FaMonero,
  FaUsers, FaMoneyBillWave
} from 'react-icons/fa';
import { SiTether, SiLitecoin } from 'react-icons/si';

import { OrganizationSchema, WebSiteSchema, FAQSchema } from '../components/JsonLd';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
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

      <OrganizationSchema />
      <WebSiteSchema />
      <FAQSchema
        faqs={[
          {
            question: "Is this really Non-VoIP?",
            answer: "Yes. We use real SIM cards from physical devices. This means our numbers work on services that block virtual numbers (VoIP) like Tinder, Telegram, and WhatsApp."
          },
          {
            question: "How long does the number work?",
            answer: "These are temporary numbers for one-time verification (OTP). The number is active for 15-20 minutes to receive your code. After that, it is closed for security."
          },
          {
            question: "What if the code doesn't arrive?",
            answer: "You don't pay. If the SMS doesn't arrive within the timeout period, the order is automatically cancelled and your credit is refunded instantly to your balance."
          },
          {
            question: "Do I need ID Verification?",
            answer: "Never. We value your privacy. No ID, no KYC, no personal details required. Just sign up and pay with Crypto."
          }
        ]}
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
            {t('hero_title').split('Verifications')[0]} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 animate-gradient-x">
              {t('hero_title').includes('Verifications') ? 'Verifications' : t('hero_title')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xl md:text-2xl text-stone-300 mb-10 leading-relaxed max-w-3xl mx-auto font-light"
          >
            {t('hero_subtitle')}
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
                <span className="text-white font-black text-xl">{t('nav_get_started')}</span>
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

      {/* Comparison Section (Real SIM vs Virtual) */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Real SIM vs <span className="text-stone-500">Virtual</span></h2>
            <p className="text-stone-400 text-lg max-w-2xl mx-auto font-light">
              Most services block Virtual (VoIP) numbers. VoltSMS uses physical SIM cards tied to real carriers like AT&T, T-Mobile, and Vodafone.
            </p>
          </motion.div>

          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-8 py-8 text-stone-500 font-bold uppercase tracking-widest text-xs">Features</th>
                  <th className="px-8 py-8 text-white font-black text-center text-lg">
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Real SIM</span>
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
                  { f: "Acceptable for WhatsApp, Google, Tinder", rs: true, v: false },
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
            <h2 className="text-3xl md:text-5xl font-black mb-4">{t('landing_how_title')}</h2>
            <p className="text-stone-400">Get verified in 3 simple steps</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaUserPlus />,
                title: t('step_1_title'),
                desc: t('step_1_desc')
              },
              {
                icon: <FaWallet />,
                title: t('step_2_title'),
                desc: "Top up your balance instantly using Bitcoin, Litecoin, USDT, or Monero."
              },
              {
                icon: <FaSms />,
                title: t('step_3_title'),
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

      {/* Global Statistics Section */}
      <section className="py-20 relative z-10 border-y border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-4">High Quality for Affordable Price</h2>
            <p className="text-stone-400 max-w-2xl mx-auto uppercase tracking-widest text-[10px] font-bold">
              Only quality and paid numbers with the highest success rates on the market today.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { label: "Received SMS", val: "25,400+", icon: <FaSms className="text-purple-400" /> },
              { label: "Users Registered", val: "12,800+", icon: <FaUsers className="text-blue-400" /> },
              { label: "Available Countries", val: "184+", icon: <FaBolt className="text-yellow-400" /> },
              { label: "Available Services", val: "1,000+", icon: <FaShieldAlt className="text-green-400" /> },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col items-center text-center group hover:border-white/20 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-black mb-2 tracking-tighter">{stat.val}</div>
                <div className="text-[10px] text-stone-500 uppercase font-black tracking-widest">{stat.label}</div>
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
              <h3 className="text-xl font-bold mb-2">{t('feat_non_voip_title')}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                {t('feat_non_voip_desc')}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-purple-500/30 transition-colors"
            >
              <FaBolt className="text-4xl text-purple-500 mb-6" />
              <h3 className="text-xl font-bold mb-2">{t('feat_instant_title')}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                {t('feat_instant_desc')}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-blue-500/30 transition-colors"
            >
              <FaUserSecret className="text-4xl text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-2">{t('feat_secure_title')}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                {t('feat_secure_desc')}
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
            <h2 className="text-3xl md:text-5xl font-black mb-4">{t('landing_faq_title')}</h2>
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

      {/* Affiliate Program Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-gradient-to-br from-purple-900/60 to-blue-900/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 overflow-hidden relative group">
            <div className="absolute top-0 right-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none group-hover:bg-purple-500/30 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none group-hover:bg-blue-500/30 transition-colors duration-700" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
              <div className="lg:w-1/2">
                <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-purple-400 font-black text-xs uppercase tracking-widest">
                  {t('aff_partner_title')}
                </div>
                <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                  {t('aff_earn_up_to')} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                    {t('aff_commission')}
                  </span>
                </h2>
                <p className="text-stone-300 text-lg mb-8 leading-relaxed font-light">
                  {t('aff_desc')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <FaCheckCircle className="text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium">Automatic Payouts</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <FaCheckCircle className="text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium">Lifetime Revenue</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <FaCheckCircle className="text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium">Transparent Tracking</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <FaCheckCircle className="text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium">High Conversion Rate</span>
                  </div>
                </div>
                <Link href="/affiliate">
                  <button className="bg-white text-black font-black px-8 py-3.5 rounded-full hover:bg-stone-200 transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-white/10">
                    {t('aff_cta')}
                  </button>
                </Link>
              </div>

              <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                  <FaUsers className="text-3xl text-purple-400 mb-4" />
                  <div className="text-xl font-black mb-1">Lifetime</div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-widest">Tracking</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                  <FaMoneyBillWave className="text-3xl text-emerald-400 mb-4" />
                  <div className="text-xl font-black mb-1">10-15%</div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-widest">Commission</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                  <FaBolt className="text-3xl text-blue-400 mb-4" />
                  <div className="text-xl font-black mb-1">Instant</div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-widest">Activation</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                  <FaShieldAlt className="text-3xl text-red-400 mb-4" />
                  <div className="text-xl font-black mb-1">Secure</div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-widest">Payments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            {t('cta_start_title')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-500">
              {t('cta_verifications_today')}
            </span>
          </h2>
          <Link href="/register">
            <button className="bg-white text-black font-black text-xl px-16 py-6 rounded-full hover:bg-stone-200 transition-transform hover:scale-105 active:scale-95 shadow-2xl shadow-white/20">
              {t('cta_create_account')}
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
