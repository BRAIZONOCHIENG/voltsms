"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaMobileAlt, FaClock, FaHistory, FaBolt, FaInfinity, FaCheckCircle, FaExclamationTriangle, FaSearch, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_SERVICES, Service } from '../app/dashboard/services';
import { COUNTRIES, Country } from '../app/dashboard/countries';
import { FixedSizeList as List } from 'react-window';
import clsx from 'clsx';
// Import ServiceRow helper or re-define simplified version for this dropdown
// Re-defining simplified version to avoid circular dependency or complex prop drilling if ServiceRow is complex
// Ideally should export ServiceRow from page or separate component file.

// We will create a local row renderer or reuse if we extract it.
// For now, let's build the dropdowns inline similar to page.tsx to match style.

interface Rental {
    id: string;
    phone_number: string;
    service: string;
    country: string;
    expires_at: string;
    status: string;
}

const UNLIMITED_SERVICE = { id: 'unlimited', name: 'Unlimited Services', price: 10.00, category: 'Premium' };
const ALL_SERVICES = [UNLIMITED_SERVICE, ...Array.from(new Map(MOCK_SERVICES.filter(s => s.id !== 'custom').map(s => [s.id, s])).values())];


export default function RentalSection({ userToken }: { userToken: string | null }) {
    const [subTab, setSubTab] = useState<'active' | 'history' | 'billing'>('active');
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(false);

    // Purchase State

    // Purchase State
    const [selectedDuration, setSelectedDuration] = useState(30);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES.find(c => c.code === 'US') || COUNTRIES[0]);
    const [areaCode, setAreaCode] = useState('');
    const [isAutoCheck, setIsAutoCheck] = useState(false);
    const [isAutoRenew, setIsAutoRenew] = useState(false); // Default Off
    const [isBuying, setIsBuying] = useState(false);

    // Dropdown States
    const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
    const [serviceSearchTerm, setServiceSearchTerm] = useState('');
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [countrySearchTerm, setCountrySearchTerm] = useState('');

    // Inbox State
    const [expandedRentalId, setExpandedRentalId] = useState<string | null>(null);
    const [inboxMessages, setInboxMessages] = useState<{ message: string; sender: string; timestamp: string; code?: string }[]>([]);
    const [loadingInbox, setLoadingInbox] = useState(false);

    const toggleInbox = async (rentalId: string) => {
        if (expandedRentalId === rentalId) {
            setExpandedRentalId(null);
            setInboxMessages([]);
        } else {
            setExpandedRentalId(rentalId);
            fetchRentalMessages(rentalId);
        }
    };

    const fetchRentalMessages = async (rentalId: string) => {
        if (!userToken) return;
        setLoadingInbox(true);
        try {
            const res = await fetch('/api/rentals/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
                body: JSON.stringify({ rentalId })
            });
            const data = await res.json();
            if (res.ok && data.messages) {
                setInboxMessages(data.messages);
            } else {
                setInboxMessages([]); // No messages or error
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingInbox(false);
        }
    };

    useEffect(() => {
        if (userToken) fetchRentals();
    }, [userToken]);

    // Auto-switch duration if 1 Day is selected for Unlimited Service (which requires min 3 days)
    useEffect(() => {
        if (selectedService?.id === 'unlimited' && selectedDuration === 1) {
            setSelectedDuration(3);
        }
    }, [selectedService, selectedDuration]);

    // Disable Auto-Renew if duration < 30
    useEffect(() => {
        if (selectedDuration < 30) {
            setIsAutoRenew(false);
        }
    }, [selectedDuration]);

    const fetchRentals = async () => {
        if (!userToken) return;
        setLoading(true);
        try {
            const res = await fetch('/api/rentals', {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRentals(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!userToken || !selectedService) return;
        setIsBuying(true);
        try {
            const res = await fetch('/api/rentals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    country: selectedCountry.code,
                    days: selectedDuration,
                    service: selectedService.id,
                    autoCheck: isAutoCheck,
                    autoRenew: isAutoRenew, // Pass autoRenew
                    areaCode: areaCode // Add to API if supported
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Rental Successful!');
                fetchRentals();
            } else {
                alert('Purchase Failed: ' + data.error);
            }
        } catch (e) {
            alert('Error purchasing rental');
        } finally {
            setIsBuying(false);
        }
    };

    // Filter Lists
    const filteredServices = useMemo(() => ALL_SERVICES.filter(s =>
        s.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(serviceSearchTerm.toLowerCase())
    ), [serviceSearchTerm]);
    const filteredCountries = useMemo(() => COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
    ), [countrySearchTerm]);



    // Pricing Logic
    const calculatePrice = () => {
        const POPULAR_SERVICES = [
            'tinder', 'whatsapp', 'telegram', 'google', 'facebook', 'instagram', 'tiktok',
            'ticketmaster', 'blizzard', 'riot', 'openai', 'chatgpt'
        ];

        // 1. Determine Base Monthly Reference Price
        // Targeted to undercut TextVerified (Tinder 30d ~ $3.00)
        let monthlyRef = 1.60; // Standard default

        if (!selectedService) {
            monthlyRef = 0;
        } else if (selectedService.id === 'unlimited') {
            monthlyRef = 9.50; // Unlimited Base
        } else {
            const lowerName = selectedService.name.toLowerCase();
            // Check if name contains any of the popular keys
            const isPopular = POPULAR_SERVICES.some(key => lowerName.includes(key));
            if (isPopular) {
                monthlyRef = 3.60; // Popular Base (Target ~$3.60 vs TV $4.00)
            } else {
                monthlyRef = 2.00; // Standard Base (Bumped from 1.60)
            }
        }

        // 2. Country Scalar - Uniform Pricing (US Standard)
        // User Request: Prices remain same across all countries, using US prices.
        const countryMultiplier = 1.0;

        // 3. Duration Scalar
        // Curve adjusted to charge premium for short term while keeping long term cheap
        // Derived from TV Curve: 1d (~12x), 3d (~5x), 7d (~2.7x), 14d (~1.8x), 30d (1x)
        let durationFactor = 1.0;
        if (selectedDuration === 1) durationFactor = 12.0;
        else if (selectedDuration === 3) durationFactor = 5.0;
        else if (selectedDuration === 7) durationFactor = 2.7;
        else if (selectedDuration === 14) durationFactor = 1.8;
        else if (selectedDuration === 30) durationFactor = 1.0;
        else if (selectedDuration === 90) durationFactor = 0.9;
        else if (selectedDuration === 365) durationFactor = 0.8;

        // 4. Calculate Base Price
        // Formula: (MonthlyRef / 30) * Days * DurationFactor * CountryMultiplier
        const dailyBase = monthlyRef / 30;
        let basePrice = dailyBase * selectedDuration * durationFactor * countryMultiplier;

        // Minimum floor
        if (basePrice < 0.50) basePrice = 0.50;

        let total = basePrice;

        // Auto Check Fee
        if (isAutoCheck) {
            total += 0.30; // Flat fee
        }

        return total.toFixed(2);
    };

    const durationOptions = [
        { d: 1, label: '1 Day' },
        { d: 3, label: '3 Days' },
        { d: 7, label: '7 Days' },
        { d: 14, label: '14 Days' },
        { d: 30, label: '30 Days' },
        { d: 90, label: '90 Days' },
        { d: 365, label: '1 Year' },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                <button
                    onClick={() => setSubTab('active')}
                    className={`pb-2 text-sm font-bold transition-colors border-b-2 ${subTab === 'active' ? 'border-[var(--color-primary)] text-white' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
                >
                    Active Rentals
                </button>
                <button
                    onClick={() => setSubTab('history')}
                    className={`pb-2 text-sm font-bold transition-colors border-b-2 ${subTab === 'history' ? 'border-[var(--color-primary)] text-white' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
                >
                    History
                </button>
            </div>

            {subTab === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Create Rental Panel */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaBolt className="text-[var(--color-primary)]" />
                            New Rental
                        </h3>

                        {/* Service Search Dropdown */}
                        <div className="mb-4 relative">
                            <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2 block">Service</label>
                            <button
                                onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-left flex items-center justify-between hover:bg-white/5 transition-all"
                            >
                                <span className={selectedService?.id === 'unlimited' ? 'text-[var(--color-primary)] font-bold' : 'text-white font-medium'}>
                                    {selectedService ? selectedService.name : 'Select Service'}
                                </span>
                                <FaChevronDown className="text-stone-500 text-xs" />
                            </button>

                            <AnimatePresence>
                                {isServiceDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 flex flex-col ring-1 ring-white/10"
                                    >
                                        <div className="p-3 border-b border-white/10">
                                            <div className="relative">
                                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                                                <input
                                                    autoFocus
                                                    placeholder="Search..."
                                                    value={serviceSearchTerm}
                                                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="h-[300px]">
                                            <List
                                                height={300}
                                                itemCount={filteredServices.length}
                                                itemSize={60}
                                                width="100%"
                                                itemData={{
                                                    items: filteredServices,
                                                    onSelect: (s: Service) => {
                                                        setSelectedService(s);
                                                        setIsServiceDropdownOpen(false);
                                                        setServiceSearchTerm('');
                                                    },
                                                    selectedId: selectedService?.id
                                                }}
                                            >
                                                {({ index, style, data }: any) => {
                                                    const s = data.items[index];
                                                    const isSelected = data.selectedId === s.id;
                                                    if (!s) return <div style={style} />;

                                                    return (
                                                        <div style={style}>
                                                            <button
                                                                onClick={() => data.onSelect(s)}
                                                                className={`w-full text-left px-4 py-2 flex items-center justify-between group transition-colors ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                                                style={{ height: '100%' }}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold uppercase text-white/50">
                                                                        {s.name ? s.name.substring(0, 2) : '??'}
                                                                    </div>
                                                                    <div>
                                                                        <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-stone-300 group-hover:text-white'}`}>{s.name}</div>
                                                                        <div className="text-[10px] text-stone-500 uppercase tracking-wider">{s.category}</div>
                                                                    </div>
                                                                </div>
                                                                {s.id === 'unlimited' && <span className="text-xs bg-[var(--color-primary)] text-black px-2 py-0.5 rounded-full font-bold">PRO</span>}
                                                            </button>
                                                        </div>
                                                    );
                                                }}
                                            </List>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {isServiceDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsServiceDropdownOpen(false)} />}
                        </div>

                        {/* Country Dropdown */}
                        <div className="mb-4 relative">
                            <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2 block">Country</label>
                            <button
                                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-left flex items-center justify-between hover:bg-white/5 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{selectedCountry.flag}</span>
                                    <span className="text-white font-medium">{selectedCountry.name}</span>
                                </div>
                                <FaChevronDown className="text-stone-500 text-xs" />
                            </button>

                            <AnimatePresence>
                                {isCountryDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 flex flex-col ring-1 ring-white/10 max-h-[300px]"
                                    >
                                        <div className="p-3 border-b border-white/10 sticky top-0 bg-[#1a1a1a] z-10">
                                            <div className="relative">
                                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                                                <input
                                                    autoFocus
                                                    placeholder="Search country..."
                                                    value={countrySearchTerm}
                                                    onChange={(e) => setCountrySearchTerm(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="overflow-y-auto custom-scrollbar">
                                            {filteredCountries.map(c => (
                                                <button
                                                    key={c.code}
                                                    onClick={() => {
                                                        setSelectedCountry(c);
                                                        setIsCountryDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors"
                                                >
                                                    <span className="text-xl">{c.flag}</span>
                                                    <span className="text-sm text-white font-medium">{c.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {isCountryDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsCountryDropdownOpen(false)} />}
                        </div>

                        {/* Duration Selector */}
                        <div className="mb-4">
                            <label className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2 block">Duration</label>
                            <div className="grid grid-cols-3 gap-2">
                                {durationOptions.map(opt => {
                                    const isDisabled = selectedService?.id === 'unlimited' && opt.d === 1;
                                    return (
                                        <button
                                            key={opt.d}
                                            onClick={() => !isDisabled && setSelectedDuration(opt.d)}
                                            disabled={isDisabled}
                                            className={`py-2 rounded-lg text-xs font-bold border transition-all 
                                                ${selectedDuration === opt.d
                                                    ? 'bg-white/10 border-white/30 text-white'
                                                    : 'bg-transparent border-white/10 text-stone-500 hover:text-stone-300'}
                                                ${isDisabled ? 'opacity-30 cursor-not-allowed hover:text-stone-500' : ''}
                                            `}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>


                        {/* Auto-Renew Toggle (Only for 30+ Days) */}
                        <div
                            className={`mb-4 p-4 rounded-xl border transition-all ${selectedDuration < 30 ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed' :
                                isAutoRenew ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]' : 'bg-black/20 border-white/10 hover:border-white/30 cursor-pointer'
                                }`}
                            onClick={() => selectedDuration >= 30 && setIsAutoRenew(!isAutoRenew)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedDuration < 30 ? 'border-stone-700' :
                                        isAutoRenew ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-black' : 'border-stone-500'
                                        }`}>
                                        {isAutoRenew && <FaCheckCircle className="text-xs" />}
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-bold flex items-center gap-2 ${selectedDuration < 30 ? 'text-stone-500' :
                                            isAutoRenew ? 'text-[var(--color-primary)]' : 'text-white'
                                            }`}>
                                            <FaInfinity className="text-xs" /> Renew Automatically
                                        </h4>
                                        <p className="text-xs text-stone-500">
                                            {selectedDuration < 30
                                                ? 'Available for 30+ day rentals only'
                                                : 'Auto-extends rental if funds available'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Auto-Check Toggle */}
                        <div
                            className={`mb-4 p-4 rounded-xl border transition-all ${isAutoCheck ? 'bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/50' : 'bg-black/20 border-white/10'}`}
                        >
                            <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setIsAutoCheck(!isAutoCheck)}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isAutoCheck ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)] text-black' : 'border-stone-500'}`}>
                                        {isAutoCheck && <FaCheckCircle className="text-xs" />}
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-bold ${isAutoCheck ? 'text-white' : 'text-stone-400'}`}>Always-On Checking</h4>
                                        <p className="text-xs text-stone-500">Keep line active 24/7</p>
                                    </div>
                                </div>
                                <span className="text-xs font-mono text-stone-400">+$0.30</span>
                            </div>

                            {/* Custom Area Code Input (Only visible if Auto-Check is ON - as per user request to be at bottom of this section? Or just generally here) */}
                            {/* "at the bottom of Always-On Checking add Custom Area Code option" */}
                            <div className="pt-3 border-t border-white/5">
                                <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest mb-1.5 block">Custom Area Code (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 404"
                                    value={areaCode}
                                    onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').substring(0, 5))}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder-white/20"
                                />
                            </div>
                        </div>


                        {/* Checkout */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div>
                                <span className="block text-xs text-stone-500">Total Price</span>
                                <span className="text-2xl font-bold text-white">${calculatePrice()}</span>
                            </div>
                            <button
                                onClick={handlePurchase}
                                disabled={isBuying || !selectedService}
                                className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-stone-200 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isBuying ? 'Processing...' : 'Rent Number'}
                            </button>
                        </div>
                    </div>

                    {/* Active Rentals List */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2 pl-1">Your Numbers</h3>
                        {loading ? (
                            <div className="text-stone-500 text-sm animate-pulse">Loading rentals...</div>
                        ) : rentals.length === 0 ? (
                            <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-stone-500">
                                <FaMobileAlt className="mx-auto text-3xl mb-3 opacity-20" />
                                No active rentals
                            </div>
                        ) : (
                            rentals.map(rental => {
                                const expiryDate = new Date(rental.expires_at);
                                const now = new Date();
                                const diffMs = expiryDate.getTime() - now.getTime();
                                const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                const isExpired = diffMs < 0;

                                return (
                                    <div
                                        key={rental.id}
                                        className={`bg-white/5 border rounded-xl p-4 flex flex-col gap-3 group transition-all cursor-pointer ${expandedRentalId === rental.id ? 'border-[var(--color-primary)] bg-white/10' : 'border-white/10 hover:border-white/20'}`}
                                        onClick={() => toggleInbox(rental.id)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                                                    <FaMobileAlt />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-mono font-bold text-lg text-white">{rental.phone_number}</div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(rental.phone_number); }}
                                                            className="text-stone-500 hover:text-white transition-colors p-1"
                                                            title="Copy Number"
                                                        >
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H176a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h172v330a6 6 0 0 1-6 6z"></path></svg>
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-stone-400 uppercase tracking-wider flex items-center gap-2">
                                                        <span className="flex items-center gap-1">
                                                            {COUNTRIES.find(c => c.name === rental.country)?.flag || '🏳️'} {rental.country}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{rental.service}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Status Badge */}
                                            <div className="text-right">
                                                <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${isExpired ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                                    {isExpired ? 'Expired' : 'Active'}
                                                </span>
                                                <div className="text-[10px] text-stone-500 mt-1 flex items-center justify-end gap-1">
                                                    <FaClock className="text-[10px]" />
                                                    {isExpired
                                                        ? 'Expired'
                                                        : `${daysLeft}d left`
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        {/* Inbox Section */}
                                        <AnimatePresence>
                                            {expandedRentalId === rental.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                                                >
                                                    <div className="mt-4 pt-4 border-t border-white/10 bg-black/20 rounded-lg p-4">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                                <FaHistory className="text-[var(--color-primary)]" /> Inbox
                                                            </h4>
                                                            <button
                                                                onClick={() => fetchRentalMessages(rental.id)}
                                                                className="text-xs text-[var(--color-primary)] hover:text-white transition-colors flex items-center gap-1"
                                                            >
                                                                Refresh <FaClock className={`text-[10px] ${loadingInbox ? 'animate-spin' : ''}`} />
                                                            </button>
                                                        </div>

                                                        {loadingInbox ? (
                                                            <div className="text-center py-4 text-white/30 text-xs">Checking messages...</div>
                                                        ) : inboxMessages.length === 0 ? (
                                                            <div className="text-center py-4 text-white/30 text-xs">No messages received yet.</div>
                                                        ) : (
                                                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                                                {inboxMessages.map((msg, idx) => (
                                                                    <div key={idx} className="bg-white/5 p-2 rounded text-sm border-l-2 border-[var(--color-primary)]">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <span className="font-bold text-white/90 text-xs">{msg.sender}</span>
                                                                            <span className="text-[10px] text-white/40">{msg.timestamp}</span>
                                                                        </div>
                                                                        <div className="text-white/70 break-words">{msg.message}</div>
                                                                        {msg.code && (
                                                                            <div className="mt-1 font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded w-fit text-xs">
                                                                                Code: {msg.code}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div >
            )
            }

            {
                subTab === 'history' && (
                    <div className="text-center py-20 text-stone-500">
                        <FaHistory className="text-4xl mx-auto mb-4 opacity-20" />
                        <p>No historical data available yet.</p>
                    </div>
                )
            }
        </div >
    );
}
