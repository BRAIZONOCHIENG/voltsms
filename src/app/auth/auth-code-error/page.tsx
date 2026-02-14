"use client";
import Link from "next/link";
import Navbar from "../../../components/Navbar";

export default function AuthCodeError() {
    return (
        <main className="min-h-screen bg-[#121212] text-white">
            <Navbar />
            <div className="container mx-auto px-6 flex justify-center py-20">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 w-full max-w-md shadow-2xl text-center">
                    <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-purple-500/20">
                        <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-black mb-4 bg-gradient-to-r from-white to-stone-400 bg-clip-text text-transparent">
                        Activation Link Used
                    </h2>

                    <p className="text-stone-400 mb-8 leading-relaxed">
                        Your account has either <span className="text-white font-bold">already been activated</span> or the activation link has expired.
                    </p>

                    <div className="space-y-4">
                        <Link
                            href="/login"
                            className="block w-full bg-[var(--color-primary)] hover:brightness-110 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-900/20 active:scale-95"
                        >
                            Back to Login
                        </Link>

                        <p className="text-xs text-stone-500">
                            Try logging in with your email and password. If you still can't access your account, please contact support.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
