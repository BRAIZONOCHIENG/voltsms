"use client";
import Link from 'next/link';
import NextImage from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagneticButton } from './MagneticButton';
import { Link3D } from './Link3D';

import { supabase } from '../lib/supabaseClient';

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setIsLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        router.push('/login');
    };

    return (
        <nav
            className="sticky top-0 w-full z-50 border-b border-white/10 shadow-sm bg-transparent"
            style={{ backdropFilter: 'blur(64px) saturate(180%)', WebkitBackdropFilter: 'blur(64px) saturate(180%)' }}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link3D href="/" className="group">
                    <span className="flex items-center gap-1">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <NextImage
                                src="/voltsms-logo.png"
                                alt="VoltSMS Logo"
                                width={48}
                                height={48}
                                className="w-10 h-10 object-contain mix-blend-screen drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] group-hover:scale-105 transition-transform"
                            />
                        </div>
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] tracking-tight pt-1">
                            VoltSMS
                        </span>
                    </span>
                </Link3D>

                <div className="flex gap-6 items-center">
                    {isLoggedIn && (
                        <Link3D href="/dashboard" className="text-sm font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity uppercase tracking-wide">
                            Dashboard
                        </Link3D>
                    )}
                    {isLoggedIn && (
                        <Link3D href="/proxies" className="text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors uppercase tracking-wide">
                            Proxies
                        </Link3D>
                    )}
                    {isLoggedIn && (
                        <Link3D href="/dashboard/api" className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wide">
                            API
                        </Link3D>
                    )}
                    <Link3D href="/support" className="hidden md:block text-sm font-bold text-white/80 hover:text-white transition-colors uppercase tracking-wide">
                        Support
                    </Link3D>
                    <Link3D href="/blog" className="hidden md:block text-sm font-bold text-white/80 hover:text-white transition-colors uppercase tracking-wide">
                        Blog
                    </Link3D>
                    {isLoggedIn ? (
                        <button onClick={handleLogout} className="text-sm font-bold text-stone-500 hover:text-red-500 transition-colors uppercase tracking-wide">
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link3D href="/login" className="hidden md:block text-sm font-bold text-white/80 hover:text-white transition-colors uppercase tracking-wide">
                                Proxies
                            </Link3D>
                            <Link3D href="/login" className="hidden md:block text-sm font-bold text-white/80 hover:text-white transition-colors uppercase tracking-wide">
                                Log in
                            </Link3D>
                            <Link href="/register">
                                <MagneticButton className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-6 py-2 rounded-full font-bold text-sm hover:translate-y-[-2px] hover:shadow-lg transition-all">
                                    Get Started
                                </MagneticButton>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
