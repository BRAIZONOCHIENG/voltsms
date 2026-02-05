"use client";
import { useState, Suspense } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Turnstile } from '@marsidev/react-turnstile';
import { supabase } from '../../lib/supabaseClient';

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const verified = searchParams.get('verified');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!captchaToken) {
            setError('Please complete the captcha verification.');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            if (data.session) {
                router.push('/dashboard');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 flex justify-center py-12">
            <div className="bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 text-white">Welcome Back</h2>
                    <p className="text-white/70">Login to your dashboard.</p>
                </div>

                {verified && (
                    <div className="bg-green-500/20 text-green-200 p-4 rounded-xl mb-6 text-sm border border-green-500/30 font-medium text-center">
                        Email verified successfully! Please log in.
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/20 text-red-200 p-4 rounded-xl mb-6 text-sm border border-red-500/30">
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
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all placeholder:text-white/30"
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-2 text-white/80 uppercase tracking-wide">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all placeholder:text-white/30 pr-10"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Turnstile Captcha */}


                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-sm text-white/60 hover:text-white transition-colors">
                            Forgot Password?
                        </Link>
                    </div>
                    <button type="submit" className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-stone-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-white/60">
                    Don't have an account? <Link href="/register" className="text-white font-bold hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <main className="min-h-screen bg-transparent pb-20 text-white">
            <Navbar />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <LoginContent />
            </Suspense>
        </main>
    );
}
