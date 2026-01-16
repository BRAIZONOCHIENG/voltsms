"use client";
import React, { useState } from 'react';
import { FaPlus, FaTrash, FaKey, FaToggleOn, FaToggleOff } from 'react-icons/fa';

export default function AdminPaymentsPage() {
    // Mock Data
    const [methods, setMethods] = useState([
        { id: 1, name: 'Stripe', type: 'Credit Card', active: true, publicKey: 'pk_test_...' },
        { id: 2, name: 'PayPal', type: 'Wallet', active: true, clientId: 'sb-...' },
        { id: 3, name: 'Oxapay', type: 'Crypto', active: true, apiKey: 'ox_...' },
    ]);

    const toggleMethod = (id: number) => {
        setMethods(methods.map(m => m.id === id ? { ...m, active: !m.active } : m));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white">Payment Gateways</h1>
                    <p className="text-stone-400">Configure APIs and payment methods.</p>
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
                    <FaPlus />
                    Add Gateway
                </button>
            </div>

            <div className="grid gap-6">
                {methods.map((method) => (
                    <div key={method.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                            {method.name[0]}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-white">{method.name}</h3>
                                <span className="bg-white/10 text-stone-300 px-2 py-0.5 rounded text-xs font-bold uppercase">{method.type}</span>
                            </div>
                            <div className="flex items-center gap-2 text-stone-500 text-sm font-mono">
                                <FaKey className="text-xs" />
                                {method.name === 'Stripe' ? method.publicKey : method.apiKey || method.clientId}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 self-end md:self-center">
                            <button
                                onClick={() => toggleMethod(method.id)}
                                className={`text-2xl transition-colors ${method.active ? 'text-green-400 hover:text-green-300' : 'text-stone-600 hover:text-stone-500'}`}
                            >
                                {method.active ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <button className="p-2 hover:bg-red-500/10 rounded-lg text-stone-400 hover:text-red-500 transition-colors">
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
