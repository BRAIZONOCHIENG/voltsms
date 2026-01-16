"use client";
import React, { useState, useEffect } from 'react';
import { FaServer, FaGlobeAmericas, FaShoppingCart, FaSpinner, FaCheck, FaCopy, FaWallet } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import DepositSection from '@/components/DepositSection';

// Mock Flags/Countries consistent with SDK (for Free Proxies display)
const COUNTRIES = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' }
];

export default function ProxyStorePage() {
    const [proxies, setProxies] = useState<any[]>([]);
    const [freeProxies, setFreeProxies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'buy' | 'deposit'>('buy');

    // Fetch User's Proxies
    useEffect(() => {
        const fetchProxies = async () => {
            try {
                const res = await fetch('/api/proxies/my-proxies');
                const data = await res.json();
                if (data.success) {
                    setProxies(data.proxies);
                }
            } catch (e) {
                console.error("Failed to fetch proxies", e);
            } finally {
                setLoading(false);
            }
        };
        const fetchFreeProxies = async () => {
            try {
                const res = await fetch('/api/proxies/free');
                const data = await res.json();
                if (data.success) {
                    setFreeProxies(data.proxies);
                }
            } catch (e) {
                console.error("Failed to fetch free proxies", e);
            }
        };
        fetchProxies();
        fetchFreeProxies();

        // Refresh free proxies every 30s
        const val = setInterval(fetchFreeProxies, 30000);
        return () => clearInterval(val);
    }, []);

    // Fetch User Data (Balance & Email)
    const fetchUserData = async () => {
        try {
            const { data: { session } } = await import('@/lib/supabaseClient').then(m => m.supabase.auth.getSession());
            const token = session?.access_token;
            if (!token) return;

            const res = await fetch('/api/balance', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setBalance(data.balance);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchUserData();
        // Also fetch email
        import('@/lib/supabaseClient').then(async ({ supabase }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) setUserEmail(user.email);
        });
    }, []);

    const handleBuy = async () => {
        if (buying) return;
        setBuying(true);
        setMessage(null);
        try {
            // Updated to use the Residential/PacketStream route
            const res = await fetch('/api/proxies/residential/buy', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setMessage('Data Plan purchased successfully!');
                const resP = await fetch('/api/proxies/my-proxies');
                const dP = await resP.json();
                if (dP.success) setProxies(dP.proxies);
                fetchUserData(); // Update balance
            } else {
                setMessage(data.error || 'Purchase failed');
            }
        } catch (e) {
            setMessage('Purchase failed. Please check your balance.');
        } finally {
            setBuying(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // TOGGLE: Set to true to re-enable the Premium Proxies store
    const SHOW_PREMIUM = false;

    return (
        <main className="min-h-screen bg-[#09090b] text-white">
            <Navbar />

            <div className="container mx-auto px-4 py-8">

                {SHOW_PREMIUM && (
                    <>
                        {/* Header Section */}
                        <div className="text-center mb-8">
                            <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">
                                Premium Network
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                Static Residential Proxies
                            </h1>
                            <p className="text-stone-300 text-lg max-w-2xl mx-auto mt-2 font-medium">
                                High-speed residential IPs. Pay only for what you use.
                            </p>

                            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-stone-400">
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                    <FaCheck className="text-green-400" /> 100% Uptime Guarantee
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                    <FaCheck className="text-green-400" /> Global Coverage
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                    <FaCheck className="text-green-400" /> Instant Delivery
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex justify-center mb-10 gap-4">
                            <div className="bg-white/5 p-1 rounded-xl flex gap-2 border border-white/5">
                                <button
                                    onClick={() => setActiveTab('buy')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'buy'
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                        : 'text-stone-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FaServer /> Buy Proxies
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('deposit')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'deposit'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                        : 'text-stone-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FaWallet /> Add Funds
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* -- LEFT: Action Area -- */}
                            <div className="lg:col-span-1">
                                {/* PacketStream Buy Section (Rebranded) */}
                                {activeTab === 'buy' && (
                                    <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl h-fit">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                                                <FaGlobeAmericas className="text-xl" />
                                            </div>
                                            <h2 className="text-xl font-bold">Purchase Plan</h2>
                                        </div>
                                        <div className="p-6 bg-purple-500/5 rounded-2xl border border-purple-500/10 mb-8">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-stone-400">Data Amount</span>
                                                <span className="text-xl font-bold text-white">1 GB</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-stone-400">Validity</span>
                                                <span className="text-white">No Expiry</span>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-lg">
                                                <span className="text-stone-300">Total</span>
                                                <span className="font-bold text-purple-400">$2.00</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleBuy}
                                            disabled={buying}
                                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                                        >
                                            {buying ? <FaSpinner className="animate-spin" /> : <FaShoppingCart />}
                                            Buy 1 GB ($2.00)
                                        </button>
                                        {message && (
                                            <div className={`mt-4 p-4 rounded-xl text-center font-bold text-sm ${message.includes('success') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {message}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Deposit Section */}
                                {activeTab === 'deposit' && (
                                    <DepositSection
                                        userEmail={userEmail}
                                        onDepositSuccess={() => {
                                            fetchUserData(); // Update balance
                                            alert("Funds added successfully!");
                                            setActiveTab('buy');
                                        }}
                                    />
                                )}
                            </div>

                            {/* -- RIGHT: My Proxies -- */}
                            <div className="lg:col-span-2">
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 min-h-[600px]">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                                                <FaServer size={24} />
                                            </div>
                                            <h2 className="text-xl font-bold">My Active Proxies</h2>
                                        </div>
                                        <div className="text-sm font-bold text-stone-500 bg-black/30 px-3 py-1 rounded-full border border-white/5">
                                            {proxies.length} Active
                                        </div>
                                    </div>
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center h-64 text-stone-500">
                                            <FaSpinner className="animate-spin text-3xl mb-4" />
                                            <span>Loading proxies...</span>
                                        </div>
                                    ) : proxies.length > 0 ? (
                                        <div className="grid gap-4">
                                            {proxies.map((proxy) => (
                                                <div key={proxy.id} className="bg-black/20 rounded-xl border border-white/5 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/5 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-xl">
                                                            {proxy.isp_name?.includes('Residential') ? '🌐' : '🔒'}
                                                        </div>
                                                        <div>
                                                            <div className="font-mono text-white text-lg flex items-center gap-2">
                                                                {proxy.ip} <span className="text-stone-500 text-sm">:{proxy.port}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                                                                <span className="flex items-center gap-1">
                                                                    <FaGlobeAmericas /> {proxy.country_code}
                                                                </span>
                                                                <span className="bg-white/10 px-2 py-0.5 rounded text-stone-300">
                                                                    {proxy.isp_name || 'Static Residential'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                                        <div className="flex-1 md:flex-none">
                                                            <div className="text-xs text-stone-500 mb-1">Pass</div>
                                                            <code className="bg-black/40 px-2 py-1 rounded text-stone-300 text-xs block cursor-pointer hover:text-white" title={proxy.password}>
                                                                {proxy.password?.substring(0, 8)}...
                                                            </code>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                onClick={() => copyToClipboard(`${proxy.ip}:${proxy.port}:${proxy.username}:${proxy.password}`)}
                                                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-stone-400 hover:text-white transition-colors"
                                                            >
                                                                <FaCopy />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 text-stone-500">
                                            <p>No active proxies found.</p>
                                            <p className="text-sm mt-2">Purchase one to get started!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Free Proxies Section */}
                <div className="mt-20 border-t border-white/5 pt-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                <FaServer />
                            </div>
                            <h2 className="text-2xl font-bold text-stone-300">Free Shared Datacenter Proxies</h2>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    // Download Logic
                                    const text = freeProxies.map(p => `${p.proxy_address || p.ip}:${p.port}:${p.username}:${p.password}`).join('\n');
                                    const blob = new Blob([text], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'free_proxies.txt';
                                    a.click();
                                }}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-stone-300 border border-white/10 transition-colors flex items-center gap-2"
                            >
                                <FaCopy /> Download List
                            </button>
                        </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-stone-400">
                                <thead className="bg-white/5 text-stone-300 font-bold uppercase text-xs tracking-wider">
                                    <tr>
                                        <th className="p-4 whitespace-nowrap">IP Address</th>
                                        <th className="p-4 whitespace-nowrap">Port</th>
                                        <th className="p-4 whitespace-nowrap">Country / City</th>
                                        <th className="p-4 whitespace-nowrap">Username</th>
                                        <th className="p-4 whitespace-nowrap">Password</th>
                                        <th className="p-4 whitespace-nowrap">Last Checked</th>
                                        <th className="p-4 whitespace-nowrap">Status</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {freeProxies.length > 0 ? (
                                        freeProxies.map((fp, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-mono text-white select-all">{fp.proxy_address || fp.ip}</td>
                                                <td className="p-4 font-mono select-all">{fp.port}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 text-white">
                                                            <span>{COUNTRIES.find(c => c.code === fp.country_code)?.flag || '🌍'}</span>
                                                            <span className="font-bold">{fp.country_code}</span>
                                                        </div>
                                                        <span className="text-xs text-stone-500">{fp.city_name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-xs select-all">{fp.username}</td>
                                                <td className="p-4 font-mono text-xs select-all text-stone-500 hover:text-white transition-colors cursor-pointer" title={fp.password}>
                                                    {fp.password.substring(0, 8)}...
                                                </td>
                                                <td className="p-4 text-xs whitespace-nowrap">
                                                    {fp.last_verification ? new Date(fp.last_verification).toLocaleTimeString() : 'N/A'}
                                                </td>
                                                <td className="p-4">
                                                    {fp.valid ? (
                                                        <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full w-fit">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                            Working
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-400 text-xs">Offline</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => copyToClipboard(`${fp.proxy_address || fp.ip}:${fp.port}:${fp.username}:${fp.password}`)}
                                                        className="text-stone-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                                        title="Copy Full Format"
                                                    >
                                                        <FaCopy />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="p-8 text-center text-stone-600 italic">
                                                No free proxies available at the moment.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
