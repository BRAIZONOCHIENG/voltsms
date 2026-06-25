"use client";
/*
 * -----------------------------------------------------------------------------
 * 🔒 LOCKED FILE - DASHBOARD CORE
 * -----------------------------------------------------------------------------
 * This is the main dashboard logic. It handles order state, refreshing,
 * and service selection. It is complex and critical.
 * 
 * See .agent/workflows/protected-files.md for details.
 * -----------------------------------------------------------------------------
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';
import { FaSearch, FaWallet, FaShoppingCart, FaChevronDown, FaRegStar, FaStar, FaQuestionCircle, FaClock, FaHistory, FaCheckCircle, FaTimesCircle, FaPlay, FaPlus, FaPaypal, FaCreditCard, FaBitcoin } from 'react-icons/fa';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import { Service } from './services';
import { Country, COUNTRIES } from './countries';
import { SERVICES_DATA } from './services_data';
import { supabase } from '../../lib/supabaseClient';
import VoltSplitterPayment from '../../components/VoltSplitterPayment';
import dynamic from 'next/dynamic';
const PaystackTrigger = dynamic(() => import('../../components/PaystackTrigger'), { ssr: false });
import PayPalTrigger from '../../components/PayPalTrigger';
import VerificationModal from '../../components/VerificationModal';

interface Order {
    order_id: string;
    service: string;
    phone: string;
    status: string;
    created_at?: string;
    expires_at?: number; // timestamp
    code?: string;
    type?: 'sms' | 'voice';
    price?: number;
    isOptimistic?: boolean;
    flag?: string;
}

// Helper to format date
const formatDate = (dateString?: string) => {
    if (!dateString) return 'Just now';
    return new Date(dateString).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

// Helper: Calculate time remaining string
const getTimeRemaining = (expiresAt?: number) => {
    if (!expiresAt) return '';
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Expired';
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const getServiceIconSlug = (name: string) => {
    const map: Record<string, string> = {
        'X (Twitter)': 'x', 'Telegram': 'telegram', 'WhatsApp': 'whatsapp', 'Facebook': 'facebook',
        'Instagram': 'instagram', 'TikTok': 'tiktok', 'Google': 'google', 'Microsoft': 'microsoft',
        'OpenAI': 'openai', 'Uber': 'uber', 'Airbnb': 'airbnb', 'Amazon': 'amazon', 'Netflix': 'netflix',
        'Discord': 'discord', 'LinkedIn': 'linkedin', 'Snapchat': 'snapchat', 'Tinder': 'tinder', 'YouTube': 'youtube',
    };
    if (map[name]) return map[name];
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
};

interface ServiceRowData {
    items: Service[];
    onSelect: (s: Service) => void;
    selectedId: string;
    verificationMethod: 'sms' | 'voice';
    pinnedServices: string[];
    togglePin: (id: string, e: React.MouseEvent) => void;
}

const ServiceRow = ({ data, index, style }: { data: ServiceRowData; index: number; style: React.CSSProperties }) => {
    if (!data || !data.items) return <div style={style} />;
    const { items, onSelect, selectedId, verificationMethod, pinnedServices, togglePin } = data;
    const svc = items[index];
    if (!svc) return <div style={style} />;

    const isSelected = selectedId === svc.id;
    const isPinned = pinnedServices.includes(svc.id);
    let displayPrice: number | null = null;

    // Only show price for "Other Service" in the dropdown list, or if selected
    if (verificationMethod === 'voice') {
        displayPrice = 2.50;
    } else if (svc.id === 'custom') {
        displayPrice = 0.60;
    } else {
        displayPrice = svc.price;
    }

    return (
        <div style={style}>
            <button
                onClick={() => onSelect(svc)}
                className={`w-full text-left px-3 py-2.5 flex items-center justify-between group transition-colors ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
                style={{ height: '100%' }}
            >
                <div className="flex items-center gap-3">
                    <div
                        onClick={(e) => { e.stopPropagation(); togglePin(svc.id, e); }}
                        className={`w-6 h-6 flex items-center justify-center rounded-full transition-all cursor-pointer hover:bg-white/10 ${isPinned ? 'text-yellow-400' : 'text-stone-600 group-hover:text-stone-400'}`}
                    >
                        {isPinned ? <FaStar className="text-sm" /> : <FaRegStar className="text-sm" />}
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 shrink-0 font-bold text-xs">
                        {svc.id === 'custom' ? <FaQuestionCircle className="text-blue-500 text-lg" /> : svc.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`truncate max-w-[240px] ${isSelected ? 'text-white font-medium' : 'text-stone-300'}`}>{svc.name}</span>
                </div>
                {displayPrice !== null && displayPrice > 0 && (
                    <span className="text-sm text-[var(--color-primary)] font-mono font-bold whitespace-nowrap ml-2">${displayPrice.toFixed(2)}</span>
                )}
            </button>
        </div>
    );
};

import { useLanguage } from '../../context/LanguageContext';

export default function Dashboard() {
    const { t } = useLanguage();
    const [balance, setBalance] = useState(0.0);
    const [orders, setOrders] = useState<Order[]>([]);

    // Tab State
    const [dashboardTab, setDashboardTab] = useState<'active' | 'history' | 'deposits'>('active');
    const [actionTab, setActionTab] = useState<'order' | 'deposit'>('order');

    const [deposits, setDeposits] = useState<any[]>([]);

    // Order Flow State
    const [selectedService, setSelectedService] = useState<Service>({ id: '', name: t('svc_select_service'), price: 0, category: '' });
    const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
    const [verificationMethod, setVerificationMethod] = useState<'sms' | 'voice'>('sms');

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [countrySearchTerm, setCountrySearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [pinnedServices, setPinnedServices] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Pagination State
    const [historyPage, setHistoryPage] = useState(1);
    const [depositsPage, setDepositsPage] = useState(1);
    const ROWS_PER_PAGE = 5;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalOrder, setModalOrder] = useState<Order | null>(null);

    const [dynamicPrice, setDynamicPrice] = useState<number | null>(null);
    const [fetchingPrice, setFetchingPrice] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const countryDropdownRef = useRef<HTMLDivElement>(null);
    const orderSectionRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');
    const [depositMethod, setDepositMethod] = useState<'crypto' | 'paystack' | 'paypal'>('crypto');
    const [fiatAmount, setFiatAmount] = useState<number>(3);

    // Derived Lists
    const activeOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
    const historyOrders = useMemo(() => orders.filter(o => o.status !== 'pending'), [orders]);

    // Initial Load & Auth
    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/login'); return; }
            setUserToken(session.access_token);
            setUserId(session.user.id);
            setUserEmail(session.user.email || '');
            fetchData(session.access_token);
            fetchDeposits(session.access_token);

            // Restore pins
            const savedPins = localStorage.getItem('pinnedServices');
            if (savedPins) setPinnedServices(JSON.parse(savedPins));
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    const fetchDeposits = async (token: string) => {
        try {
            const res = await fetch('/api/deposits', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setDeposits(data.deposits);
        } catch (e) { console.error('Error fetching deposits:', e); }
    };

    // Reset service selection when verification method changes
    useEffect(() => {
        setSelectedService({ id: '', name: 'Select Service', price: 0, category: '' });
    }, [verificationMethod]);

    // Periodic Polling (updates order lists)
    useEffect(() => {
        if (!userToken) return;
        const interval = setInterval(() => {
            // Only poll aggressively if we have active orders
            if (activeOrders.length > 0) {
                fetchData(userToken);
                // Also update modal order specifically if open
                if (isModalOpen && modalOrder) {
                    const updated = orders.find(o => o.order_id === modalOrder.order_id);
                    if (updated && updated.status !== modalOrder.status) {
                        setModalOrder(updated);
                        // If updated to completed, maybe trigger sound or effect in modal?
                    }
                }
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [userToken, activeOrders.length, isModalOpen, modalOrder, orders]);

    const fetchData = async (token: string) => {
        try {
            const [balRes, ordRes] = await Promise.all([
                fetch('/api/balance', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            if (balRes.ok) {
                const d = await balRes.json();
                setBalance(d.balance);
            }


            if (ordRes.ok) {
                const serverOrders = await ordRes.json();

                setOrders(prev => {
                    // Keep optimistic orders that are recent (< 15 seconds) and NOT in server list yet
                    const now = Date.now();
                    const recentOptimistic = prev.filter(o =>
                        o.isOptimistic &&
                        o.created_at &&
                        (now - new Date(o.created_at).getTime() < 15000) &&
                        !serverOrders.find((so: Order) => so.order_id === o.order_id)
                    );

                    // Merge server orders with preserved expires_at from previous state
                    const mergedServerOrders = serverOrders.map((so: any) => {
                        const prevOrder = prev.find(p => p.order_id === so.order_id);
                        // Calculate expires_at: use previous value, or calculate from created_at (20 mins)
                        let expiresAt = prevOrder?.expires_at;
                        if (!expiresAt && so.created_at) {
                            expiresAt = new Date(so.created_at).getTime() + 20 * 60 * 1000;
                        }
                        // Map cost to price for display and preserve optimistic flag
                        return { ...so, expires_at: expiresAt, price: so.cost || prevOrder?.price || 0, flag: prevOrder?.flag };
                    });

                    return [...recentOptimistic, ...mergedServerOrders];
                });

                // Auto-update modal if open - preserve expires_at and price
                setModalOrder(prev => {
                    if (!prev) return null;
                    const found = serverOrders.find((o: any) => o.order_id === prev.order_id);
                    if (found) {
                        // Preserve expires_at, price, and flag from current modal order
                        return {
                            ...found,
                            expires_at: prev.expires_at || found.expires_at,
                            price: found.cost || prev.price || 0,
                            flag: prev.flag || found.flag
                        };
                    }
                    return prev;
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Price Fetching
    // Price Fetching
    useEffect(() => {
        if (!selectedService.id || !selectedCountry.code || selectedService.id === 'custom') {
            setDynamicPrice(null); return;
        }

        // Use specific country price if available, otherwise base price
        let price = selectedService.price;
        if (selectedService.prices && selectedService.prices[selectedCountry.code]) {
            price = selectedService.prices[selectedCountry.code];
        }
        setDynamicPrice(price);
    }, [selectedService, selectedCountry]);

    const togglePin = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newPins = pinnedServices.includes(id) ? pinnedServices.filter(p => p !== id) : [...pinnedServices, id];
        setPinnedServices(newPins);
        localStorage.setItem('pinnedServices', JSON.stringify(newPins));
    };
    const [services, setServices] = useState<Service[]>([]);
    // Load Static Services (Instant)
    useEffect(() => {
        setServices(SERVICES_DATA);
    }, []);

    // Memoize sorted services
    const sortedServices = useMemo(() => {
        let items = [...services];

        // 1. Search Filter
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            items = items.filter(s => s.name.toLowerCase().includes(q));
        }

        // 2. Category Filter
        if (selectedCategory !== 'All') {
            items = items.filter(s => s.category === selectedCategory);
        }

        // 3. Pricing & Verification Type Logic
        items = items.map(s => {
            // Apply Voice Pricing override if needed (except for Service Not Listed)
            if (verificationMethod === 'voice' && s.id !== '9999') {
                return { ...s, price: 2.50 };
            }
            return s;
        });

        // 4. Pinned services sorting
        return items.sort((a, b) => {
            // Pin "Service Not Listed" (9999) to the top
            if (a.id === '9999') return -1;
            if (b.id === '9999') return 1;

            if (a.id === 'custom') return -1; if (b.id === 'custom') return 1;
            const aPinned = pinnedServices.includes(a.id);
            const bPinned = pinnedServices.includes(b.id);
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [services, searchTerm, selectedCategory, verificationMethod, pinnedServices]);

    // Force update selectedService price when mode changes (e.g. SMS -> Voice)
    useEffect(() => {
        if (selectedService.id && selectedService.id !== 'custom') {
            const updated = sortedServices.find(s => s.id === selectedService.id);
            if (updated && updated.price !== selectedService.price) {
                setSelectedService(updated);
            }
        }
    }, [verificationMethod, sortedServices, selectedService]);

    const handleBuy = async () => {
        if (!selectedService.id) return;
        setLoading(true); setMsg('');
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                setMsg('Session expired. Please login again.');
                return;
            }

            const token = session.access_token; // Always use fresh token
            if (!token) return;

            const finalPrice = (verificationMethod === 'voice' && selectedService.id !== '9999') ? 2.50 : (dynamicPrice || selectedService.price);
            const res = await fetch('/api/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    service: selectedService.id, serviceName: selectedService.name,
                    country: selectedCountry.code, price: finalPrice, verificationMethod
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                // Optimistic Update
                const newOrder: Order = {
                    order_id: data.order_id,
                    phone: data.phone,
                    service: selectedService.name,
                    expires_at: data.expires_at ? new Date(data.expires_at).getTime() : Date.now() + 20 * 60 * 1000,
                    status: 'pending',
                    price: finalPrice,
                    type: verificationMethod,
                    created_at: new Date().toISOString(),
                    isOptimistic: true,
                    flag: selectedCountry.flag
                };
                setOrders(prev => [newOrder, ...prev]);
                setModalOrder(newOrder);
                setIsModalOpen(true);
                // Delay fetch to ensure DB propagation and avoid race condition (empty list return)
                setTimeout(() => fetchData(token), 1000);
            } else {
                setMsg(`Error: ${data.error || 'Purchase failed'}`);
            }
        } catch (e: any) {
            setMsg(e.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        try {
            // Get fresh token to avoid stale token issues
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) {
                alert('Please log in again');
                router.push('/login');
                return;
            }
            const res = await fetch('/api/cancel', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ orderId })
            });
            const data = await res.json();
            if (data.success) {
                // alert("Order cancelled. Refunded.");
                fetchData(token);
                // Close modal if it was this order
                if (modalOrder?.order_id === orderId) setIsModalOpen(false);
            } else {
                alert(data.error || "Could not cancel");
            }
        } catch (e) { console.error(e); }
    };

    const handleOrderTimeout = async (orderId: string) => {
        try {
            // Get fresh token to avoid stale token issues
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) return;
            // Update local state immediately
            setOrders(prev => prev.map(o =>
                o.order_id === orderId ? { ...o, status: 'expired' } : o
            ));
            // Update database - mark as expired (SMSPool handles refund automatically)
            await fetch('/api/orders/expire', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ orderId })
            });
            // Refresh data
            fetchData(token);
        } catch (e) { console.error(e); }
    };

    return (
        <main className={`min-h-screen bg-[#09090b] text-white transition-all duration-300 ${isDropdownOpen || isCountryDropdownOpen ? 'pb-80' : 'pb-20'}`}>
            <Navbar />
            <VerificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={modalOrder}
                onCancel={handleCancelOrder}
                onTimeout={handleOrderTimeout}
                onReport={() => router.push('/contact')}
            />

            <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{t('dash_header_title')}</h1>
                        <p className="text-white/60 text-sm mt-1">{t('dash_header_desc')}</p>
                    </div>
                    <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border-t border-l border-white/20 border-b border-r border-black/20 px-6 py-3 rounded-2xl flex flex-col items-end shadow-2xl">
                        <span className="text-xs text-stone-400 uppercase font-semibold tracking-wider">{t('dash_balance')}</span>
                        <span className="text-2xl font-bold text-[var(--color-primary)]">${balance.toFixed(2)}</span>
                    </div>
                </div>

                {/* Order Service Section */}
                <div ref={orderSectionRef} className="scroll-mt-24 mb-6">
                    <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border-t border-l border-white/20 border-b border-r border-black/20 rounded-3xl p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-visible ring-1 ring-white/5 relative z-20">
                        {/* Tab Headers within Card */}
                        <div className="grid grid-cols-2 p-1 bg-white/5 backdrop-blur-md rounded-2xl mb-6 mx-4 mt-4">
                            <button
                                onClick={() => setActionTab('order')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${actionTab === 'order' ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/10' : 'text-stone-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <FaShoppingCart /> {t('dash_order_number')}
                            </button>
                            <button
                                onClick={() => setActionTab('deposit')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${actionTab === 'deposit' ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/10' : 'text-stone-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <FaWallet /> {t('dash_add_funds')}
                            </button>
                        </div>

                        <div className="px-6 pb-8 pt-2">
                            {actionTab === 'deposit' ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => setDepositMethod('crypto')}
                                            className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${depositMethod === 'crypto' ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            <FaBitcoin className="text-xl" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Crypto</span>
                                        </button>
                                        <button
                                            onClick={() => setDepositMethod('paystack')}
                                            className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${depositMethod === 'paystack' ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            <FaCreditCard className="text-xl" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Card</span>
                                        </button>
                                        <button
                                            onClick={() => setDepositMethod('paypal')}
                                            className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${depositMethod === 'paypal' ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            <FaPaypal className="text-xl" />
                                            <span className="text-xs font-bold uppercase tracking-wider">PayPal</span>
                                        </button>
                                    </div>

                                    {depositMethod === 'crypto' && (
                                        <VoltSplitterPayment userId={userId} userToken={userToken || undefined} />
                                    )}

                                    {depositMethod !== 'crypto' && (
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <label className="text-xs font-semibold uppercase text-stone-400 tracking-wider mb-2 block">Deposit Amount (USD)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                                                <input
                                                    type="number"
                                                    min={3}
                                                    step="0.1"
                                                    value={fiatAmount}
                                                    onChange={(e) => setFiatAmount(Math.max(3, parseFloat(e.target.value) || 3))}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-8 pr-4 text-white text-xl font-bold focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                                />
                                            </div>
                                            <p className="text-stone-500 text-xs mt-2 italic">Minimum deposit: $3.00 USD</p>

                                            {depositMethod === 'paystack' && (
                                                <PaystackTrigger
                                                    email={userEmail}
                                                    amountUSD={fiatAmount}
                                                    method="card"
                                                    onSuccess={(reference) => {
                                                        alert("Payment processing! Balance will update shortly.");
                                                        if (userToken) fetchDeposits(userToken);
                                                    }}
                                                />
                                            )}

                                            {depositMethod === 'paypal' && (
                                                <div className="mt-8">
                                                    <PayPalTrigger
                                                        amount={fiatAmount}
                                                        onSuccess={(orderId) => {
                                                            alert("PayPal Payment Successful!");
                                                            if (userToken) fetchDeposits(userToken);
                                                        }}
                                                        onError={(err) => alert("PayPal Payment Failed")}
                                                        getAccessToken={async () => userToken}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Verification Method Toggle - REMOVED for Non-VoIP focus */}
                                    {/* Defaults to SMS */}

                                    {/* Service Selector (MOVED UP - User Request) */}
                                    <div className="space-y-2 relative z-20 mt-2">
                                        <label className="text-xs font-semibold uppercase text-stone-400 tracking-wider ml-1">{t('svc_select_service')}</label>
                                        <div className="relative" ref={dropdownRef}>
                                            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 flex items-center justify-between hover:bg-white/10 text-left">
                                                <div>
                                                    <div className="font-bold text-white">{selectedService.name}</div>
                                                    <div className="text-xs text-stone-400">{selectedService.id === '' ? t('svc_select_first') : t('svc_instant_delivery')}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {selectedService.id && <span className="bg-white/10 px-2 py-1 rounded text-[var(--color-accent)] font-mono">${(verificationMethod === 'voice' ? 2.50 : (selectedService.prices?.[selectedCountry.code] || selectedService.price)).toFixed(2)}</span>}
                                                    <FaChevronDown />
                                                </div>
                                            </button>
                                            {isDropdownOpen && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl z-50 shadow-2xl">
                                                    <div className="p-3 border-b border-white/10 sticky top-0 bg-[#1a1a1a] z-10">
                                                        <FaSearch className="absolute left-6 top-6 text-stone-500" />
                                                        <input autoFocus type="text" placeholder={t('svc_search_placeholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white" />
                                                    </div>
                                                    <div className="h-[300px]">
                                                        <List height={300} width="100%" itemCount={sortedServices.length} itemSize={60}>
                                                            {({ index, style }) => <ServiceRow data={{
                                                                items: sortedServices, onSelect: (s) => {
                                                                    setSelectedService(s);
                                                                    setIsDropdownOpen(false);
                                                                    // Auto-select first available country if current is invalid
                                                                    if (s.prices && !s.prices[selectedCountry.code]) {
                                                                        const firstAvailCode = Object.keys(s.prices)[0];
                                                                        const firstAvail = COUNTRIES.find(c => c.code === firstAvailCode);
                                                                        if (firstAvail) setSelectedCountry(firstAvail);
                                                                        else setSelectedCountry(COUNTRIES[0]); // Fallback
                                                                    }
                                                                }, selectedId: selectedService.id, verificationMethod, pinnedServices, togglePin
                                                            }} index={index} style={style} />}
                                                        </List>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {isDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />}
                                    </div>

                                    {/* Country Selector (MOVED DOWN) */}
                                    <div className="space-y-2 relative z-10 mt-4" ref={countryDropdownRef}>
                                        <label className="text-xs font-semibold uppercase text-stone-400 tracking-wider ml-1">{t('cnt_select_country')}</label>
                                        <button
                                            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                            disabled={!selectedService.id}
                                            className={`w-full h-[52px] px-4 rounded-xl border flex items-center justify-between transition-all ${!selectedService.id ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{selectedCountry.flag}</span>
                                                <span className="font-medium">{selectedCountry.name}</span>
                                                {selectedService.id && selectedService.prices && selectedService.prices[selectedCountry.code] && (
                                                    <span className="ml-2 text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded font-mono">
                                                        ${selectedService.prices[selectedCountry.code].toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                            <FaChevronDown />
                                        </button>
                                        <AnimatePresence>
                                            {isCountryDropdownOpen && (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl max-h-[400px] z-50 flex flex-col shadow-2xl">
                                                    <div className="p-3 border-b border-white/10 sticky top-0 bg-[#1a1a1a] z-10">
                                                        <FaSearch className="absolute left-6 top-6 text-stone-500" />
                                                        <input autoFocus type="text" placeholder={t('cnt_search_placeholder')} value={countrySearchTerm} onChange={e => setCountrySearchTerm(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white" />
                                                    </div>
                                                    <div className="overflow-y-auto flex-1">
                                                        {(() => {
                                                            // Filter countries based on Service Availability
                                                            let availableList = COUNTRIES;
                                                            if (selectedService.id && selectedService.prices && Object.keys(selectedService.prices).length > 0) {
                                                                availableList = COUNTRIES.filter(c => selectedService.prices![c.code] !== undefined);
                                                            }

                                                            // Filter by search term
                                                            if (countrySearchTerm) {
                                                                availableList = availableList.filter(c => c.name.toLowerCase().includes(countrySearchTerm.toLowerCase()));
                                                            }

                                                            if (availableList.length === 0) return <div className="p-4 text-center text-stone-500 text-sm">No countries available for this service.</div>;

                                                            return availableList.map(c => (
                                                                <button key={c.code} onClick={() => { setSelectedCountry(c); setIsCountryDropdownOpen(false); }} className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 text-left group">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-2xl">{c.flag}</span>
                                                                        <span className="text-white group-hover:text-[var(--color-primary)] transition-colors">{c.name}</span>
                                                                    </div>
                                                                    {selectedService.id && selectedService.prices && selectedService.prices[c.code] && (
                                                                        <span className="text-sm font-bold text-stone-400 group-hover:text-white">
                                                                            ${selectedService.prices[c.code].toFixed(2)}
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            ));
                                                        })()}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        {isCountryDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsCountryDropdownOpen(false)} />}
                                    </div>

                                    {/* Buy Button */}
                                    <button
                                        onClick={handleBuy}
                                        disabled={loading || !selectedService.id}
                                        className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-black text-lg shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? <span className="animate-spin">⏳</span> : <FaShoppingCart />}
                                        {loading ? 'Processing...' : `Purchase ${selectedService.name} - ${selectedCountry.name} ($${(verificationMethod === 'voice' ? 2.50 : (selectedService.prices?.[selectedCountry.code] || selectedService.price)).toFixed(2)})`}
                                    </button>
                                    {msg && <div className={`mt-4 p-3 rounded-xl text-center text-sm font-bold ${msg.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{msg}</div>}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Helpful Tip Banner */}
                <div className="mb-6 py-2.5 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm flex items-center gap-3">
                    <span className="text-xl shrink-0">💡</span>
                    <div className="leading-snug">
                        <strong className="text-blue-400">Didn't receive your code? Don't worry!</strong> Since we use real SIMs, networks can sometimes block messages. If your SMS doesn't arrive, simply hit <strong>Cancel</strong>. Your balance is instantly refunded, and you can try again!
                    </div>
                </div>

                {/* Verifications Section (Tabs) */}
                <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden relative min-h-[400px]">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b border-white/5 bg-white/[0.02] gap-4">
                        <div className="flex gap-6">
                            <button
                                onClick={() => setDashboardTab('active')}
                                className={`pb-2 text-sm font-bold border-b-2 transition-colors ${dashboardTab === 'active' ? 'border-[var(--color-primary)] text-white' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setDashboardTab('history')}
                                className={`pb-2 text-sm font-bold border-b-2 transition-colors ${dashboardTab === 'history' ? 'border-[var(--color-primary)] text-white' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
                            >
                                History
                            </button>
                            <button
                                onClick={() => { setDashboardTab('deposits'); if (userToken) fetchDeposits(userToken); }}
                                className={`pb-2 text-sm font-bold border-b-2 transition-colors ${dashboardTab === 'deposits' ? 'border-[var(--color-primary)] text-white' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
                            >
                                Deposits
                            </button>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={() => { setVerificationMethod('sms'); orderSectionRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="flex-1 md:flex-none bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                                New SMS Verification
                            </button>
                        </div>
                    </div>

                    <div className="p-0 overflow-x-auto min-h-[460px] flex flex-col justify-between">
                        <table className="w-full text-left text-sm min-w-[700px]">
                            {dashboardTab === 'deposits' ? (
                                <>
                                    <thead className="text-stone-500 font-bold uppercase text-xs bg-white/[0.02]">
                                        <tr>
                                            <th className="px-6 py-4 font-normal tracking-wider whitespace-nowrap">Date</th>
                                            <th className="px-6 py-4 font-normal tracking-wider whitespace-nowrap">Method / Type</th>
                                            <th className="px-6 py-4 font-normal tracking-wider whitespace-nowrap">Amount</th>
                                            <th className="px-6 py-4 font-normal tracking-wider whitespace-nowrap">Status</th>
                                            <th className="px-6 py-4 font-normal tracking-wider text-right whitespace-nowrap">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {deposits.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-stone-600 italic">
                                                    No deposits found.
                                                </td>
                                            </tr>
                                        ) : (
                                            deposits.slice((depositsPage - 1) * ROWS_PER_PAGE, depositsPage * ROWS_PER_PAGE).map((dep) => (
                                                <tr key={dep.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-4 text-stone-400 whitespace-nowrap">{formatDate(dep.created_at)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-white uppercase text-xs">{dep.type.replace('_', ' ')}</span>
                                                            <span className="text-[10px] text-stone-500">{dep.description}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`font-mono font-bold ${dep.type === 'referral_bonus' ? 'text-green-400' : 'text-[var(--color-primary)]'}`}>
                                                            +${dep.amount.toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] font-bold uppercase">
                                                            <FaCheckCircle className="text-[8px]" /> {dep.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-xs text-stone-400 italic">
                                                        {dep.type === 'referral_bonus' ? '10% Partner Bonus' : ''}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        {/* Fill empty rows to keep height stable */}
                                        {deposits.length > 0 && deposits.length % ROWS_PER_PAGE !== 0 && depositsPage === Math.ceil(deposits.length / ROWS_PER_PAGE) && (
                                            Array.from({ length: ROWS_PER_PAGE - (deposits.length % ROWS_PER_PAGE) }).map((_, i) => (
                                                <tr key={`empty-${i}`} className="h-[73px] border-none"><td colSpan={5}></td></tr>
                                            ))
                                        )}
                                    </tbody>
                                </>
                            ) : (
                                <>
                                    <thead className="text-stone-500 font-bold uppercase text-xs bg-white/[0.02]">
                                        <tr>
                                            <th className="px-6 py-4 font-normal tracking-wider whitespace-nowrap">Created At</th>
                                            <th className="px-6 py-4 font-normal tracking-wider whitespace-nowrap">Service</th>
                                            <th className="px-6 py-4 font-normal tracking-wider whitespace-nowrap">Number</th>
                                            <th className="px-6 py-4 font-normal tracking-wider whitespace-nowrap">Code</th>
                                            <th className="px-6 py-4 font-normal tracking-wider whitespace-nowrap">Status</th>
                                            <th className="px-6 py-4 font-normal tracking-wider text-right whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {(dashboardTab === 'active' ? activeOrders : historyOrders).length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-stone-600 italic">
                                                    No {dashboardTab} verifications found.
                                                </td>
                                            </tr>
                                        ) : (
                                            (dashboardTab === 'active' ? activeOrders : historyOrders)
                                                .slice(
                                                    dashboardTab === 'history' ? (historyPage - 1) * ROWS_PER_PAGE : 0,
                                                    dashboardTab === 'history' ? historyPage * ROWS_PER_PAGE : undefined
                                                )
                                                .map((order) => (
                                                    <tr key={order.order_id} className="hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-6 py-4 text-stone-300 whitespace-nowrap">{formatDate(order.created_at)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <img src={`/icons/${getServiceIconSlug(order.service)}.svg`} className="w-4 h-4 opacity-70" alt="" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                                <span className="font-medium text-white">{order.service}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-stone-300 whitespace-nowrap">{order.phone}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {order.code ? (
                                                                <button
                                                                    onClick={() => { navigator.clipboard.writeText(order.code!); alert('Copied!'); }}
                                                                    className="font-mono font-bold text-[var(--color-primary)] hover:underline"
                                                                    title="Click to copy"
                                                                >
                                                                    {order.code}
                                                                </button>
                                                            ) : (
                                                                <span className="text-stone-600 italic">---</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {order.status === 'pending' ? (
                                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 text-xs font-bold">
                                                                    <FaClock className="animate-pulse" /> Pending
                                                                </span>
                                                            ) : order.status === 'completed' ? (
                                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs font-bold">
                                                                    <FaCheckCircle /> Completed
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs font-bold">
                                                                    <FaTimesCircle /> {order.status}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                                            <button
                                                                onClick={() => { setModalOrder(order); setIsModalOpen(true); }}
                                                                className="px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-xs font-bold text-white"
                                                            >
                                                                Open
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                        )}
                                        {/* Fill empty rows to keep height stable */}
                                        {dashboardTab === 'history' && historyOrders.length > 0 && historyOrders.length % ROWS_PER_PAGE !== 0 && historyPage === Math.ceil(historyOrders.length / ROWS_PER_PAGE) && (
                                            Array.from({ length: ROWS_PER_PAGE - (historyOrders.length % ROWS_PER_PAGE) }).map((_, i) => (
                                                <tr key={`empty-h-${i}`} className="h-[73px] border-none"><td colSpan={6}></td></tr>
                                            ))
                                        )}
                                    </tbody>
                                </>
                            )}
                        </table>

                        {/* Pagination Controls */}
                        {((dashboardTab === 'history' && historyOrders.length > ROWS_PER_PAGE) || (dashboardTab === 'deposits' && deposits.length > ROWS_PER_PAGE)) && (
                            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                                <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                                    Page {dashboardTab === 'history' ? historyPage : depositsPage} of {Math.ceil((dashboardTab === 'history' ? historyOrders.length : deposits.length) / ROWS_PER_PAGE)}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        disabled={(dashboardTab === 'history' ? historyPage : depositsPage) === 1}
                                        onClick={() => dashboardTab === 'history' ? setHistoryPage(p => p - 1) : setDepositsPage(p => p - 1)}
                                        className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent text-xs font-bold transition-all"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        disabled={(dashboardTab === 'history' ? historyPage : depositsPage) === Math.ceil((dashboardTab === 'history' ? historyOrders.length : deposits.length) / ROWS_PER_PAGE)}
                                        onClick={() => dashboardTab === 'history' ? setHistoryPage(p => p + 1) : setDepositsPage(p => p + 1)}
                                        className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent text-xs font-bold transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}

