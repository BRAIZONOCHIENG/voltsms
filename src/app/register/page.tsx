"use client";
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import GoogleSignInButton from '../../components/GoogleSignInButton';

import { supabase } from '../../lib/supabaseClient';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [refCode, setRefCode] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Capture ref from URL
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            setRefCode(ref);
            // Optional: Store in cookie for persistence if they browse around
            document.cookie = `ref=${ref}; path=/; max-age=2592000`; // 30 days
        } else {
            // Check cookie
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ref=`);
            if (parts.length === 2) setRefCode(parts.pop()?.split(';').shift() || '');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const getCookie = (name: string) => {
            if (typeof document === 'undefined') return undefined;
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        };
        const getFingerprint = () => {
            if (typeof window === 'undefined') return '';
            const signals = [
                navigator.userAgent,
                navigator.language,
                new Date().getTimezoneOffset().toString(),
                window.screen.width + 'x' + window.screen.height,
                window.screen.colorDepth.toString(),
                navigator.hardwareConcurrency?.toString() || '0'
            ];
            return btoa(signals.join('|'));
        };

        const fingerprint = getFingerprint();
        const clientIp = getCookie('volt_ip');

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login?verified=true`,
                    data: {
                        ref_code: refCode || null,
                        ip: clientIp || null,
                        fingerprint: fingerprint || null,
                    }
                },
            });

            if (error) {
                // Handle "User already registered" error
                if (error.message.includes('User already registered') || error.status === 400 || error.status === 422) {
                    setError('Account already exists with this email. Please log in.');
                } else {
                    setError(error.message);
                }
                return;
            }

            // Check if user exists but returned success (Supabase behavior for disabled email enumeration)
            // If identifying data is returned but sessions are null, it often means unverified or existing path
            if (data.user && !data.session) {
                // If the user identity is empty, it might mean they signed up with OAuth before
                if (data.user.identities && data.user.identities.length === 0) {
                    setError('Account already exists. Please log in with Google or your password.');
                    return;
                }
                setRegistrationSuccess(true);
            } else if (data.user && data.session) {
                // Auto-login success case (shouldn't happen with email confirm enabled, but safely handled)
                setRegistrationSuccess(true);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        }
    };

    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    // Timer effect


    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setResendLoading(true);
        setResendMessage('');

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/login?verified=true`,
                }
            });

            if (error) throw error;

            setResendMessage('Verification email resent successfully!');
            setResendCooldown(60); // 60 seconds cooldown
        } catch (err: any) {
            setResendMessage(err.message || 'Failed to resend email.');
        } finally {
            setResendLoading(false);
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

                        <div className="bg-white/5 rounded-xl p-4 text-sm text-white/50 border border-white/10 mb-6">
                            <p>Link expires in 24 hours.</p>
                            <p>Once activated, you will be redirected to the login page.</p>
                        </div>

                        {resendMessage && (
                            <p className={`text-sm mb-4 ${resendMessage.includes('Failed') ? 'text-red-300' : 'text-green-300'}`}>
                                {resendMessage}
                            </p>
                        )}

                        <button
                            onClick={handleResend}
                            disabled={resendCooldown > 0 || resendLoading}
                            className="text-sm font-semibold text-[var(--color-primary)] hover:text-white transition-colors disabled:text-white/30 disabled:cursor-not-allowed"
                        >
                            {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend Email (${resendCooldown}s)` : 'Resend Verification Email'}
                        </button>

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
                        <GoogleSignInButton />

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-white/40 text-sm">Or with email</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

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

                        <div className="pt-2">
                            <label className="block text-xs font-semibold mb-2 text-white/50 uppercase tracking-wide">Referral Code (Optional)</label>
                            <input
                                type="text"
                                value={refCode}
                                onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                                className="w-full bg-black/10 border border-white/5 rounded-xl px-4 py-3 text-white/80 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all placeholder:text-white/20 text-sm font-mono"
                                placeholder="E3GJ7J0N"
                            />
                            {refCode && (
                                <p className="text-[10px] text-purple-400 mt-1 font-bold">
                                    ✨ Bonus Active: 10% Extra on every deposit!
                                </p>
                            )}
                        </div>




                        <button type="submit" className="w-full bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold text-lg hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 transition-all">
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
