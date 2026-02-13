"use client";
import Link from 'next/link';
import { FaBan, FaEnvelope } from 'react-icons/fa';
import { MagneticButton } from '@/components/MagneticButton';

export default function BannedPage() {
    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
                        <FaBan size={48} className="text-red-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tight">Access Restricted</h1>
                    <p className="text-stone-400 leading-relaxed">
                        Your account has been suspended for violating our terms of service or detected suspicious activity.
                    </p>
                </div>

                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                    <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-stone-400">
                            <FaEnvelope />
                        </div>
                        <div>
                            <div className="text-sm font-bold">Need help?</div>
                            <div className="text-xs text-stone-500">Contact support on Telegram to appeal this decision.</div>
                        </div>
                    </div>

                    <a href="https://t.me/voltsms_support" target="_blank" rel="noopener noreferrer" className="block">
                        <MagneticButton className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-stone-200 transition-colors">
                            Contact Support
                        </MagneticButton>
                    </a>
                </div>

                <Link href="/" className="inline-block pt-4">
                    <span className="text-sm text-stone-500 hover:text-white transition-colors">
                        ← Return to Homepage
                    </span>
                </Link>
            </div>
        </main>
    );
}
