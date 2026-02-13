"use client";
import { useState, useEffect } from "react";
import {
  FaUsers,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaPaypal,
  FaCreditCard,
  FaCalendarAlt,
  FaCopy,
} from "react-icons/fa";
import { supabase } from "@/lib/supabaseClient";

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Affiliates
      const { data: affs } = await supabase
        .from("affiliate_profiles")
        .select("*")
        .order("total_earned", { ascending: false });
      setAffiliates(affs || []);

      // 2. Fetch Commissions (Pending & Approved)
      const { data: comms } = await supabase
        .from("affiliate_commissions")
        .select("*")
        .in("status", ["pending", "approved"])
        .order("created_at", { ascending: false });
      setCommissions(comms || []);

      setLoading(false);
    };
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("affiliate_commissions")
      .update({ status: "approved" })
      .eq("id", id);
    if (!error) {
      setCommissions(commissions.filter((c) => c.id !== id));
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("affiliate_commissions")
      .update({ status: "rejected" })
      .eq("id", id);
    if (!error) {
      setCommissions(commissions.filter((c) => c.id !== id));
    }
  };

  const handleMarkPaid = async (affiliate: any) => {
    const maturedCommSum = commissions
      .filter((c) => {
        const holdTime = 7 * 24 * 60 * 60 * 1000;
        const isMatured =
          new Date().getTime() - new Date(c.created_at).getTime() > holdTime;
        return (
          c.referrer_id === affiliate.user_id &&
          c.status === "approved" &&
          isMatured
        );
      })
      .reduce((acc, c) => acc + Number(c.amount_usd), 0);

    const amount = maturedCommSum - Number(affiliate.total_withdrawn);
    if (amount <= 0) return;

    if (
      !confirm(
        `Mark $${amount.toFixed(2)} as paid for ${affiliate.referral_code}?`,
      )
    )
      return;

    const method = affiliate.payout_method;
    const details =
      method === "paypal" ? affiliate.paypal_email : affiliate.crypto_address;

    if (!details) {
      alert("Payout details (email/address) not set for this affiliate.");
      return;
    }

    try {
      // 1. Create payout record
      const { error: payoutError } = await supabase
        .from("affiliate_payouts")
        .insert([
          {
            affiliate_id: affiliate.id,
            amount_usd: amount,
            payout_method: method,
            payout_details: details,
            status: "paid",
          },
        ]);

      if (payoutError) throw payoutError;

      // 2. Update total_withdrawn
      const { error: updateError } = await supabase
        .from("affiliate_profiles")
        .update({
          total_withdrawn: Number(affiliate.total_withdrawn) + amount,
        })
        .eq("id", affiliate.id);

      if (updateError) throw updateError;

      // Refresh data
      setAffiliates(
        affiliates.map((a) =>
          a.id === affiliate.id
            ? { ...a, total_withdrawn: Number(a.total_withdrawn) + amount }
            : a,
        ),
      );
      alert("Payout processed successfully!");
    } catch (err: any) {
      alert("Error processing payout: " + err.message);
    }
  };

  if (loading)
    return <div className="text-white p-10">Loading Affiliate Data...</div>;

  const filteredAffiliates = affiliates.filter(
    (a) =>
      a.referral_code.includes(searchTerm.toUpperCase()) ||
      a.user_id.includes(searchTerm) ||
      (a.paypal_email &&
        a.paypal_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.crypto_address &&
        a.crypto_address.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">
            Affiliate Program
          </h1>
          <p className="text-stone-400">
            Manage partners, payouts, and commissions.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-right">
            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest text-right">
              Matured Payouts Due
            </p>
            <p className="text-2xl font-black text-white">
              $
              {affiliates
                .reduce((acc, a) => {
                  const matured = commissions
                    .filter((c) => {
                      const holdTime = 7 * 24 * 60 * 60 * 1000;
                      const isMatured =
                        new Date().getTime() -
                        new Date(c.created_at).getTime() >
                        holdTime;
                      return (
                        c.referrer_id === a.user_id &&
                        c.status === "approved" &&
                        isMatured
                      );
                    })
                    .reduce((sum, c) => sum + Number(c.amount_usd), 0);
                  return acc + Math.max(0, matured - Number(a.total_withdrawn));
                }, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Pending Commissions Table */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FaClock className="text-yellow-500" /> Pending Commissions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-400">
            <thead className="text-xs uppercase bg-white/5 text-stone-300">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Referrer</th>
                <th className="px-6 py-4">Referee</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {commissions.filter(c => c.status === 'pending').length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center italic text-stone-600"
                  >
                    No pending commissions.
                  </td>
                </tr>
              ) : (
                commissions
                  .filter((c) => c.status === "pending")
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        ...{c.referrer_id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        ...{c.referee_id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        ${Number(c.amount_usd).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleApprove(c.id)}
                          className="bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(c.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Affiliate Profiles Table */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FaUsers className="text-purple-500" /> Affiliate Profiles
          </h3>
          <div className="relative w-full md:w-auto">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search code, user, email or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white w-full focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-400">
            <thead className="text-xs uppercase bg-white/5 text-stone-300">
              <tr>
                <th className="px-6 py-4">Partner Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payout Method</th>
                <th className="px-6 py-4">Frequency</th>
                <th className="px-6 py-4">Earnings</th>
                <th className="px-6 py-4 text-right">Payout Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAffiliates.map((a) => (
                <tr key={a.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-black text-purple-400">
                      {a.referral_code}
                    </div>
                    <div className="font-mono text-[10px] text-stone-600">
                      ...{a.user_id.slice(-12)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${a.status === "active" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {a.payout_method === "paypal" ? (
                      <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                        <FaPaypal /> PayPal
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-orange-400 text-xs font-bold">
                        <FaCreditCard /> Crypto ({a.crypto_currency || "USDT"})
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-stone-300 text-xs font-medium">
                      <FaCalendarAlt className="text-stone-500" />
                      {a.payout_frequency === "bi-weekly"
                        ? "Bi-Weekly"
                        : "Monthly"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-bold">
                      ${Number(a.total_earned).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-green-500 font-bold uppercase tracking-tighter mt-1">
                      Matured: $
                      {(
                        commissions
                          .filter((c) => {
                            const holdTime = 7 * 24 * 60 * 60 * 1000;
                            const isMatured =
                              new Date().getTime() -
                              new Date(c.created_at).getTime() >
                              holdTime;
                            return (
                              c.referrer_id === a.user_id &&
                              c.status === "approved" &&
                              isMatured
                            );
                          })
                          .reduce((sum, c) => sum + Number(c.amount_usd), 0) -
                        Number(a.total_withdrawn)
                      ).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Paid: ${Number(a.total_withdrawn).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-2">
                      {a.payout_method === "paypal" ? (
                        <div className="flex items-center gap-2 group">
                          <div className="text-xs text-white">
                            {a.paypal_email || "Not Set"}
                          </div>
                          {a.paypal_email && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(a.paypal_email);
                                alert("Copied!");
                              }}
                              className="text-stone-500 hover:text-white transition-colors p-1"
                              title="Copy Email"
                            >
                              <FaCopy size={10} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <div className="font-mono text-[10px] text-stone-300 ml-auto">
                            {a.crypto_address || "Not Set"}
                          </div>
                          {a.crypto_address && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(a.crypto_address);
                                alert("Copied!");
                              }}
                              className="text-stone-500 hover:text-white transition-colors p-1"
                              title="Copy Address"
                            >
                              <FaCopy size={10} />
                            </button>
                          )}
                        </div>
                      )}
                      {Number(a.total_earned) - Number(a.total_withdrawn) >=
                        20 ? (
                        <button
                          onClick={() => handleMarkPaid(a)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20"
                        >
                          Mark as Paid
                        </button>
                      ) : (
                        <div className="text-[9px] text-stone-600 uppercase font-bold tracking-tighter">
                          Below $20 Threshold
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
