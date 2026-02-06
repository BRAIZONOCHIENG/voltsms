"use client";
import { useEffect, useState } from 'react';
import { FaUser, FaDollarSign, FaFileAlt, FaServer } from 'react-icons/fa';
import { MOCK_SERVICES } from '../dashboard/services';
import { MOCK_POSTS } from '../blog/data';

const StatCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) => (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full -mr-10 -mt-10 pointer-events-none"></div>
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-black text-white">{value}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl text-white">
                {icon}
            </div>
        </div>
        {trend && (
            <div className="flex items-center gap-2 text-xs">
                <span className="text-green-400 bg-green-500/10 px-2 py-1 rounded font-bold">{trend}</span>
                <span className="text-stone-500">vs last month</span>
            </div>
        )}
    </div>
);

export default function AdminDashboard() {
    const [revenue, setRevenue] = useState(0);
    const [activeUsers, setActiveUsers] = useState(0);
    const [revenueTrend, setRevenueTrend] = useState("0%");
    const [userTrend, setUserTrend] = useState("0%");

    // System Health
    const [latency, setLatency] = useState(0);
    const [successRate, setSuccessRate] = useState(0);
    const [smsPoolBalance, setSmsPoolBalance] = useState("0.00");

    // Fetch real stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                const data = await res.json();
                if (data.success) {
                    setRevenue(data.revenue);
                    setActiveUsers(data.activeUsers);
                    setRevenueTrend((data.revenueTrend > 0 ? "+" : "") + data.revenueTrend + "%");
                    setUserTrend((data.userTrend > 0 ? "+" : "") + data.userTrend + "%");
                    setLatency(data.latency);
                    setSuccessRate(data.successRate);
                }

                // Fetch SMSPool Balance
                const smsRes = await fetch('/api/admin/balance');
                const smsData = await smsRes.json();
                if (smsData.balance !== undefined) {
                    setSmsPoolBalance(smsData.balance.toFixed(2));
                }

            } catch (e) {
                console.error("Failed to fetch admin stats", e);
            }
        };

        fetchStats();
        // Poll every 60 seconds
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const activeServicesCount = MOCK_SERVICES.length; // Keep using static list count for now as "offered" services
    const blogPostsCount = MOCK_POSTS.length; // This will need to be updated to fetch from API too if we want real count there.

    const [blogCount, setBlogCount] = useState(0);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/admin/blog').then(res => res.json()).then(data => setBlogCount(data.length));
        fetch('/api/admin/activity').then(res => res.json()).then(data => {
            if (data.success && Array.isArray(data.data)) {
                setRecentOrders(data.data);
            }
        });
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-black text-white mb-2">Dashboard</h1>
                <p className="text-stone-400">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Net Profit (All Time)" value={`$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<FaDollarSign />} trend={revenueTrend} />
                <StatCard title="Active Users" value={activeUsers.toLocaleString()} icon={<FaUser />} trend={userTrend} />
                <StatCard title="SMSPool Balance" value={`$${smsPoolBalance}`} icon={<div className="font-bold text-xs">SMS</div>} />
                <StatCard title="Active Services" value={activeServicesCount.toString()} icon={<FaServer />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-[400px] overflow-auto">
                    <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentOrders.length === 0 ? (
                            <p className="text-stone-500 text-sm">No recent activity found.</p>
                        ) : (
                            recentOrders.map((order: any) => (
                                <div key={order.order_id || order.id} className="flex items-center gap-4 text-sm w-full">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></div>
                                    <span className="text-stone-400 truncate">
                                        User <span className="text-white font-bold">{order.user_id ? order.user_id.substring(0, 8) + '...' : 'Unknown'}</span> purchased <span className="text-white">{order.service || 'Service'}</span>
                                    </span>
                                    <span className="ml-auto text-stone-600 font-mono text-xs whitespace-nowrap">
                                        {new Date(order.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-[400px]">
                    <h3 className="text-lg font-bold text-white mb-6">System Health</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-bold uppercase text-stone-400 mb-2">
                                <span>API Latency</span>
                                <span>{latency}ms</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ease-out ${latency < 100 ? 'bg-green-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(100, Math.max(5, (latency / 200) * 100))}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-stone-500 mt-1">Target: &lt;50ms</p>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold uppercase text-stone-400 mb-2">
                                <span>SMS Success Rate</span>
                                <span>{successRate.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${successRate}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Contact Messages Section */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Contact Messages</h3>
                    <button onClick={() => window.location.reload()} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded transition-colors">Refresh</button>
                </div>

                <MessagesList />
            </div>
        </div>
    );
}

function MessagesList() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/admin/messages');
            const data = await res.json();
            if (data.messages) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            const res = await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessages(messages.filter(m => m.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete message', error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    if (loading) return <div className="text-stone-500 text-sm">Loading messages...</div>;
    if (messages.length === 0) return <div className="text-stone-500 text-sm">No new messages.</div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-400">
                <thead className="text-xs uppercase bg-white/5 text-stone-300">
                    <tr>
                        <th className="px-4 py-3 rounded-l-lg">Date</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Message</th>
                        <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {messages.map((msg) => (
                        <tr key={msg.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                                {new Date(msg.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                                {msg.name}
                            </td>
                            <td className="px-4 py-3 text-stone-300 whitespace-nowrap">
                                {msg.email}
                            </td>
                            <td className="px-4 py-3 max-w-md truncate" title={msg.message}>
                                {msg.message}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button
                                    onClick={() => handleDelete(msg.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors text-xs font-bold"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
