"use client";
import React, { useState, useEffect } from 'react';
import { FaSave, FaEye, FaEyeSlash, FaEdit, FaServer, FaPaypal, FaCreditCard, FaDatabase } from 'react-icons/fa';

// Map specific keys to providers
const PROVIDERS = [
    {
        id: 'paypal',
        name: 'PayPal',
        icon: <FaPaypal className="text-blue-500" />,
        keys: ['PAYPAL_CLIENT_ID', 'PAYPAL_SECRET']
    },
    {
        id: 'smspool',
        name: 'SMSPool',
        icon: <FaServer className="text-purple-500" />,
        keys: ['SMSPOOL_API_KEY']
    },
    {
        id: 'oxapay',
        name: 'Oxapay',
        icon: <FaCreditCard className="text-green-500" />,
        keys: ['OXAPAY_MERCHANT_KEY']
    },
    {
        id: 'paystack',
        name: 'Paystack',
        icon: <FaCreditCard className="text-cyan-500" />,
        keys: ['PAYSTACK_SECRET_KEY']
    },
    {
        id: 'supabase',
        name: 'Supabase',
        icon: <FaDatabase className="text-emerald-500" />,
        keys: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    {
        id: 'telegram',
        name: 'Support Email',
        icon: <FaServer className="text-blue-400" />,
        keys: ['BOT_TOKEN', 'ADMIN_ID']
    },
    {
        id: 'webshare',
        name: 'Webshare',
        icon: <FaServer className="text-orange-500" />,
        keys: ['WEBSHARE_API_KEY']
    }
];

export default function APIsPage() {
    const [envVars, setEnvVars] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState<string | null>(null); // Provider ID being edited
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [showValues, setShowValues] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetch('/api/admin/env')
            .then(res => res.json())
            .then(data => {
                setEnvVars(data);
                setLoading(false);
            });
    }, []);

    const handleEdit = (providerId: string) => {
        const provider = PROVIDERS.find(p => p.id === providerId);
        if (!provider) return;

        const currentData: Record<string, string> = {};
        provider.keys.forEach(key => {
            currentData[key] = envVars[key] || '';
        });
        setFormData(currentData);
        setEditMode(providerId);
    };

    const handleCancel = () => {
        setEditMode(null);
        setFormData({});
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const updatedEnv = { ...envVars, ...formData };

        try {
            await fetch('/api/admin/env', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEnv)
            });
            setEnvVars(updatedEnv);
            setEditMode(null);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error("Failed to save env", error);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const toggleShow = (key: string) => {
        setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) return <div className="text-white p-8">Loading configuration...</div>;

    return (
        <div className="max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2">Service Integrations</h1>
                <p className="text-stone-400">Manage API keys for external services. Keys are stored in secure environment variables.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PROVIDERS.map((provider) => {
                    const isEditing = editMode === provider.id;

                    return (
                        <div key={provider.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl bg-white/5 p-3 rounded-xl">
                                        {provider.icon}
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{provider.name}</h2>
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => handleEdit(provider.id)}
                                        className="text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4 mt-2">
                                {isEditing ? (
                                    <form onSubmit={handleSave} className="space-y-4">
                                        {provider.keys.map(key => (
                                            <div key={key}>
                                                <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">{key}</label>
                                                <input
                                                    type="text"
                                                    value={formData[key]}
                                                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                                                    className="w-full bg-black/50 border border-purple-500/50 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                        ))}
                                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="px-4 py-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-bold"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                                            >
                                                <FaSave /> Save
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    provider.keys.map(key => (
                                        <div key={key}>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">{key}</label>
                                                <button onClick={() => toggleShow(key)} className="text-stone-600 hover:text-stone-400 text-xs">
                                                    {showValues[key] ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                            <div className="bg-black/30 rounded-lg px-3 py-2 font-mono text-sm text-stone-300 truncate border border-white/5">
                                                {showValues[key] ? (envVars[key] || <span className="text-stone-600 italic">Not Set</span>) : '••••••••••••••••••••••••'}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
