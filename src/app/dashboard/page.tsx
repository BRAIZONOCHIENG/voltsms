"use client";
import { useEffect, useState, useMemo, useRef } from 'react';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';
import { FaSearch, FaWallet, FaShoppingCart, FaMobileAlt, FaChevronDown, FaBitcoin, FaQuestionCircle, FaPaypal, FaStar, FaRegStar, FaCopy } from 'react-icons/fa';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { List } from 'react-window';
import { Service, MOCK_SERVICES } from './services';
import { Country, COUNTRIES } from './countries';
import { supabase } from '../../lib/supabaseClient';
import DepositSection from '../../components/DepositSection';
import RentalSection from '../../components/RentalSection';


interface Order {
    order_id: string;
    service: string;
    phone: string;
    status: string;
    created_at?: string;
    expires_at?: number; // timestamp
    code?: string;
    type?: 'rental' | 'sms' | 'voice';
}

// Helper to get Simple Icons slug from Service Name
const getServiceIconSlug = (name: string) => {
    // Basic mapping for major services that might not match exactly
    const map: Record<string, string> = {
        'X (Twitter)': 'x',
        'Telegram': 'telegram',
        'WhatsApp': 'whatsapp',
        'Facebook': 'facebook',
        'Instagram': 'instagram',
        'TikTok': 'tiktok',
        'Google': 'google',
        'Microsoft': 'microsoft',
        'OpenAI': 'openai',
        'Uber': 'uber',
        'Airbnb': 'airbnb',
        'Amazon': 'amazon',
        'Netflix': 'netflix',
        'Discord': 'discord',
        'LinkedIn': 'linkedin',
        'Snapchat': 'snapchat',
        'Tinder': 'tinder',
        'YouTube': 'youtube',
    };

    if (map[name]) return map[name];

    const lowerName = name.toLowerCase();
    if (lowerName.includes('google')) return 'google';
    if (lowerName.includes('microsoft')) return 'microsoft';
    if (lowerName.includes('apple')) return 'apple';
    if (lowerName.includes('amazon')) return 'amazon';

    // Default: Remove non-alphanumeric, use lowercase
    // e.g. "Coca-Cola" -> "cocacola", "Discord" -> "discord"
    return lowerName.replace(/[^a-z0-9]/g, '');
};

// Calculate selling price with markup (same formula as /api/price)
const calculateSellingPrice = (costPrice: number): number => {
    let sellingPrice = 0;
    if (costPrice < 0.50) {
        sellingPrice = costPrice + 0.40;  // Min $0.40 profit
    } else {
        sellingPrice = costPrice + 0.50;  // Standard $0.50 profit
    }
    sellingPrice += 0.05;  // Buffer fee
    return Math.round(sellingPrice * 100) / 100;
};

interface ServiceRowData {
    items: Service[];
    onSelect: (s: Service) => void;
    selectedId: string;
    verificationMethod: 'sms' | 'voice' | 'rental';
    pinnedServices: string[];
    togglePin: (id: string, e: React.MouseEvent) => void;
}

interface WrappedServiceRowData {
    data: ServiceRowData;
}

interface ServiceRowProps {
    data: ServiceRowData;
    index: number;
    style: React.CSSProperties;
}

