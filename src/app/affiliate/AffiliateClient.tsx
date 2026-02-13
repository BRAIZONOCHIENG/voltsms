"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMoneyBillWave,
  FaUsers,
  FaChartLine,
  FaRocket,
  FaShieldAlt,
  FaCopy,
  FaCheck,
  FaDollarSign,
  FaClock,
  FaCog,
  FaPaypal,
  FaCreditCard,
  FaCalendarAlt,
  FaInfoCircle,
  FaHistory,
} from "react-icons/fa";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function AffiliateClient() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [affiliateProfile, setAffiliateProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [activeTab, setActiveTab] = useState<"stats" | "settings">("stats");
  const router = useRouter();

  // Stats state
  const [referrals, setReferrals] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  // Settings state
  const [payoutMethod, setPayoutMethod] = useState<"paypal" | "crypto">(
    "crypto",
  );
  const [payoutFrequency, setPayoutFrequency] = useState<
    "bi-weekly" | "monthly"
  >("bi-weekly");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [cryptoCurrency, setCryptoCurrency] = useState<"USDT" | "USDC" | "BNB">(
    "USDT",
  );
  const [customCode, setCustomCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // Check if already an affiliate
        const { data: profile } = await supabase
          .from("affiliate_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          setAffiliateProfile(profile);
          setPayoutMethod(profile.payout_method || "crypto");
          setPayoutFrequency(profile.payout_frequency || "bi-weekly");
          setPaypalEmail(profile.paypal_email || "");
          setCryptoAddress(profile.crypto_address || "");
          setCryptoCurrency(profile.crypto_currency || "USDT");
          setCustomCode(profile.custom_code || "");

          // Fetch additional data
          const [refData, commData, payoutData] = await Promise.all([
            supabase
              .from("affiliate_referrals")
              .select("id, created_at, referee_id")
              .eq("referrer_id", user.id)
              .order("created_at", { ascending: false }),
            supabase
              .from("affiliate_commissions")
              .select("*")
              .eq("referrer_id", user.id)
              .order("created_at", { ascending: false }),
            supabase
              .from("affiliate_payouts")
              .select("*")
              .eq("affiliate_id", profile.id)
              .order("created_at", { ascending: false }),
          ]);
          setReferrals(refData.data || []);
          setCommissions(commData.data || []);
          setPayouts(payoutData.data || []);
        }
      }
      setLoading(false);
    }
    checkUser();
  }, []);

  const handleJoin = async () => {
    if (!user) {
      router.push("/login?next=/affiliate");
      return;
    }
    if (!acceptedRules) return;

    const getFingerprint = () => {
      if (typeof window === "undefined") return "";
      const signals = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset().toString(),
        window.screen.width + "x" + window.screen.height,
        window.screen.colorDepth.toString(),
        navigator.hardwareConcurrency?.toString() || "0",
      ];
      return btoa(signals.join("|"));
    };

    setJoining(true);
    try {
      const response = await fetch("/api/affiliate/join", {
        method: "POST",
        body: JSON.stringify({ fingerprint: getFingerprint() }),
      });
      const data = await response.json();
      if (data.success) {
        setAffiliateProfile(data.profile);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(
          data.error + (data.details ? ": " + data.details : "") ||
          "Failed to join program",
        );
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setJoining(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      const updatePayload: any = {
        payout_method: payoutMethod,
        payout_frequency: payoutFrequency,
        paypal_email: paypalEmail,
        crypto_address: cryptoAddress,
        crypto_currency: cryptoCurrency,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("affiliate_profiles")
        .update(updatePayload)
        .eq("user_id", user.id);

      if (error) throw error;
      setAffiliateProfile((prev: any) => ({ ...prev, ...updatePayload }));
      setSaveStatus({ type: "success", msg: "Settings updated successfully!" });
    } catch (err: any) {
      setSaveStatus({
        type: "error",
        msg: err.message || "Failed to update settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClaimCustomCode = async () => {
    if (!customCode) return;
    setClaiming(true);
    setClaimStatus(null);
    try {
      const code = customCode.toUpperCase().replace(/\s/g, "");
      const { error } = await supabase
        .from("affiliate_profiles")
        .update({ custom_code: code })
        .eq("user_id", user.id);

      if (error) {
        if (error.code === "23505") {
          throw new Error("This referral code is already taken.");
        }
        throw error;
      }

      setAffiliateProfile((prev: any) => ({ ...prev, custom_code: code }));
      setClaimStatus({ type: "success", msg: "Code claimed successfully!" });
    } catch (err: any) {
      setClaimStatus({
        type: "error",
        msg: err.message || "Failed to claim code",
      });
    } finally {
      setClaiming(false);
    }
  };

  const copyLink = () => {
    const code = customCode || affiliateProfile.custom_code || affiliateProfile.referral_code;
    const link = `${window.location.origin}?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-black to-black pointer-events-none" />

        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold uppercase tracking-widest mb-6"
          >
            Partner with VoltSMS
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tight"
          >
            Earn{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              15% Lifetime
            </span>{" "}
            <br />
            Commission on Every User.
          </motion.h1>

          <p className="text-xl text-stone-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the fastest growing Non-VoIP verification platform. Recommend
            VoltSMS to your community and earn 15% for life, while your friends get a 10% bonus on every deposit!
          </p>

          {!affiliateProfile ? (
            <div className="max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Start Earning Today</h3>

              <div className="space-y-4 mb-8 text-left">
                <div className="flex gap-3 items-start">
                  <FaCheck className="text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-stone-300 text-sm">
                    15% of every deposit made by your referrals.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <FaCheck className="text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-stone-300 text-sm">
                    Win-Win: Your friends get a 10% bonus on every deposit.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <FaCheck className="text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-stone-300 text-sm">
                    Payouts via PayPal or Crypto (BEP20).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6 p-4 bg-black/40 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="rules"
                  checked={acceptedRules}
                  onChange={(e) => setAcceptedRules(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-transparent text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <label
                  htmlFor="rules"
                  className="text-xs text-stone-400 cursor-pointer text-left leading-tight"
                >
                  I agree to the Affiliate Program terms. I will not self-refer
                  or use spam methods to promote VoltSMS.
                </label>
              </div>

              <button
                onClick={handleJoin}
                disabled={joining || !acceptedRules}
                className="w-full py-4 bg-white text-black font-black text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/10"
              >
                {joining
                  ? "Setting up..."
                  : user
                    ? "Start Earning Now"
                    : "Login to Start"}
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Referral Link Card */}
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/10 backdrop-blur-xl border border-purple-500/30 p-8 rounded-3xl shadow-2xl text-left">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Your Referral Link</h3>
                  <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest">
                    Active
                  </div>
                </div>

                <div className="flex gap-2 mb-0">
                  <div className="flex-1 p-4 bg-black/60 rounded-xl border border-white/10 font-mono text-purple-300 select-all overflow-hidden text-ellipsis whitespace-nowrap">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}?ref=${customCode || affiliateProfile.custom_code || affiliateProfile.referral_code}`
                      : ""}
                  </div>
                  <button
                    onClick={copyLink}
                    className="px-6 bg-white text-black rounded-xl font-bold flex items-center gap-2 hover:bg-stone-200 transition-colors"
                  >
                    {copied ? <FaCheck /> : <FaCopy />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* Vanity Code Box - Relocated */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                        Branded Vanity Code (e.g. YOUTUBE)
                      </label>
                      <input
                        type="text"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                        placeholder="ENTER YOUR CODE"
                      />
                    </div>
                    <button
                      onClick={handleClaimCustomCode}
                      disabled={claiming || !customCode || customCode === affiliateProfile.custom_code}
                      className="px-8 py-4 bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-purple-500 transition-all disabled:opacity-30 flex items-center gap-2"
                    >
                      {claiming ? "Checking..." : (customCode === affiliateProfile.custom_code && customCode) ? <><FaCheck /> Active</> : "Claim Code"}
                    </button>
                  </div>
                  {claimStatus && (
                    <p className={`text-[10px] mt-2 font-bold uppercase tracking-tight ${claimStatus.type === "success" ? "text-green-400" : "text-red-400"}`}>
                      {claimStatus.msg}
                    </p>
                  )}
                  <p className="text-[10px] text-stone-600 mt-2 italic font-medium">
                    * This will replace your system generated link. Must be unique.
                  </p>
                </div>
              </div>

              {/* Consolidated Stats & Settings Section */}
              <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="flex gap-8 px-8 border-b border-white/10 bg-white/[0.02]">
                  <button
                    onClick={() => setActiveTab("stats")}
                    className={`py-6 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === "stats" ? "text-purple-400" : "text-stone-500 hover:text-white"}`}
                  >
                    Stats & History
                    {activeTab === "stats" && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-t-full"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`py-6 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === "settings" ? "text-purple-400" : "text-stone-500 hover:text-white"}`}
                  >
                    Payout Settings
                    {activeTab === "settings" && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-t-full"
                      />
                    )}
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === "stats" ? (
                    <div className="space-y-6">
                      {/* Top Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl text-left">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-stone-500 text-xs font-bold uppercase tracking-widest">
                              Referrals
                            </span>
                            <FaUsers className="text-purple-500" />
                          </div>
                          <div className="text-3xl font-black">
                            {referrals.length}
                          </div>
                        </div>
                        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl text-left">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-stone-500 text-xs font-bold uppercase tracking-widest">
                              Total Earned
                            </span>
                            <FaDollarSign className="text-green-500" />
                          </div>
                          <div className="text-3xl font-black">
                            ${affiliateProfile.total_earned.toFixed(2)}
                          </div>
                        </div>
                        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl text-left">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-stone-500 text-xs font-bold uppercase tracking-widest">
                              Available for Withdrawal
                            </span>
                            <FaRocket className="text-blue-500" />
                          </div>
                          <div className="text-3xl font-black">
                            $
                            {commissions
                              .filter((c) => {
                                const holdTime = 7 * 24 * 60 * 60 * 1000;
                                const isMatured =
                                  new Date().getTime() -
                                  new Date(c.created_at).getTime() >
                                  holdTime;
                                return c.status === "approved" && isMatured;
                              })
                              .reduce((acc, c) => acc + Number(c.amount_usd), 0) -
                              (affiliateProfile.total_withdrawn || 0)}
                          </div>
                          <p className="text-[10px] text-stone-500 mt-2 uppercase font-bold">
                            Matured funds only (7-day hold)
                          </p>
                        </div>
                      </div>


                      <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl text-left flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-400">
                          <FaRocket size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-stone-200 mb-1">
                            Payout Policy & Safety Hold
                          </h4>
                          <p className="text-xs text-stone-500 leading-relaxed">
                            A minimum payout threshold of{" "}
                            <span className="text-purple-400 font-bold">
                              $20.00
                            </span>{" "}
                            applies. To prevent fraudulent activity, all
                            commissions are subject to a{" "}
                            <span className="text-stone-300">7-day</span>{" "}
                            safety hold before becoming available for
                            withdrawal.
                          </p>
                        </div>
                      </div>

                      {/* Commissions Table */}
                      <div className="border border-white/5 bg-black/20 rounded-2xl overflow-hidden">
                        <div className="p-4 bg-white/5 border-b border-white/5">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                            <FaClock className="text-stone-600" /> Recent
                            Commissions
                          </h4>
                        </div>
                        <div className="overflow-x-auto text-left">
                          <table className="w-full text-sm">
                            <thead className="bg-white/5 text-[10px] uppercase font-bold text-stone-500">
                              <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Referee</th>
                                <th className="px-6 py-4">Earnings</th>
                                <th className="px-6 py-4 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-stone-300">
                              {commissions.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={4}
                                    className="px-6 py-12 text-center italic text-stone-700"
                                  >
                                    No commissions yet...
                                  </td>
                                </tr>
                              ) : (
                                commissions.map((c: any) => (
                                  <tr
                                    key={c.id}
                                    className="hover:bg-white/[0.01]"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {new Date(
                                        c.created_at,
                                      ).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">
                                      ...{c.referee_id.slice(-8)}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-green-400">
                                      ${c.amount_usd.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <span
                                        className={`px-2 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-widest ${c.status === "paid"
                                          ? "bg-green-500/10 text-green-400"
                                          : c.status === "rejected"
                                            ? "bg-red-500/10 text-red-400"
                                            : "bg-yellow-500/10 text-yellow-500"
                                          }`}
                                      >
                                        {c.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Payout History Table */}
                      <div className="border border-white/5 bg-black/20 rounded-2xl overflow-hidden mt-8 shadow-2xl">
                        <div className="p-4 bg-white/5 border-b border-white/5">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                            <FaHistory className="text-stone-600" /> Payout
                            History
                          </h4>
                        </div>
                        <div className="overflow-x-auto text-left">
                          <table className="w-full text-sm">
                            <thead className="bg-white/5 text-[10px] uppercase font-bold text-stone-500">
                              <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-stone-300">
                              {payouts.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={4}
                                    className="px-6 py-12 text-center italic text-stone-700"
                                  >
                                    No payouts yet...
                                  </td>
                                </tr>
                              ) : (
                                payouts.map((p: any) => (
                                  <tr
                                    key={p.id}
                                    className="hover:bg-white/[0.01]"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {new Date(
                                        p.created_at,
                                      ).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 opacity-70 text-xs text-stone-400">
                                      <div className="flex items-center gap-2">
                                        {p.payout_method === "paypal" ? (
                                          <FaPaypal className="text-blue-400" />
                                        ) : (
                                          <FaCreditCard className="text-orange-400" />
                                        )}
                                        <span className="truncate max-w-[150px]">
                                          {p.payout_method === "paypal"
                                            ? p.payout_details
                                            : `BEP20 Address (...${p.payout_details.slice(-6)})`}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white">
                                      ${Number(p.amount_usd).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <span className="px-2 py-1 rounded-[4px] bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                        {p.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto space-y-6 text-left">
                      <div className="space-y-6">
                        {/* Frequency Card */}
                        <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FaCalendarAlt className="text-purple-400" /> Payout Frequency
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(["bi-weekly", "monthly"] as const).map((freq) => (
                              <button
                                key={freq}
                                onClick={() => setPayoutFrequency(freq)}
                                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${payoutFrequency === freq ? "bg-purple-500/10 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/5" : "bg-black/40 border-white/5 text-stone-500 hover:border-white/20"}`}
                              >
                                <div className="font-bold capitalize flex items-center justify-between">
                                  {freq.replace("-", " ")}
                                  {payoutFrequency === freq && <FaCheck className="text-purple-400 text-xs" />}
                                </div>
                                <div className="text-[10px] opacity-60 uppercase mt-1">
                                  {freq === "bi-weekly"
                                    ? "1st and 15th of month"
                                    : "1st of every month"}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>



                        {/* PayPal Method Card */}
                        <div className={`p-6 rounded-2xl border transition-all ${payoutMethod === "paypal" ? "bg-blue-500/5 border-blue-500/30" : "bg-white/[0.02] border-white/10"}`}>
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payoutMethod === "paypal" ? "bg-blue-500/20 text-blue-400" : "bg-stone-500/10 text-stone-500"}`}>
                                <FaPaypal size={20} />
                              </div>
                              <div>
                                <h4 className="font-bold text-stone-200">PayPal Payouts</h4>
                                <p className="text-[10px] text-stone-500 uppercase font-bold tracking-tight">Direct USD Transfer</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setPayoutMethod("paypal")}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${payoutMethod === "paypal" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-white/5 text-stone-500 hover:text-white"}`}
                            >
                              {payoutMethod === "paypal" ? "Preferred" : "Set as Preferred"}
                            </button>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                              PayPal Email Address
                            </label>
                            <input
                              type="email"
                              value={paypalEmail}
                              onChange={(e) => setPaypalEmail(e.target.value)}
                              className="w-full bg-black/60 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
                              placeholder="your-paypal@email.com"
                            />
                          </div>
                        </div>

                        {/* Crypto Method Card */}
                        <div className={`p-6 rounded-2xl border transition-all ${payoutMethod === "crypto" ? "bg-orange-500/5 border-orange-500/30" : "bg-white/[0.02] border-white/10"}`}>
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payoutMethod === "crypto" ? "bg-orange-500/20 text-orange-400" : "bg-stone-500/10 text-stone-500"}`}>
                                <FaCreditCard size={20} />
                              </div>
                              <div>
                                <h4 className="font-bold text-stone-200">Crypto Payouts</h4>
                                <p className="text-[10px] text-stone-500 uppercase font-bold tracking-tight">BEP20 Network (BSC)</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setPayoutMethod("crypto")}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${payoutMethod === "crypto" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-white/5 text-stone-500 hover:text-white"}`}
                            >
                              {payoutMethod === "crypto" ? "Preferred" : "Set as Preferred"}
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                              {(["USDT", "USDC", "BNB"] as const).map((curr) => (
                                <button
                                  key={curr}
                                  onClick={() => setCryptoCurrency(curr)}
                                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${cryptoCurrency === curr ? "bg-white text-black shadow-lg" : "text-stone-500 hover:text-white"}`}
                                >
                                  {curr}
                                </button>
                              ))}
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">
                                BEP20 Wallet Address
                              </label>
                              <input
                                type="text"
                                value={cryptoAddress}
                                onChange={(e) => setCryptoAddress(e.target.value)}
                                className="w-full bg-black/60 border border-white/5 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                                placeholder="0x..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {saveStatus && (
                        <div
                          className={`p-4 rounded-xl text-xs font-bold text-center ${saveStatus.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                        >
                          {saveStatus.msg}
                        </div>
                      )}

                      <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="w-full py-4 bg-white text-black font-black rounded-xl hover:scale-[1.01] transition-all disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save Preferences"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl font-extrabold text-center mb-16">
            Why partner with us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <FaMoneyBillWave className="text-4xl text-green-500 mb-4" />
              <h3 className="text-xl font-black mb-2">Lifetime Cut</h3>
              <p className="text-stone-400 leading-relaxed">
                We don't just pay for the first deposit. You get 15% of every
                single top-up your referral makes, forever.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <FaShieldAlt className="text-4xl text-blue-500 mb-4" />
              <h3 className="text-xl font-black mb-2">Non-VoIP Advantage</h3>
              <p className="text-stone-400 leading-relaxed">
                Generic virtual numbers are dying. Users want real SIMs.
                Converting traffic is 10x easier with our quality.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <FaChartLine className="text-4xl text-purple-500 mb-4" />
              <h3 className="text-xl font-black mb-2">Transparent Tracking</h3>
              <p className="text-stone-400 leading-relaxed">
                Detailed dashboard showing every click, signup, and commission
                in real-time. No hidden deductions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <FaRocket className="text-4xl text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-8">Program Guidelines</h2>
          <div className="text-left bg-white/5 p-8 rounded-3xl border border-white/10 space-y-4 text-stone-400">
            <p className="flex items-start gap-3">
              <span className="text-green-500 font-bold">•</span>
              <span>
                Minimum payout is <b>$20</b>. Payouts are manually audited and
                sent via your selected method.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-blue-500 font-bold">•</span>
              <span>
                <b>Bi-Weekly:</b> Paid every two weeks on Monday.{" "}
                <b>Monthly:</b> Paid on the 1st of every month.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-orange-500 font-bold">•</span>
              <span>
                Supported methods: PayPal (USD) and Crypto BEP20 (USDT, USDC, or
                BNB).
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-red-500 font-bold">•</span>
              <span>
                Multiple accounts and self-referring is strictly prohibited and
                will lead to an immediate ban.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-red-500 font-bold">•</span>
              <span>
                No spam methods (email spam, social media spam) or misleading
                ads allowed.
              </span>
            </p>
          </div>
        </div>
      </section>
    </main >
  );
}
