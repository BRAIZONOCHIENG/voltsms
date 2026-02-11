"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { FaChartLine, FaNewspaper, FaCreditCard, FaCog, FaSignOutAlt, FaBars, FaTimes, FaServer } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <FaChartLine /> },
        { name: 'Profit Withdrawal', path: '/admin/crypto', icon: <FaCreditCard /> },
        { name: 'Blog Posts', path: '/admin/blog', icon: <FaNewspaper /> },
        { name: 'APIs', path: '/admin/apis', icon: <FaServer /> },
        { name: 'Settings', path: '/admin/settings', icon: <FaCog /> },
    ];

    const router = useRouter();

    React.useEffect(() => {
        // Skip check on login page
        if (pathname === '/admin/login') return;

        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/admin/login');
        }
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
    };

    // If on login page, render children without sidebar/header layout
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-black text-white flex relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none z-0"></div>

            {/* Sidebar (Desktop) */}
            <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                className="hidden md:flex flex-col bg-white/5 backdrop-blur-xl border-r border-white/10 h-screen sticky top-0 z-20 overflow-hidden"
            >
                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <NextImage src="/voltsms-logo.png" alt="VoltSMS Logo" width={32} height={32} className="object-contain" />
                    </div>
                    <span className="font-bold text-lg tracking-wide">VoltAdmin</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link key={item.path} href={item.path}>
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-stone-400 hover:text-white hover:bg-white/5'}`}>
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-medium">{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 w-full transition-colors">
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 relative z-10 flex flex-col min-w-0">
                {/* Header (Mobile Toggle) */}
                <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
                        <FaBars />
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-stone-400">Admin User</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    </div>
                </header>

                <div className="p-6 md:p-10 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
