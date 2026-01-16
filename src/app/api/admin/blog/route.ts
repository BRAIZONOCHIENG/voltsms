import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/json-db';
import { MOCK_POSTS } from '../../../blog/data';

const BLOG_FILE = 'blogs.json';

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    category: string;
}

async function ensurePosts() {
    let posts = await readJson<BlogPost[]>(BLOG_FILE, []);
    if (posts.length === 0) {
        // Seed with mock data
        posts = MOCK_POSTS;
        await writeJson(BLOG_FILE, posts);
    }
    return posts;
}

export async function GET() {
    const posts = await ensurePosts();
    return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    let posts = await ensurePosts(); // Ensure we have data before adding

    // Simple ID generation
    const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;

    const newPost: BlogPost = {
        id: newId,
        ...body,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    posts.push(newPost);
    await writeJson(BLOG_FILE, posts);

    return NextResponse.json(newPost);
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { id, ...updates } = body;

    let posts = await readJson<BlogPost[]>(BLOG_FILE, []);
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    posts[index] = { ...posts[index], ...updates };
    await writeJson(BLOG_FILE, posts);

    return NextResponse.json(posts[index]);
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    let posts = await readJson<BlogPost[]>(BLOG_FILE, []);
    posts = posts.filter(p => p.id !== id);
    await writeJson(BLOG_FILE, posts);

    return NextResponse.json({ success: true });
}
