"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        const ALLOWED_EMAILS = [
            'braizon23@gmail.com',
            'ochiengoloo4097@gmail.com',
            'yeti9702@gmail.com'
        ];
        const ADMIN_PASSWORD = '40209702Br@';

        if (ALLOWED_EMAILS.includes(username) && password === ADMIN_PASSWORD) {
            localStorage.setItem('admin_token', 'true');
            router.push('/admin');
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-2xl border border-white/10"
            >
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Access</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Email</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[var(--color-primary)] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[var(--color-primary)] outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Login
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
