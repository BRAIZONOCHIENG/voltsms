"use client";
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { motion } from 'framer-motion';
import { MagneticButton } from '../components/MagneticButton';

import { FaFire, FaTelegramPlane, FaWhatsapp, FaGoogle, FaFacebookF, FaInstagram, FaDiscord, FaUber, FaTwitter, FaSnapchatGhost, FaTiktok, FaRobot, FaWallet, FaShieldAlt, FaBolt, FaUserSecret, FaUndo, FaBitcoin, FaEthereum, FaPaypal, FaCreditCard, FaMobileAlt, FaCheckCircle } from 'react-icons/fa';
import { SiLitecoin, SiTether } from 'react-icons/si';

export default function Home() {
  const services = [
    { name: "Tinder", price: "$0.69", icon: <FaFire /> },
    { name: "Telegram", price: "$1.51", icon: <FaTelegramPlane /> },
    { name: "WhatsApp", price: "$1.87", icon: <FaWhatsapp /> },
    { name: "Google / Gmail", price: "$0.85", icon: <FaGoogle /> },
    { name: "Facebook", price: "$1.15", icon: <FaFacebookF /> },
    { name: "Instagram", price: "$0.85", icon: <FaInstagram /> },
    { name: "OpenAI / ChatGPT", price: "$0.60", icon: <FaRobot /> },
    { name: "Discord", price: "$0.50", icon: <FaDiscord /> },
    { name: "Uber", price: "$0.55", icon: <FaUber /> },
    { name: "Twitter / X", price: "$0.60", icon: <FaTwitter /> },
    { name: "Snapchat", price: "$0.57", icon: <FaSnapchatGhost /> },
    { name: "TikTok", price: "$0.60", icon: <FaTiktok /> },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main className="min-h-screen text-white overflow-x-hidden relative">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-10 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-6 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#f9f871] font-bold text-sm uppercase tracking-widest shadow-lg">
              🚀 Premium SMS Verification
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}

            className="text-6xl md:text-8xl font-black mb-4 tracking-tighter leading-none drop-shadow-2xl"
          >
            Instant <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#845ec2] via-[#ff6f91] to-[#f9f871]">
              Verification.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}

            className="text-xl md:text-2xl text-stone-300 mb-8 leading-relaxed max-w-3xl mx-auto font-light"
          >
            Skip phone verification on any platform.
            Real non-VoIP numbers from 50+ countries.
            <span className="text-white font-bold block mt-2">Starting at just $0.50.</span>
          </motion.p>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}

            className="flex flex-col sm:flex-row justify-center gap-6 mb-12"
          >
            <Link href="/register" className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#845ec2] to-[#ff9671] rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
              <MagneticButton className="relative px-12 py-5 bg-black rounded-xl leading-none flex items-center divide-x divide-gray-600">
                <span className="flex items-center space-x-5">
                  <span className="text-[#f9f871] font-black text-2xl pr-6">Get Started</span>
                </span>
                <span className="pl-6 text-indigo-400 group-hover:text-gray-100 transition duration-200">It&apos;s Free &rarr;</span>
              </MagneticButton>
            </Link>
          </motion.div>

          {/* High Density Pricing Grid with Staggered Animation */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-left"
          >
            {services.map((s) => (
              <motion.div
                key={s.name}
                variants={item}
                whileHover={{ scale: 1.05, borderColor: '#d65db1' }}
                className="flex items-center justify-between p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/15 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl text-[#ff9671] group-hover:text-[#f9f871] transition-colors">{s.icon}</span>
                  <span className="font-bold text-sm text-stone-200 group-hover:text-white">{s.name}</span>
                </div>
                <span className="font-black text-[#845ec2] bg-white/90 px-2 py-1 rounded text-sm group-hover:bg-[#f9f871] group-hover:text-black transition-colors">{s.price}</span>
              </motion.div>
            ))}
          </motion.div>




          {/* Payment Methods Section */}
          <div className="mt-16 pt-10 border-t border-white/5">
            <p className="text-stone-400 text-sm font-bold uppercase tracking-widest mb-6 text-center">Flexible Payment Options</p>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="flex flex-wrap justify-center gap-4"
            >
              <motion.div variants={item} whileHover={{ scale: 1.1 }} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-white cursor-default">
                <FaPaypal className="text-[#003087] text-xl" /> <span className="font-bold">PayPal</span>
              </motion.div>
              <motion.div variants={item} whileHover={{ scale: 1.1 }} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-white cursor-default">
                <FaCreditCard className="text-[#f9f871] text-xl" /> <span className="font-bold">Cards</span>
              </motion.div>
              <motion.div variants={item} whileHover={{ scale: 1.1 }} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-white cursor-default">
                <FaMobileAlt className="text-[#00D632] text-xl" /> <span className="font-bold">M-Pesa</span>
              </motion.div>

              <div className="hidden sm:block border-r border-white/10 mx-2"></div>

              <motion.div variants={item} whileHover={{ scale: 1.1 }} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-white cursor-default">
                <FaBitcoin className="text-[#f7931a] text-xl" /> <span className="font-bold">BTC</span>
              </motion.div>
              <motion.div variants={item} whileHover={{ scale: 1.1 }} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-white cursor-default">
                <SiLitecoin className="text-[#345d9d] text-xl" /> <span className="font-bold">LTC</span>
              </motion.div>
              <motion.div variants={item} whileHover={{ scale: 1.1 }} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-white cursor-default">
                <FaEthereum className="text-[#627eea] text-xl" /> <span className="font-bold">ETH</span>
              </motion.div>
              <motion.div variants={item} whileHover={{ scale: 1.1 }} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-white cursor-default">
                <SiTether className="text-[#26a17b] text-xl" /> <span className="font-bold">USDT</span>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Rentals Promo Section */}
      <section className="py-20 relative overflow-hidden bg-black/30 border-y border-white/5">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block mb-4 px-4 py-1 rounded-full bg-[#f9f871]/20 border border-[#f9f871] text-[#f9f871] font-bold text-xs uppercase tracking-widest">
                New Feature
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                Long-Term <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#845ec2] to-[#ff9671]">
                  Number Rentals.
                </span>
              </h2>
              <p className="text-xl text-stone-300 mb-8 leading-relaxed">
                Need a number for more than just one code? Rent a private, non-VoIP number for <strong>1 to 90 days</strong>.
                Perfect for banking, long-term accounts, and re-verification.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Unlimited SMS Codes",
                  "Auto-Renew Option",
                  "Real SIM Cards (Non-VoIP)",
                  "Works for All Services"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#845ec2]/20 flex items-center justify-center">
                      <FaCheckCircle className="text-[#845ec2] text-xs" />
                    </div>
                    <span className="text-white font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Link href="/dashboard?tab=rental">
                  <MagneticButton className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-stone-200 transition-colors">
                    Rent Number
                  </MagneticButton>
                </Link>
                <div className="text-left px-4">
                  <span className="block text-xs text-stone-500 uppercase tracking-widest">Starting at</span>
                  <span className="block text-xl font-bold text-white">$1.50 <span className="text-sm text-stone-500 font-normal">/ day</span></span>
                </div>
              </div>
            </motion.div>

            {/* Visual/UI Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative lg:pl-10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#845ec2] to-[#ff9671] rounded-3xl blur-3xl opacity-20 transform translate-x-10"></div>
              <div className="relative bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
                {/* Mock UI for Rental Card */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                  <div>
                    <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Active Rental</div>
                    <div className="text-2xl font-mono font-bold text-white tracking-wider flex items-center gap-3">
                      🇺🇸 +1 (555) 019-2834
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full animate-pulse">
                    Active
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#25D366]"></div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <FaWhatsapp className="text-2xl text-[#25D366]" />
                    </div>
                    <div>
                      <div className="text-xs text-stone-500 flex items-center gap-1">Just now <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span></div>
                      <div className="text-white font-medium">WhatsApp Code: <span className="text-[#845ec2] font-bold text-lg">123-456</span></div>
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center gap-4 opacity-50">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <FaGoogle className="text-xl text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-stone-500">2 hours ago</div>
                      <div className="text-white font-medium">G-482910 is your Google verification code.</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      {/* How It Works Section */}
      <section className="py-10 bg-black/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Start Verifying in 3 Steps</h2>
            <p className="text-white/60">No ID required. Instant access.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] opacity-20 -z-10"></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center"
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#845ec2] to-[#d65db1] rounded-full flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-purple-500/20">1</div>
              <h3 className="text-xl font-bold text-white mb-2">Register</h3>
              <p className="text-white/60 text-sm">Create an account in seconds. We only need a username and password.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center"
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#ff6f91] to-[#ff9671] rounded-full flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-pink-500/20">2</div>
              <h3 className="text-xl font-bold text-white mb-2">Deposit</h3>
              <p className="text-white/60 text-sm">Add funds securely using your preferred cryptocurrency (LTC, BTC, ETH).</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center"
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#ffc75f] to-[#f9f871] rounded-full flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-yellow-500/20">3</div>
              <h3 className="text-xl font-bold text-white mb-2">Verify</h3>
              <p className="text-white/60 text-sm">Select your service and get your number instantly. Receive code & done.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Expanded Features / Trust Section */}
      {/* Expanded Features / Trust Section */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center text-white">
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20">
              <FaBolt className="text-4xl text-[#f9f871] mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-1">Instant</h3>
              <p className="text-xs text-stone-400 uppercase tracking-wide">Delivery (&lt;30s)</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20">
              <FaShieldAlt className="text-4xl text-[#ff6f91] mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-1">Non-VoIP</h3>
              <p className="text-xs text-stone-400 uppercase tracking-wide">Real SIM Cards</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20">
              <FaUserSecret className="text-4xl text-[#845ec2] mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-1">Private</h3>
              <p className="text-xs text-stone-400 uppercase tracking-wide">No ID Required</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20">
              <FaUndo className="text-4xl text-[#ff9671] mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-1">Refunds</h3>
              <p className="text-xs text-stone-400 uppercase tracking-wide">Auto-Refund Policy</p>
            </div>
          </div>
        </div>
      </section >

      {/* FAQ Section */}
      {/* FAQ Section */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-3xl font-bold text-center mb-8 text-white"
          >
            Common Questions
          </motion.h2>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <h3 className="font-bold text-lg mb-2 text-white">Do these numbers work for Tinder?</h3>
              <p className="text-white/70">
                Yes! We use high-quality non-VoIP SIM cards that are verified to work on Tinder, Telegram, and other strict services.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <h3 className="font-bold text-lg mb-2 text-white">How do I deposit funds?</h3>
              <p className="text-white/70">
                We accept <strong>PayPal</strong>, <strong>Credit Cards</strong>, <strong>M-Pesa</strong>, and major Cryptocurrencies (LTC, BTC, ETH, USDT). Deposits are credited instantly.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <h3 className="font-bold text-lg mb-2 text-white">What if the code doesn&apos;t arrive?</h3>
              <p className="text-white/70">
                You will not be charged. Our system checks for the SMS code for 10-15 minutes. If it doesn&apos;t arrive as expected, the order is cancelled and your balance remains 100% untouched.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <h3 className="font-bold text-lg mb-2 text-white">Do I need ID verification?</h3>
              <p className="text-white/70">
                <strong>No.</strong> We value your privacy. You only need an email address to create an account and start receiving SMS.
              </p>
            </motion.div>
          </div>
        </div>
      </section >

    </main >
  );
}
