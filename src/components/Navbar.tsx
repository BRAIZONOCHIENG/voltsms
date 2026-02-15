"use client";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import NextImage from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagneticButton } from './MagneticButton';
import { Link3D } from './Link3D';

import { supabase } from '../lib/supabaseClient';

import { useLanguage } from '../context/LanguageContext';
import { Language } from '../lib/translations';

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const router = useRouter();
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        };
        checkUser();

        // Capture referral code globally from any URL
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            document.cookie = `ref=${ref}; path=/; max-age=2592000`; // 30 days
        }

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

    const languages: { code: Language; label: string; flag: string }[] = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
        { code: 'zh', label: '中文', flag: '🇨🇳' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
    ];

    return (
        <nav
            className="sticky top-0 w-full z-50 border-b border-white/10 shadow-sm bg-transparent"
            style={{ backdropFilter: 'blur(64px) saturate(180%)', WebkitBackdropFilter: 'blur(64px) saturate(180%)' }}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link3D href="/" className="group -ml-3">
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

                {/* Desktop and Mobile Wrapper */}
                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex gap-4 md:gap-6 items-center">
                        {isLoggedIn && (
                            <Link3D href="/dashboard" className="text-sm font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity uppercase tracking-wide">
                                {t('nav_dashboard')}
                            </Link3D>
                        )}
                        {isLoggedIn && (
                            <Link3D href="/dashboard/api" className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wide">
                                {t('nav_api')}
                            </Link3D>
                        )}
                        <Link3D href="/support" className="text-sm font-bold text-white/80 hover:text-white transition-colors uppercase tracking-wide">
                            {t('nav_support')}
                        </Link3D>
                        <Link3D href="/affiliate" className="text-sm font-bold text-stone-400 hover:text-white transition-colors uppercase tracking-wide">
                            {t('nav_affiliate')}
                        </Link3D>
                        <Link3D href="/blog" className="text-sm font-bold text-stone-400 hover:text-white transition-colors uppercase tracking-wide">
                            Blog
                        </Link3D>
                    </div>

                    <div className="flex gap-4 items-center pl-2">
                        {/* Language Switcher - Hidden on mobile, shown in menu instead */}
                        <div className="relative hidden md:block">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <span className="text-sm">{languages.find(l => l.code === language)?.flag}</span>
                            </button>
                            <AnimatePresence>
                                {isLangOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-32 bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                                    >
                                        {languages.map((l) => (
                                            <button
                                                key={l.code}
                                                onClick={() => { setLanguage(l.code); setIsLangOpen(false); }}
                                                className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-white/5 transition-colors ${language === l.code ? 'text-[var(--color-primary)]' : 'text-stone-400'}`}
                                            >
                                                <span>{l.flag}</span>
                                                <span>{l.label}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {isLoggedIn ? (
                            <button onClick={handleLogout} className="hidden md:block text-sm font-bold text-stone-500 hover:text-red-500 transition-colors uppercase tracking-wide">
                                {t('nav_logout')}
                            </button>
                        ) : (
                            <div className="hidden md:flex items-center gap-4">
                                <Link3D href="/login" className="text-sm font-bold text-white/80 hover:text-white transition-colors uppercase tracking-wide">
                                    {t('nav_login')}
                                </Link3D>
                                <Link href="/register">
                                    <MagneticButton className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-6 py-2 rounded-full font-bold text-sm hover:translate-y-[-2px] hover:shadow-lg transition-all">
                                        {t('nav_get_started')}
                                    </MagneticButton>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 z-[60] bg-white/5 border border-white/10 rounded-lg"
                        >
                            <motion.span
                                animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                                className="w-5 h-0.5 bg-white rounded-full"
                            />
                            <motion.span
                                animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                className="w-5 h-0.5 bg-white rounded-full"
                            />
                            <motion.span
                                animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                                className="w-5 h-0.5 bg-white rounded-full"
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-3xl lg:hidden flex flex-col"
                    >
                        <div className="flex-1 flex flex-col justify-center items-center gap-8 p-10">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col items-center gap-6"
                            >
                                {isLoggedIn ? (
                                    <>
                                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-white uppercase tracking-tighter">
                                            {t('nav_dashboard')}
                                        </Link>
                                        <Link href="/dashboard/api" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-cyan-400 uppercase tracking-tighter">
                                            {t('nav_api')}
                                        </Link>
                                    </>
                                ) : (
                                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-[var(--color-primary)] uppercase tracking-tighter">
                                        {t('nav_get_started')}
                                    </Link>
                                )}
                                <Link href="/affiliate" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-stone-400 uppercase tracking-tighter">
                                    {t('nav_affiliate')}
                                </Link>
                                <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-stone-400 uppercase tracking-tighter">
                                    Blog
                                </Link>
                                <Link href="/support" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-white/60 uppercase tracking-tighter">
                                    {t('nav_support')}
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="w-full max-w-xs h-px bg-white/10 my-4"
                            />

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex gap-4"
                            >
                                {languages.map((l) => (
                                    <button
                                        key={l.code}
                                        onClick={() => { setLanguage(l.code); }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${language === l.code ? 'bg-white/10 border-white/20 scale-110 shadow-lg' : 'bg-white/5 border-white/5 opacity-40'}`}
                                    >
                                        <span className="text-xl">{l.flag}</span>
                                    </button>
                                ))}
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8"
                            >
                                {isLoggedIn ? (
                                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-red-500 font-bold uppercase tracking-widest text-sm">
                                        {t('nav_logout')}
                                    </button>
                                ) : (
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold uppercase tracking-widest text-sm underline underline-offset-8 decoration-white/20">
                                        {t('nav_login')}
                                    </Link>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
