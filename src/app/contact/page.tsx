"use client";
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { MagneticButton } from '../../components/MagneticButton';

export default function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            });

            if (res.ok) {
                setStatus('success');
                setName('');
                setEmail('');
                setMessage('');
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <main className="min-h-screen bg-transparent pb-20 text-white">
            <Navbar />
            <div className="container mx-auto px-6 max-w-4xl py-12">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-10 shadow-xl">
                    <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">Contact Us</h1>

                    <div className="prose prose-invert max-w-none text-white/80 leading-relaxed text-sm md:text-base mb-10">
                        <p>
                            Our support team is dedicated to ensuring your experience is seamless. Whether you have a technical inquiry, a billing question, or need assistance with a specific verification, we are here to help 24/7.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div className="bg-black/20 rounded-xl p-8 border border-white/5">
                            <h3 className="text-xl font-bold text-white mb-6">Send us a Message</h3>

                            {status === 'success' ? (
                                <div className="bg-green-500/20 text-green-300 p-6 rounded-xl border border-green-500/30 text-center">
                                    <h4 className="font-bold text-lg mb-2">Message Sent!</h4>
                                    <p className="text-sm">We'll get back to you shortly.</p>
                                    <button onClick={() => setStatus('idle')} className="mt-4 text-xs underline hover:text-white">Send another</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Message</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            required
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                            placeholder="How can we help you?"
                                        ></textarea>
                                    </div>

                                    {status === 'error' && (
                                        <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded">Failed to send message. Please try again.</div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'submitting'}
                                        className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-stone-200 transition-colors disabled:opacity-50"
                                    >
                                        {status === 'submitting' ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Info Section */}
                        <div className="space-y-6">
                            <div className="bg-black/20 rounded-xl p-8 border border-white/5">
                                <h3 className="text-xl font-bold text-white mb-4">General Inquiries</h3>
                                <p className="text-white/60 mb-6 text-sm">
                                    For general questions about our services, partnership opportunities, or media inquiries, please email us. We aim to respond within 24 hours.
                                </p>
                                <a href="mailto:support@voltsms.store" className="text-[var(--color-primary)] font-bold hover:text-white transition-colors">
                                    support@voltsms.store
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 border-t border-white/10 pt-10">
                        <h3 className="text-xl font-bold text-white mb-4">Business Address</h3>
                        <p className="text-white/60 text-sm">
                            VoltSMS Digital Ltd.<br />
                            71-75 Shelton Street<br />
                            Covent Garden, London<br />
                            United Kingdom, WC2H 9JQ
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
