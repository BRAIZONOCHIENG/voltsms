"use client";
import { useEffect, useState } from 'react';
import { FaUser, FaDollarSign, FaBan, FaCheck, FaSearch, FaHistory } from 'react-icons/fa';

interface User {
    id: string;
    email: string;
    balance: number;
    is_banned: boolean;
    created_at: string;
    registration_ip?: string;
    referral_code?: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateBalance = async (userId: string, newBalance: string) => {
        const val = parseFloat(newBalance);
        if (isNaN(val)) return;

        setUpdating(userId);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, balance: val })
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, balance: val } : u));
                // Show temporary success state
                const row = document.getElementById(`balance-input-${userId}`);
                if (row) {
                    row.classList.add('border-green-500');
                    setTimeout(() => row.classList.remove('border-green-500'), 2000);
                }
            }
        } catch (error) {
            console.error('Failed to update balance', error);
        } finally {
            setUpdating(null);
        }
    };

    const handleToggleBan = async (userId: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'unban' : 'ban'} this user?`)) return;

        setUpdating(userId);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                body: JSON.stringify({ userId, is_banned: !currentStatus })
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, is_banned: !currentStatus } : u));
            }
        } catch (error) {
            console.error('Failed to toggle ban', error);
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(u =>
        (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (u.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.registration_ip || '').includes(searchTerm)
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">User Management</h1>
                    <p className="text-stone-400">View and manage all registered users.</p>
                </div>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                    <input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-all w-64"
                    />
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-stone-400">
                    <thead className="text-xs uppercase bg-white/5 text-stone-300">
                        <tr>
                            <th className="px-6 py-4">User Details</th>
                            <th className="px-6 py-4">Account Identifiers</th>
                            <th className="px-6 py-4">Balance</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center">Loading users...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center">No users found.</td></tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className={`hover:bg-white/5 transition-colors ${user.is_banned ? 'opacity-50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                                                <FaUser size={16} />
                                            </div>
                                            <div>
                                                <div className="font-black text-white text-base select-all" title="User Email">{user.email}</div>
                                                <div className="text-[10px] text-stone-500 font-medium uppercase tracking-tighter">Registered User</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1.5">
                                            <div className="text-[10px] text-stone-400 font-mono flex items-center gap-2">
                                                <span className="text-stone-600 bg-black/20 px-1 rounded">ID:</span>
                                                <span className="select-all opacity-70 group-hover:opacity-100 transition-opacity">{user.id}</span>
                                            </div>
                                            <div className="text-[10px] text-stone-400 font-mono flex items-center gap-2">
                                                <span className="text-stone-600 bg-black/20 px-1 rounded">IP:</span>
                                                <span className="select-all opacity-70 border-b border-white/5">{user.registration_ip}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="relative group">
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500 text-xs">$</span>
                                                <input
                                                    id={`balance-input-${user.id}`}
                                                    type="number"
                                                    step="0.01"
                                                    defaultValue={user.balance}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleUpdateBalance(user.id, e.currentTarget.value);
                                                    }}
                                                    className="w-24 bg-black/40 border border-white/10 rounded-lg pl-6 pr-2 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-all font-mono"
                                                />
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    const input = document.getElementById(`balance-input-${user.id}`) as HTMLInputElement;
                                                    handleUpdateBalance(user.id, input.value);
                                                }}
                                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-all"
                                                title="Save Balance"
                                            >
                                                <FaCheck size={12} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-stone-300 font-medium">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${user.is_banned ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                            {user.is_banned ? 'Banned' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleBan(user.id, user.is_banned)}
                                                disabled={updating === user.id}
                                                className={`p-2 rounded-lg transition-all ${user.is_banned ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                                                title={user.is_banned ? 'Unban User' : 'Ban User'}
                                            >
                                                {user.is_banned ? <FaCheck size={14} /> : <FaBan size={14} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
