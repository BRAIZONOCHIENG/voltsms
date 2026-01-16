"use client";
import React, { useState } from 'react';
import { FaSave, FaPalette, FaGlobe } from 'react-icons/fa';

export default function AdminSettingsPage() {
    const [siteName, setSiteName] = useState('VoltSMS');
    const [primaryColor, setPrimaryColor] = useState('#a855f7'); // purple-500

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-black text-white mb-2">Site Settings</h1>
            <p className="text-stone-400 mb-8">Customize global site appearance and content.</p>

            <div className="space-y-8">
                {/* General Settings */}
                <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl">
                            <FaGlobe />
                        </div>
                        <h2 className="text-xl font-bold text-white">General Information</h2>
                    </div>

                    <div className="grid gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Site Name</label>
                            <input
                                type="text"
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Support Email</label>
                            <input
                                type="email"
                                defaultValue="support@voltsms.vercel.app"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>
                </section>

                {/* Appearance */}
                <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-xl">
                            <FaPalette />
                        </div>
                        <h2 className="text-xl font-bold text-white">Design & Branding</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-stone-500 mb-2">Primary Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="h-12 w-12 rounded-xl bg-transparent border-0 cursor-pointer"
                                />
                                <span className="font-mono text-stone-300">{primaryColor}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end">
                    <button className="bg-white text-black hover:bg-stone-200 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
                        <FaSave />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
