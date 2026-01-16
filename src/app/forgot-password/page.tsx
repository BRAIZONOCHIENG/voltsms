"use client";
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMsg('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            setMsg("Password reset link sent! Check your email.");
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
                        <h2 className="text-3xl font-bold mb-2 text-foreground dark:text-stone-100">Reset Password</h2>
                        <p className="text-stone-500 dark:text-stone-400">Enter your email to receive a reset link.</p>
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
                            <label className="block text-xs font-semibold mb-2 text-white/80 uppercase tracking-wide">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-foreground dark:bg-stone-100 text-white dark:text-stone-900 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-stone-500">
                        Remembered it? <Link href="/login" className="text-primary dark:text-primary-light font-bold hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
