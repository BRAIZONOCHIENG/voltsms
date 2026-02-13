"use client";
import { useState, useEffect } from 'react';
import { FaUsers, FaDollarSign, FaCopy, FaCheck, FaInfoCircle, FaExternalLinkAlt, FaRocket, FaMoneyBillWave, FaChartLine, FaShieldAlt, FaCog, FaCreditCard, FaPaypal } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function AffiliateDashboard({ userId }: { userId: string }) {
    const [profile, setProfile] = useState<any>(null);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [commissions, setCommissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'stats' | 'settings'>('stats');

    // Settings state
    const [payoutMethod, setPayoutMethod] = useState<'paypal' | 'crypto'>('crypto');
    const [payoutFrequency, setPayoutFrequency] = useState<'bi-weekly' | 'monthly'>('bi-weekly');
    const [paypalEmail, setPaypalEmail] = useState('');
    const [cryptoAddress, setCryptoAddress] = useState('');
    const [cryptoCurrency, setCryptoCurrency] = useState<'USDT' | 'USDC' | 'BNB'>('USDT');
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    useEffect(() => {
        async function fetchAffiliateData() {
            if (!userId) return;

            // 1. Fetch Profile
            const { data: profileData } = await supabase
                .from('affiliate_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();
            setProfile(profileData);

            if (profileData) {
                setPayoutMethod(profileData.payout_method || 'crypto');
                setPayoutFrequency(profileData.payout_frequency || 'bi-weekly');
                setPaypalEmail(profileData.paypal_email || '');
                setCryptoAddress(profileData.crypto_address || '');
                setCryptoCurrency(profileData.crypto_currency || 'USDT');

                // 2. Fetch Referrals count
                const { data: refData } = await supabase
                    .from('affiliate_referrals')
                    .select('id, created_at, referee_id')
                    .eq('referrer_id', userId)
                    .order('created_at', { ascending: false });
                setReferrals(refData || []);

                // 3. Fetch Commissions
                const { data: commData } = await supabase
                    .from('affiliate_commissions')
                    .select('*')
                    .eq('referrer_id', userId)
                    .order('created_at', { ascending: false });
                setCommissions(commData || []);
            }
            setLoading(false);
        }
        fetchAffiliateData();
    }, [userId]);

    const handleSaveSettings = async () => {
        setSaving(true);
        setSaveStatus(null);
        try {
            const { error } = await supabase
                .from('affiliate_profiles')
                .update({
                    payout_method: payoutMethod,
                    payout_frequency: payoutFrequency,
                    paypal_email: paypalEmail,
                    crypto_address: cryptoAddress,
                    crypto_currency: cryptoCurrency,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) throw error;
            setSaveStatus({ type: 'success', msg: 'Settings updated successfully!' });
        } catch (err: any) {
            setSaveStatus({ type: 'error', msg: err.message || 'Failed to update settings' });
        } finally {
            setSaving(false);
        }
    };

    const copyLink = () => {
        if (!profile) return;
        const link = `${window.location.origin}?ref=${profile.referral_code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="p-8 text-center text-stone-500">Loading affiliate data...</div>;

    if (!profile) {
        return (
            <div className="p-12 text-center bg-white/[0.02] rounded-2xl border border-white/5">
                <FaUsers className="text-5xl text-stone-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Join the Affiliate Program</h3>
                <p className="text-stone-400 mb-6 max-w-sm mx-auto text-sm">Earn 15% lifetime commission on every user you refer to VoltSMS. Direct PayPal or Crypto payouts.</p>
                <Link href="/affiliate" className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20">
                    Learn More & Join
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            {/* Tab Switcher */}
            <div className="flex gap-4 border-b border-white/10 mb-6">
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`pb-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'stats' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-stone-500 hover:text-white'}`}
                >
                    Stats & History
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`pb-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-stone-500 hover:text-white'}`}
                >
                    Payout Settings
                </button>
            </div>

            {activeTab === 'stats' ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-stone-500 text-xs font-bold uppercase tracking-widest">Referrals</span>
                                <FaUsers className="text-purple-500" />
                            </div>
                            <div className="text-3xl font-black">{referrals.length}</div>
                            <div className="text-xs text-stone-500 mt-1">Directly registered users</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-stone-500 text-xs font-bold uppercase tracking-widest">Total Earned</span>
                                <FaDollarSign className="text-green-500" />
                            </div>
                            <div className="text-3xl font-black">${profile.total_earned.toFixed(2)}</div>
                            <div className="text-xs text-stone-500 mt-1">Lifetime commissions</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-stone-500 text-xs font-bold uppercase tracking-widest">Available</span>
                                <FaRocket className="text-blue-500" />
                            </div>
                            <div className="text-3xl font-black">${(profile.total_earned - profile.total_withdrawn).toFixed(2)}</div>
                            <div className="text-xs text-stone-500 mt-1">Next payout {profile.payout_frequency}</div>
                        </div>
                    </div>

                    {/* Referral Link Card */}
                    <div className="bg-gradient-to-r from-purple-900/20 to-transparent border border-purple-500/20 p-6 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            <span className="text-sm font-bold text-purple-400">Your Referral link</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-purple-300 overflow-hidden text-ellipsis whitespace-nowrap">
                                {window.location.origin}?ref={profile.referral_code}
                            </div>
                            <button
                                onClick={copyLink}
                                className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-200 transition-colors"
                            >
                                {copied ? <FaCheck /> : <FaCopy />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Commissions List */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                            <h4 className="font-bold text-sm">Recent Commissions</h4>
                            <span className="text-xs text-stone-500">15% Lifetime Cut</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-stone-600 font-bold uppercase text-[10px] bg-white/[0.01]">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Referral ID</th>
                                        <th className="px-6 py-3">Earnings</th>
                                        <th className="px-6 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {commissions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-stone-700 italic">No commissions earned yet.</td>
                                        </tr>
                                    ) : (
                                        commissions.map((c: any) => (
                                            <tr key={c.id} className="hover:bg-white/[0.01]">
                                                <td className="px-6 py-4 text-stone-400 whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-mono text-stone-500 text-xs">...{c.referee_id.slice(-8)}</td>
                                                <td className="px-6 py-4 font-bold text-green-400">${c.amount_usd.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${c.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                                                            c.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-500'
                                                        }`}>
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
                </>
            ) : (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <FaCog className="text-purple-500" /> Payout Preferences
                    </h3>

                    <div className="space-y-6">
                        {/* Frequency Selection */}
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Payout Frequency</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPayoutFrequency('bi-weekly')}
                                    className={`p-4 rounded-xl border transition-all text-left ${payoutFrequency === 'bi-weekly' ? 'bg-purple-500/10 border-purple-500 text-purple-300' : 'bg-black/40 border-white/10 text-stone-400 hover:border-white/20'}`}
                                >
                                    <div className="font-bold mb-1">Bi-Weekly</div>
                                    <div className="text-[10px] opacity-60 uppercase">Paid every 2nd Monday</div>
                                </button>
                                <button
                                    onClick={() => setPayoutFrequency('monthly')}
                                    className={`p-4 rounded-xl border transition-all text-left ${payoutFrequency === 'monthly' ? 'bg-purple-500/10 border-purple-500 text-purple-300' : 'bg-black/40 border-white/10 text-stone-400 hover:border-white/20'}`}
                                >
                                    <div className="font-bold mb-1">Monthly</div>
                                    <div className="text-[10px] opacity-60 uppercase">Paid 1st of every month</div>
                                </button>
                            </div>
                        </div>

                        {/* Method Selection */}
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Payout Method</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPayoutMethod('paypal')}
                                    className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${payoutMethod === 'paypal' ? 'bg-blue-500/10 border-blue-500 text-blue-300' : 'bg-black/40 border-white/10 text-stone-400 hover:border-white/20'}`}
                                >
                                    <FaPaypal className="text-xl" />
                                    <span className="font-bold">PayPal</span>
                                </button>
                                <button
                                    onClick={() => setPayoutMethod('crypto')}
                                    className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${payoutMethod === 'crypto' ? 'bg-orange-500/10 border-orange-500 text-orange-300' : 'bg-black/40 border-white/10 text-stone-400 hover:border-white/20'}`}
                                >
                                    <FaCreditCard className="text-xl" />
                                    <span className="font-bold">Crypto (BEP20)</span>
                                </button>
                            </div>
                        </div>

                        {/* Conditional Inputs */}
                        {payoutMethod === 'paypal' ? (
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">PayPal Email Address</label>
                                <input
                                    type="email"
                                    value={paypalEmail}
                                    onChange={(e) => setPaypalEmail(e.target.value)}
                                    placeholder="your-paypal@email.com"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">Select Currency (BEP20)</label>
                                    <div className="flex gap-2">
                                        {(['USDT', 'USDC', 'BNB'] as const).map((curr) => (
                                            <button
                                                key={curr}
                                                onClick={() => setCryptoCurrency(curr)}
                                                className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${cryptoCurrency === curr ? 'bg-white text-black border-white' : 'border-white/10 text-stone-500 hover:border-white/30'}`}
                                            >
                                                {curr}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">BEP20 Wallet Address</label>
                                    <input
                                        type="text"
                                        value={cryptoAddress}
                                        onChange={(e) => setCryptoAddress(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    />
                                    <p className="text-[10px] text-stone-600 italic">Only Binance Smart Chain (BSC) network supported.</p>
                                </div>
                            </div>
                        )}

                        {saveStatus && (
                            <div className={`p-3 rounded-lg text-xs font-bold text-center ${saveStatus.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {saveStatus.msg}
                            </div>
                        )}

                        <button
                            onClick={handleSaveSettings}
                            disabled={saving}
                            className="w-full bg-white text-black font-black py-4 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                        >
                            {saving ? 'Updating...' : 'Save Payout Preferences'}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 flex gap-3 items-start">
                <FaInfoCircle className="text-blue-500 mt-1" />
                <div className="text-xs text-stone-500 leading-relaxed">
                    <p className="font-bold text-white mb-1">Affiliate Guidelines</p>
                    Commissions are generated instantly when your referee deposits. Payouts are manually audited based on your selected frequency. Minimum payout: $50. No self-referrals allowed.
                </div>
            </div>
        </div>
    );
}