const ServiceRow = ({ data, index, style }: ServiceRowProps) => {
    if (!data) return <div style={style} />;
    const { items, onSelect, selectedId, verificationMethod, pinnedServices, togglePin } = data;
    const safePinnedServices = Array.isArray(pinnedServices) ? pinnedServices : [];

    // Safety check for items
    if (!items || !Array.isArray(items)) return <div style={style} />;

    const svc = items[index];
    if (!svc) return <div style={style} />;

    const isSelected = selectedId === svc.id;
    const isPinned = safePinnedServices.includes(svc.id);
    let displayPrice: number | null = null;

    if (verificationMethod === 'voice') {
        displayPrice = 2.20;
    } else if (svc.id === 'custom') {
        displayPrice = 0.60;
    }

    return (
        <div style={style}>
            <button
                onClick={() => onSelect(svc)}
                className={`w-full text-left px-3 py-2.5 flex items-center justify-between group transition-colors ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                style={{ height: '100%' }}
            >
                <div className="flex items-center gap-3">
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePin(svc.id, e);
                        }}
                        className={`w-6 h-6 flex items-center justify-center rounded-full transition-all cursor-pointer hover:bg-white/10 ${isPinned ? 'text-yellow-400' : 'text-stone-600 group-hover:text-stone-400'}`}
                    >
                        {isPinned ? <FaStar className="text-sm" /> : <FaRegStar className="text-sm" />}
                    </div>

                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 shrink-0 font-bold text-xs overflow-hidden">
                        {svc.id === 'custom' ? (
                            <FaQuestionCircle className="text-blue-500 text-lg" />
                        ) : (
                            <img
                                src={`/icons/${getServiceIconSlug(svc.name)}.svg`}
                                alt={svc.name}
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    // First fallback: SimpleIcons CDN
                                    if (target.src.includes('/icons/')) {
                                        target.src = `https://cdn.simpleicons.org/${getServiceIconSlug(svc.name)}`;
                                    }
                                    // Second fallback: Google Favicon
                                    else if (target.src.includes('simpleicons.org')) {
                                        const cleanName = svc.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                                        const domain = `${cleanName}.com`;
                                        target.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                                    } else {
                                        target.style.display = 'none';
                                        target.parentElement!.classList.remove('bg-white/10');
                                        target.parentElement!.classList.add('bg-gradient-to-br', 'from-[var(--color-primary)]', 'to-[var(--color-secondary)]');
                                        target.parentElement!.innerHTML = svc.name.charAt(0).toUpperCase();
                                    }
                                }}
                            />
                        )}
                    </div>
                    <span className={`truncate max-w-[240px] ${isSelected ? 'text-white font-medium' : 'text-stone-300'}`}>
                        {svc.name}
                    </span>
                </div>
                {displayPrice !== null && (
                    <span className="text-sm text-[var(--color-primary)] font-mono font-bold whitespace-nowrap ml-2">
                        ${displayPrice.toFixed(2)}
                    </span>
                )}
            </button>
        </div>
    );
};

