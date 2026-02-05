"use client";
import { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import { FaKey, FaTrash, FaCopy, FaCheck, FaExclamationTriangle, FaPlus, FaCode } from 'react-icons/fa';
import { supabase } from '../../../lib/supabaseClient';

interface ApiKey {
    id: string;
    key: string; // Masked from backend
    label: string;
    created_at: string;
    last_used_at: string | null;
}

export default function ApiDashboard() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [newToken, setNewToken] = useState<string | null>(null); // To show full key once
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                setToken(session.access_token);
                fetchKeys(session.access_token);
            }
        };
        init();
    }, []);

    const fetchKeys = async (authToken: string) => {
        try {
            const res = await fetch('/api/keys', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setKeys(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const generateKey = async () => {
        if (!token) return;
        setGenerating(true);
        try {
            const res = await fetch('/api/keys', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNewToken(data.key.key); // Show full key
                fetchKeys(token);
            }
        } catch (e) {
            alert('Failed to generate key');
        } finally {
            setGenerating(false);
        }
    };

    const revokeKey = async (id: string) => {
        if (!token || !confirm('Are you sure? This action cannot be undone.')) return;
        try {
            await fetch('/api/keys', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ id })
            });
            fetchKeys(token);
        } catch (e) {
            alert('Failed to revoke');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(text);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <main className="min-h-screen bg-[#09090b] text-white pb-20">
            <Navbar />
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-8">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FaKey className="text-[var(--color-primary)]" /> API Access
                    </h1>
                    <p className="text-white/60 text-sm mt-1">Programmatically access VoltSMS services.</p>
                </div>

                {/* Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8 flex gap-3">
                    <FaExclamationTriangle className="text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-yellow-500 text-sm">Security Notice</h4>
                        <p className="text-xs text-yellow-200/80 mt-1">
                            Your API keys carry the same privileges as your account. Never share them or expose them in client-side code (browsers).
                            Always store them securely on your backend.
                        </p>
                    </div>
                </div>

                {/* Active Keys */}
                <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Active Keys</h2>
                        <button
                            onClick={generateKey}
                            disabled={generating}
                            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/90 transition-colors flex items-center gap-2"
                        >
                            {generating ? 'Generating...' : <><FaPlus /> Generate New Key</>}
                        </button>
                    </div>

                    {/* New Token Display */}
                    {newToken && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                            <h4 className="font-bold text-green-400 text-sm mb-2">New Key Generated</h4>
                            <div className="bg-black/50 p-3 rounded-lg border border-green-500/30 flex items-center justify-between">
                                <code className="font-mono text-white text-sm break-all">{newToken}</code>
                                <button onClick={() => copyToClipboard(newToken)} className="ml-4 text-green-400 hover:text-white">
                                    <FaCopy />
                                </button>
                            </div>
                            <p className="text-xs text-green-400/60 mt-2">Make sure to copy it now. You won't be able to see it again.</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {loading && <div className="text-stone-500 text-sm animate-pulse">Loading keys...</div>}
                        {!loading && keys.length === 0 && <div className="text-stone-500 text-sm italic">No active API keys found.</div>}

                        {keys.map(k => (
                            <div key={k.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <div className="font-bold text-sm text-stone-300 mb-1">{k.label}</div>
                                    <div className="font-mono text-white/50 text-xs">{k.key}</div>
                                    <div className="text-[10px] text-stone-600 mt-1">Created: {new Date(k.created_at).toLocaleDateString()}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => revokeKey(k.id)}
                                        className="text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                    >
                                        <FaTrash size={12} /> Revoke
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Documentation */}
                <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FaCode /> API Documentation</h2>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">Authentication</h3>
                            <p className="text-stone-400 text-sm mb-3">All requests must include your API key in the Authorization header.</p>
                            <div className="bg-black/50 p-4 rounded-xl border border-white/10 font-mono text-sm text-stone-300 overflow-x-auto">
                                Authorization: Bearer sk_live_...
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Endpoints</h3>

                            <div className="space-y-6">
                                {/* Balance */}
                                <div className="border-l-2 border-blue-500 pl-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-bold">GET</span>
                                        <code className="text-sm text-stone-200">/api/v1/balance</code>
                                    </div>
                                    <p className="text-xs text-stone-500 mb-2">Check your current account balance (Validation).</p>
                                    <pre className="bg-black/50 p-3 rounded-lg text-xs text-stone-400 overflow-x-auto border border-white/5">
                                        {`curl -X GET https://voltsms.com/api/v1/balance \\
  -H "Authorization: Bearer sk_live_..."

// Response
{
  "balance": 10.50,
  "currency": "USD"
}`}
                                    </pre>
                                </div>

                                {/* Services */}
                                <div className="border-l-2 border-cyan-500 pl-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-xs font-bold">GET</span>
                                        <code className="text-sm text-stone-200">/api/v1/services</code>
                                    </div>
                                    <p className="text-xs text-stone-500 mb-2">List all available services and current prices (Discovery).</p>
                                    <pre className="bg-black/50 p-3 rounded-lg text-xs text-stone-400 overflow-x-auto border border-white/5">
                                        {`curl -X GET https://voltsms.com/api/v1/services \\
  -H "Authorization: Bearer sk_live_..."

// Response
{
  "services": [
    { "id": "openai", "name": "OpenAI", "price": 0.80, "category": "Other" },
    ...
  ]
}`}
                                    </pre>
                                </div>

                                {/* Order */}
                                <div className="border-l-2 border-green-500 pl-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-bold">POST</span>
                                        <code className="text-sm text-stone-200">/api/v1/order</code>
                                    </div>
                                    <p className="text-xs text-stone-500 mb-2">Purchase a verified number for a specific service (Action).</p>
                                    <pre className="bg-black/50 p-3 rounded-lg text-xs text-stone-400 overflow-x-auto border border-white/5">
                                        {`curl -X POST https://voltsms.com/api/v1/order \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "service": "openai", "country": "US" }'

// Response
{
  "id": "123456",
  "phone": "+15550199",
  "status": "pending"
}`}
                                    </pre>
                                </div>

                                {/* Status */}
                                <div className="border-l-2 border-purple-500 pl-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs font-bold">GET</span>
                                        <code className="text-sm text-stone-200">/api/v1/order/:id</code>
                                    </div>
                                    <p className="text-xs text-stone-500 mb-2">Check status and retrieve SMS code (Fulfillment).</p>
                                    <pre className="bg-black/50 p-3 rounded-lg text-xs text-stone-400 overflow-x-auto border border-white/5">
                                        {`curl -X GET https://voltsms.com/api/v1/order/123456 \\
  -H "Authorization: Bearer sk_live_..."

// Response (Pending)
{ "status": "pending", "code": null }

// Response (Completed)
{ "status": "completed", "code": "123456" }`}
                                    </pre>
                                </div>

                                {/* History */}
                                <div className="border-l-2 border-orange-500 pl-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-xs font-bold">GET</span>
                                        <code className="text-sm text-stone-200">/api/v1/history</code>
                                    </div>
                                    <p className="text-xs text-stone-500 mb-2">Retrieve your last 100 orders (Audit).</p>
                                    <pre className="bg-black/50 p-3 rounded-lg text-xs text-stone-400 overflow-x-auto border border-white/5">
                                        {`curl -X GET https://voltsms.com/api/v1/history \\
  -H "Authorization: Bearer sk_live_..."

// Response
[
  { "id": "123", "service": "openai", "status": "completed", ... },
  ...
]`}
                                    </pre>
                                </div>

                                {/* Cancel */}
                                <div className="border-l-2 border-red-500 pl-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-bold">POST</span>
                                        <code className="text-sm text-stone-200">/api/v1/cancel</code>
                                    </div>
                                    <p className="text-xs text-stone-500 mb-2">Cancel a pending order and receive an immediate refund (Management).</p>
                                    <pre className="bg-black/50 p-3 rounded-lg text-xs text-stone-400 overflow-x-auto border border-white/5">
                                        {`curl -X POST https://voltsms.com/api/v1/cancel \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "id": "123456" }'

// Response
{ "success": true, "message": "Order cancelled and refunded" }`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
