"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    category: string;
}

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        fetch('/api/admin/blog')
            .then(res => res.json())
            .then(data => setPosts(data));
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        await fetch(`/api/admin/blog?id=${id}`, { method: 'DELETE' });
        setPosts(posts.filter(p => p.id !== id));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white">Blog Posts</h1>
                    <p className="text-stone-400">Manage your articles and tutorials.</p>
                </div>
                <Link href="/admin/blog/new">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
                        <FaPlus />
                        New Post
                    </button>
                </Link>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/20 border-b border-white/10">
                        <tr>
                            <th className="p-4 text-xs font-bold uppercase text-stone-400">Title</th>
                            <th className="p-4 text-xs font-bold uppercase text-stone-400">Slug</th>
                            <th className="p-4 text-xs font-bold uppercase text-stone-400">Date</th>
                            <th className="p-4 text-xs font-bold uppercase text-stone-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-stone-500">
                                    No blog posts found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            posts.map((post) => (
                                <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{post.title}</div>
                                        <div className="text-xs text-stone-500">{post.category}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-stone-400 font-mono">/{post.slug}</span>
                                    </td>
                                    <td className="p-4 text-sm text-stone-400">{post.date}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Link to Edit Page - To be created */}
                                            <Link href={`/admin/blog/edit/${post.id}`}>
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-stone-400 hover:text-white transition-colors">
                                                    <FaEdit />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-stone-400 hover:text-red-500 transition-colors"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
