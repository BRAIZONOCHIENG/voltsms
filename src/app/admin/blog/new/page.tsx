"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

export default function NewBlogPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'Tutorial',
        excerpt: '',
        content: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/admin/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            router.push('/admin/blog');
        } catch (error) {
            console.error("Failed to create post", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors">
                    <FaArrowLeft />
                </button>
                <h1 className="text-3xl font-black text-white">New Blog Post</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-2">Title</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                            placeholder="e.g. How to Verify Discord"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-2">Slug</label>
                        <input
                            required
                            type="text"
                            value={formData.slug}
                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                            placeholder="e.g. verify-discord-sms"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-2">Category</label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                        >
                            <option>Tutorial</option>
                            <option>News</option>
                            <option>Update</option>
                            <option>Guide</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-2">Excerpt</label>
                        <input
                            required
                            type="text"
                            value={formData.excerpt}
                            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                            placeholder="Short summary for the card..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-400 mb-2">Content (Markdown)</label>
                    <textarea
                        required
                        rows={10}
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none font-mono text-sm"
                        placeholder="# Heading&#10;&#10;Write your post content here..."
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
                    >
                        <FaSave />
                        Publish Post
                    </button>
                </div>
            </form>
        </div>
    );
}
