"use client";
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { Turnstile } from '@marsidev/react-turnstile';
import { supabase } from '../../lib/supabaseClient';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!acceptedTerms) {
            setError('You must accept the Terms of Service and Privacy Policy to register.');
            return;
        }

        if (!captchaToken) {
            setError('Please complete the captcha verification.');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login?verified=true`,
                    captchaToken: captchaToken,
                },
            });

            if (error) {
                setError(error.message);
                return;
            }

            // User registered, potentially auto-confirmed if disabled in Supabase, 
            // but we show the check email screen regardless to force the flow.
            if (data.user) {
                setRegistrationSuccess(true);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        }
    };

    if (registrationSuccess) {
        return (
            <main className="min-h-screen bg-transparent pb-20 text-white">
                <Navbar />
                <div className="container mx-auto px-6 flex justify-center py-12">
                    <div className="bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl p-10 w-full max-w-md shadow-2xl text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-white">Check Your Inbox</h2>
                        <p className="text-white/80 mb-8 leading-relaxed">
                            We've sent a verification link to <span className="font-bold text-white">{email}</span>.
                            Please click the link in the email to activate your account.
                        </p>
                        <div className="bg-white/5 rounded-xl p-4 text-sm text-white/50 border border-white/10">
                            <p>Once activated, you will be redirected to the login page.</p>
                        </div>
                        <p className="mt-8 text-sm text-white/40">
                            Didn't receive it? Check your spam folder.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-transparent pb-20 text-white">
            <Navbar />
            <div className="container mx-auto px-6 flex justify-center py-12">
                <div className="bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2 text-white">Create Account</h2>
                        <p className="text-white/70">Sign up to get started.</p>
                    </div>

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

                        <div className="flex items-start gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-sm text-white/80 cursor-pointer select-none">
                                I agree to the <Link href="/terms" className="text-purple-300 hover:text-white underline transition-colors" target="_blank">Terms of Service</Link> and <Link href="/privacy" className="text-purple-300 hover:text-white underline transition-colors" target="_blank">Privacy Policy</Link>
                            </label>
                        </div>

                        {/* Turnstile Captcha */}
                        {/* Turnstile Captcha */}
                        <div className="flex justify-center py-2 min-h-[70px] border border-dashed border-white/20 rounded-lg my-4 bg-white/5 relative">
                            {/* Debug Text - Remove after fix */}
                            <span className="absolute top-0 left-0 text-[8px] text-white/20 p-1">Widget Container</span>

                            <Turnstile
                                siteKey="0x4AAAAAACYEgj6eKX_XteKh"
                                onSuccess={(token) => {
                                    console.log("Turnstile Success:", token);
                                    setCaptchaToken(token);
                                }}
                                onError={(err) => {
                                    console.error("Turnstile Error:", err);
                                    alert("Turnstile Error: Check console for details.");
                                }}
                                options={{ theme: 'dark' }}
                            />
                        </div>

                        <button type="submit" className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-stone-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                            Start Now
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-white/60">
                        Already have an account? <Link href="/login" className="text-white font-bold hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
