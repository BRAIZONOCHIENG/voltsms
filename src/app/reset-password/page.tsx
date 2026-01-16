"use client";
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Ideally, check for session or hash fragment here if needed.
        // Supabase usually handles the session set from the link automatically.
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // If no session, they might have clicked a bad link or it expired.
                // setError("Invalid or expired session. Please request a new link.");
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMsg('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) throw error;

            setMsg("Password updated successfully! Redirecting...");
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-transparent pb-20 text-white">
            <Navbar />
            <div className="container mx-auto px-6 flex justify-center py-12">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2 text-foreground dark:text-stone-100">Set New Password</h2>
                        <p className="text-stone-500 dark:text-stone-400">Enter your new secure password.</p>
                    </div>

                    {msg && (
                        <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-sm border border-green-100 font-medium text-center">
                            {msg}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold mb-2 text-white/80 uppercase tracking-wide">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-foreground dark:bg-stone-100 text-white dark:text-stone-900 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