export default function Dashboard() {
    const [balance, setBalance] = useState(0.0);
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<'order' | 'deposit'>('order');

    // Order State
    const [selectedService, setSelectedService] = useState<Service>({ id: '', name: 'Select Service', price: 0, category: '' });
    // Removed unused customServiceName
    const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
    const [searchTerm, setSearchTerm] = useState(''); // Service search
    const [countrySearchTerm, setCountrySearchTerm] = useState(''); // Country search
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);



    // Feature State: Voice & Pins
    const [verificationMethod, setVerificationMethod] = useState<'sms' | 'voice' | 'rental'>('sms');
    const [pinnedServices, setPinnedServices] = useState<string[]>([]);

    // Load Pinned Services on Mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('pinnedServices');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setPinnedServices(parsed);
                }
            }
        } catch (e) {
            console.error("Failed to load pinned services", e);
        }
    }, []);

    const togglePin = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const currentPins = Array.isArray(pinnedServices) ? pinnedServices : [];
        const newPins = currentPins.includes(id)
            ? currentPins.filter(p => p !== id)
            : [...currentPins, id];
        setPinnedServices(newPins);
        localStorage.setItem('pinnedServices', JSON.stringify(newPins));
    };

    const [userEmail, setUserEmail] = useState('user@example.com');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [dynamicPrice, setDynamicPrice] = useState<number | null>(null);
    const [fetchingPrice, setFetchingPrice] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const countryDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
                setIsCountryDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);



    const router = useRouter();
    const [userToken, setUserToken] = useState<string | null>(null);

    const getAccessToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
            return null;
        }
        return session.access_token;
    };

    const fetchBalance = async () => {
        const token = await getAccessToken();
        if (!token) return;
        try {
            const res = await fetch('/api/balance', { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setBalance(data.balance);
            }
        } catch (e) {
            console.error('Failed to fetch balance:', e);
        }
    };

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) setUserEmail(user.email);

            const token = await getAccessToken();
            if (token) {
                setUserToken(token);
                fetchData(token);
            }
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredCountries = useMemo(() => {
        if (!countrySearchTerm) return COUNTRIES;
        const lower = countrySearchTerm.toLowerCase();
        return COUNTRIES.filter(c => c.name.toLowerCase().includes(lower));
    }, [countrySearchTerm]);

    const filteredServices = useMemo(() => {
        const result = MOCK_SERVICES.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Defined Famous Brands for auto-pinning at top
        const FAMOUS_BRANDS = [
            'whatsapp', 'telegram', 'tinder', 'google', 'facebook', 'instagram', 'tiktok',
            'uber', 'openai', 'discord', 'twitter', 'snapchat', 'netflix', 'amazon'
        ];

        // Sort: Custom -> Pinned -> Famous -> Alphabetical (A-Z)
        return result.sort((a, b) => {
            // 1. Custom Service always top
            if (a.id === 'custom') return -1;
            if (b.id === 'custom') return 1;

            // 2. User Pinned Services
            const aPinned = pinnedServices.includes(a.id);
            const bPinned = pinnedServices.includes(b.id);
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;

            // 3. Famous Brands (Auto-pinned)
            const aFamous = FAMOUS_BRANDS.indexOf(a.id);
            const bFamous = FAMOUS_BRANDS.indexOf(b.id);

            // If both famous, sort by their order in FAMOUS_BRANDS array
            if (aFamous !== -1 && bFamous !== -1) {
                return aFamous - bFamous;
            }
            // If one is famous, it comes first
            if (aFamous !== -1) return -1;
            if (bFamous !== -1) return 1;

            // 4. Alphabetical A-Z
            return a.name.localeCompare(b.name);
        });
    }, [searchTerm, pinnedServices]);

    const fetchData = async (token: string) => {
        try {
            const [balRes, ordRes] = await Promise.all([
                fetch('/api/balance', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (balRes.ok) {
                const balData = await balRes.json();
                setBalance(balData.balance);
            }
            if (ordRes.ok) {
                const ordData = await ordRes.json();
                setOrders(ordData);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Fetch Price when Service or Country changes
    useEffect(() => {
        const fetchPrice = async () => {
            if (!selectedService.id || !selectedCountry.code || selectedService.id === 'custom') {
                setDynamicPrice(null);
                return;
            }

            setFetchingPrice(true);
            try {
                const res = await fetch('/api/price', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        service: selectedService.id,
                        country: selectedCountry.code
                    })
                });
                const data = await res.json();
                if (data.price) {
                    setDynamicPrice(data.price);
                } else {
                    // Fallback to static if API fails / service unavailable for that country
                    setDynamicPrice(selectedService.price);
                }
            } catch (err) {
                console.error("Failed to fetch price", err);
                setDynamicPrice(selectedService.price);
            } finally {
                setFetchingPrice(false);
            }
        };

        fetchPrice();
    }, [selectedService, selectedCountry]);

    const handleBuy = async () => {
        if (!selectedService.id) return;
        setLoading(true);
        setMsg('');

        try {
            const token = await getAccessToken();
            if (!token) {
                router.push('/login');
                return;
            }

            // Force Voice Price locally
            const finalPrice = verificationMethod === 'voice'
                ? 2.20
                : (dynamicPrice || selectedService.price);

            const res = await fetch('/api/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    service: selectedService.id, // e.g. 'google'
                    serviceName: selectedService.name,
                    country: selectedCountry.code, // e.g. 'US'
                    price: finalPrice,
                    verificationMethod: verificationMethod // 'sms' or 'voice'
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setMsg('Order placed successfully!');
                setActiveOrder({
                    id: data.order_id,
                    phone: data.phone,
                    service: selectedService.name,
                    expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins approx
                    status: 'pending'
                });
                fetchBalance();
                // fetchOrders(); // Optional if history view exists
            } else {
                setMsg(`Error: ${data.error || 'Purchase failed'}`);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setMsg(err.message);
            } else {
                setMsg('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };



    // ...

    // START RENDER UPDATE

    /* Inside Render method around line 584 */
    /*
        <p className="text-xs text-stone-500 mt-2">
            Only send {selectedCoin} <span className="font-bold text-white">({cryptoNetwork})</span> network funds to this address.
        </p>
    */





    // Active Order State
    const [activeOrder, setActiveOrder] = useState<{ id: string; phone: string; service: string; expiresAt: number; status: 'pending' | 'completed' | 'expired'; code?: string } | null>(null);

    // Initial check for existing active orders? (Optional for now, user starts fresh)

    // Polling Order Status
    useEffect(() => {
        if (!activeOrder || activeOrder.status !== 'pending') return;

        const interval = setInterval(async () => {
            // Check expiry
            const timeLeft = activeOrder.expiresAt - Date.now();
            if (timeLeft <= 0) {
                handleCancelOrder(); // Auto-cancel
                return;
            }

            // Check status
            try {
                const token = await getAccessToken();
                if (!token) return;

                const res = await fetch('/api/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ orderId: activeOrder.id })
                });
                const data = await res.json();

                if (data.status === 'completed') {
                    setActiveOrder(prev => prev ? { ...prev, status: 'completed', code: data.code } : null);
                    // Play sound?
                    alert(`SMS Received: ${data.code}`);
                } else if (data.status === 'expired') {
                    handleCancelOrder();
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 5000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeOrder]);

    const handleCancelOrder = async () => {
        if (!activeOrder) return;
        setLoading(true);
        try {
            const token = await getAccessToken();
            const res = await fetch('/api/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ orderId: activeOrder.id })
            });
            const data = await res.json();
            if (data.success) {
                alert("Order cancelled. Balance refunded.");
                setActiveOrder(null);
                setBalance(data.new_balance); // Update balance UI!
            } else {
                alert("Order already completed or expired."); // Fallback
                setActiveOrder(null);
            }
        } catch (e: unknown) {
            console.error(e);
            alert("Error cancelling order");
        } finally {
            setLoading(false);
        }
    };

    // ... existing handleBuy ... see next replace for update 



    return (
        <main className={`min-h-screen bg-[#09090b] text-white transition-all duration-300 ${isDropdownOpen || isCountryDropdownOpen ? 'pb-80' : 'pb-20'}`}>
            <Navbar />
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-white/60 text-sm mt-1">Manage your numbers and balance</p>
                    </div>
                    <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border-t border-l border-white/20 border-b border-r border-black/20 px-6 py-3 rounded-2xl flex flex-col items-end shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <span className="text-xs text-stone-400 uppercase font-semibold tracking-wider">Balance</span>
                        <span className="text-2xl font-bold text-[var(--color-primary)]">${balance.toFixed(2)}</span>
                    </div>
                </div>

                {/* Active Order Card */}
                {activeOrder && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-[var(--color-primary)]/30 shadow-[0_0_30px_rgba(132,94,194,0.15)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-primary)] animate-pulse"></div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-center md:text-left">
                                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-1">Active Order: {activeOrder.service}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl font-mono font-black text-white tracking-wider">{activeOrder.phone}</span>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(activeOrder.phone); alert('Copied!'); }}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <FaCopy className="text-stone-400 text-xl" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col items-center">
                                {activeOrder.status === 'completed' ? (
                                    <div className="bg-green-500/20 text-green-400 px-6 py-3 rounded-xl border border-green-500/30 flex flex-col items-center">
                                        <span className="font-bold text-sm uppercase">SMS Code</span>
                                        <span className="text-3xl font-mono font-black tracking-widest">{activeOrder.code}</span>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                                            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-ping"></div>
                                            Waiting for SMS...
                                        </div>
                                        <span className="font-mono text-2xl font-bold">
                                            {Math.floor((activeOrder.expiresAt - Date.now()) / 60000)}:
                                            {String(Math.floor(((activeOrder.expiresAt - Date.now()) % 60000) / 1000)).padStart(2, '0')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div>
                                {activeOrder.status === 'pending' && (
                                    <button
                                        onClick={handleCancelOrder}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold transition-all"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                                {activeOrder.status === 'completed' && (
                                    <button
                                        onClick={() => setActiveOrder(null)}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-all"
                                    >
                                        Dismiss
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Main Action Card */}
                <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border-t border-l border-white/20 border-b border-r border-black/20 rounded-3xl p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-visible mb-10 ring-1 ring-white/5 relative z-20">
                    <div className="grid grid-cols-2 p-1 bg-white/5 backdrop-blur-md rounded-2xl mb-6 mx-4 mt-4 relative">
                        <button
                            onClick={() => setActiveTab('order')}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'order'
                                ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/10'
                                : 'text-stone-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <FaShoppingCart className={activeTab === 'order' ? 'text-[var(--color-primary)]' : ''} />
                            Order Service
                        </button>
                        <button
                            onClick={() => setActiveTab('deposit')}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'deposit'
                                ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/10'
                                : 'text-stone-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <FaWallet className={activeTab === 'deposit' ? 'text-[var(--color-secondary)]' : ''} />
                            Add Funds
                        </button>
                    </div>

                    <div className="px-6 pb-8 pt-2">
                        {activeTab === 'order' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-30">
                                {/* Verification Method Toggle */}
                                <div className="bg-white/5 backdrop-blur-md p-1 rounded-xl border border-white/10 flex relative mb-4">
                                    <div
                                        className={`absolute h-[calc(100%-8px)] w-[calc(33.33%-4px)] top-1 rounded-lg bg-[var(--color-primary)] transition-all duration-300 ${verificationMethod === 'voice' ? 'left-[calc(33.33%+2px)]' :
                                            verificationMethod === 'rental' ? 'left-[calc(66.66%+2px)]' :
                                                'left-1'
                                            }`}
                                    ></div>
                                    <button
                                        onClick={() => setVerificationMethod('sms')}
                                        className={`flex-1 relative z-10 py-2 text-sm font-bold text-center transition-colors ${verificationMethod === 'sms' ? 'text-white' : 'text-stone-400 hover:text-white'}`}
                                    >
                                        SMS Verification
                                    </button>
                                    <button
                                        onClick={() => setVerificationMethod('voice')}
                                        className={`flex-1 relative z-10 py-2 text-sm font-bold text-center transition-colors ${verificationMethod === 'voice' ? 'text-white' : 'text-stone-400 hover:text-white'}`}
                                    >
                                        Voice Call Verification
                                    </button>
                                    <button
                                        onClick={() => setVerificationMethod('rental')}
                                        className={`flex-1 relative z-10 py-2 text-sm font-bold text-center transition-colors ${verificationMethod === 'rental' ? 'text-white' : 'text-stone-400 hover:text-white'}`}
                                    >
                                        Number Rentals
                                    </button>
                                </div>

                                {verificationMethod === 'rental' ? (
                                    <RentalSection userToken={userToken} />
                                ) : (
                                    <>
                                        {/* Country Selector */}
                                        <div className="space-y-2 relative z-20" ref={countryDropdownRef}>
                                            <label className="text-xs font-semibold uppercase text-stone-400 tracking-wider ml-1">Select Country</label>
                                            <button
                                                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                                className="w-full h-[52px] px-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white flex items-center justify-between hover:bg-white/10 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{selectedCountry.flag}</span>
                                                    <span className="font-medium text-lg">{selectedCountry.name}</span>
                                                </div>
                                                <FaChevronDown className={clsx("text-stone-500 transition-transform duration-300", isCountryDropdownOpen && "rotate-180")} />
                                            </button>

                                            <AnimatePresence>
                                                {isCountryDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-[400px] ring-1 ring-white/10 flex flex-col"
                                                    >
                                                        <div className="p-3 border-b border-white/10 bg-[#1a1a1a] sticky top-0 z-10">
                                                            <div className="relative">
                                                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                                                                <input
                                                                    autoFocus
                                                                    type="text"
                                                                    placeholder="Search countries..."
                                                                    value={countrySearchTerm}
                                                                    onChange={(e) => setCountrySearchTerm(e.target.value)}
                                                                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="overflow-y-auto custom-scrollbar flex-1">
                                                            {filteredCountries.length === 0 ? (
                                                                <div className="p-4 text-center text-stone-500 text-sm">No countries found</div>
                                                            ) : (
                                                                filteredCountries.map((country) => (
                                                                    <button
                                                                        key={country.code}
                                                                        onClick={() => {
                                                                            setSelectedCountry(country);
                                                                            setIsCountryDropdownOpen(false);
                                                                            setCountrySearchTerm(''); // Reset search on select
                                                                        }}
                                                                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                                                                    >
                                                                        <span className="text-2xl">{country.flag}</span>
                                                                        <span className="text-white font-medium">{country.name}</span>
                                                                    </button>
                                                                ))
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            {isCountryDropdownOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsCountryDropdownOpen(false)} />}
                                        </div>

                                        {/* Service Selection */}
                                        <div className="space-y-2 relative z-10">
                                            <label className="text-xs font-semibold uppercase text-stone-400 tracking-wider ml-1">Select Service</label>

                                            <div className="relative" ref={dropdownRef}>
                                                <button
                                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                    className="w-full bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 rounded-xl px-4 py-4 text-left flex items-center justify-between group transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-white">{selectedService.name}</span>
                                                            <span className="text-xs text-stone-400">{selectedService.id === '' ? 'Browse our full catalog' : 'Instant Delivery • High Success'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {selectedService.id !== '' && (
                                                            <span className="bg-white/10 px-2.5 py-1 rounded-md text-sm font-mono text-[var(--color-accent)]">
                                                                ${(verificationMethod === 'voice' ? 2.20 : (dynamicPrice || selectedService.price)).toFixed(2)}
                                                            </span>
                                                        )}
                                                        <FaChevronDown className={`text-stone-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </button>

                                                {/* Dropdown Menu */}
                                                {isDropdownOpen && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col ring-1 ring-white/10 overflow-hidden">
                                                        <div className="p-3 border-b border-white/10 bg-[#1a1a1a] z-10">
                                                            <div className="relative">
                                                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                                                                <input
                                                                    autoFocus
                                                                    type="text"
                                                                    placeholder="Search services..."
                                                                    value={searchTerm}
                                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="h-[300px]">
                                                            {filteredServices.length === 0 ? (
                                                                <div className="p-4 text-center text-stone-500 text-sm">No services found</div>
                                                            ) : (
                                                                <List<WrappedServiceRowData>
                                                                    style={{ width: '100%', height: 300 }}
                                                                    rowCount={filteredServices.length}
                                                                    rowHeight={60}
                                                                    rowComponent={ServiceRow}
                                                                    rowProps={{
                                                                        data: {
                                                                            items: filteredServices,
                                                                            onSelect: (svc: Service) => {
                                                                                setSelectedService(svc);
                                                                                setIsDropdownOpen(false);
                                                                                setSearchTerm('');
                                                                            },
                                                                            selectedId: selectedService.id,
                                                                            verificationMethod: verificationMethod,
                                                                            pinnedServices: pinnedServices,
                                                                            togglePin: togglePin
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                <div className="text-sm text-stone-400">
                                                    Total: <span className="text-white font-bold text-lg ml-2">
                                                        {verificationMethod === 'voice' ? '$2.20' :
                                                            (selectedService.id === '' ? '$0.00' :
                                                                fetchingPrice ? <span className="animate-pulse">...</span> :
                                                                    `$${(dynamicPrice || selectedService.price).toFixed(2)}`)}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={handleBuy}
                                                    disabled={loading || fetchingPrice}
                                                    className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                                                >
                                                    <FaMobileAlt />
                                                    {loading ? 'Processing...' : 'Buy Number'}
                                                </button>
                                            </div>
                                            {msg && (
                                                <div className={`mt-2 p-3 rounded-lg text-sm font-medium text-center ${msg.includes('Error') ? 'bg-red-500/20 text-red-200 border border-red-500/30' : 'bg-green-500/20 text-green-200 border border-green-500/30'}`}>
                                                    {msg}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <DepositSection
                                userEmail={userEmail}
                                onDepositSuccess={async () => {
                                    const token = await getAccessToken();
                                    if (token) fetchData(token);
                                }}
                            />
                        )}
                        {verificationMethod !== 'rental' && (
                            <>
                                <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                                    <span className="w-1 h-6 rounded-full bg-[var(--color-primary)]"></span>
                                    Recent {verificationMethod === 'voice' ? 'Calls' : 'SMS'}
                                </h2>
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-sm relative z-10">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-black/20 text-white/50 text-xs uppercase tracking-wider border-b border-white/10">
                                                <tr>
                                                    <th className="p-5 font-semibold">Service</th>
                                                    <th className="p-5 font-semibold">Number</th>
                                                    <th className="p-5 font-semibold">Type</th>
                                                    <th className="p-5 font-semibold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10 text-sm">
                                                {orders.filter(o => {
                                                    if (verificationMethod === 'voice') return o.type === 'voice';
                                                    return o.type === 'sms' || !o.type; // Default to SMS
                                                }).length === 0 ? (
                                                    <tr><td colSpan={4} className="p-10 text-center text-white/40">No history found for this category.</td></tr>
                                                ) : (
                                                    orders.filter(o => {
                                                        if (verificationMethod === 'voice') return o.type === 'voice';
                                                        return o.type === 'sms' || !o.type;
                                                    }).map((order) => (
                                                        <tr key={order.order_id || Math.random()} className="hover:bg-white/5 transition-colors">
                                                            <td className="p-5">
                                                                <div className="flex items-center gap-3">
                                                                    {/* Logo logic could go here */}
                                                                    <span className="font-medium text-white">{order.service || 'Unknown'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-5 font-mono text-white/80">{order.phone}</td>
                                                            <td className="p-5">
                                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.type === 'rental' ? 'bg-purple-500/10 text-purple-400' :
                                                                    order.type === 'voice' ? 'bg-orange-500/10 text-orange-400' :
                                                                        'bg-blue-500/10 text-blue-400'
                                                                    }`}>
                                                                    {order.type || 'SMS'}
                                                                </span>
                                                            </td>
                                                            <td className="p-5">
                                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'completed' || order.status === 'active' ? 'bg-green-500/10 text-green-400' :
                                                                    order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                                        'bg-red-500/10 text-red-400'
                                                                    }`}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}




                    </div >
                </div >
            </div >
        </main >
    );
}
