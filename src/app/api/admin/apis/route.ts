import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/json-db';

const APIS_FILE = 'apis.json';

export interface ApiConfig {
    id: string;
    name: string;
    endpoint: string;
    key: string;
    isActive: boolean;
}

export async function GET() {
    const apis = await readJson<ApiConfig[]>(APIS_FILE, []);
    return NextResponse.json(apis);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const apis = await readJson<ApiConfig[]>(APIS_FILE, []);

    const newApi: ApiConfig = {
        id: Date.now().toString(),
        ...body,
        isActive: true
    };

    apis.push(newApi);
    await writeJson(APIS_FILE, apis);

    return NextResponse.json(newApi);
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { id, ...updates } = body;

    let apis = await readJson<ApiConfig[]>(APIS_FILE, []);
    const index = apis.findIndex(a => a.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'API not found' }, { status: 404 });
    }

    apis[index] = { ...apis[index], ...updates };
    await writeJson(APIS_FILE, apis);

    return NextResponse.json(apis[index]);
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    let apis = await readJson<ApiConfig[]>(APIS_FILE, []);
    apis = apis.filter(a => a.id !== id);
    await writeJson(APIS_FILE, apis);

    return NextResponse.json({ success: true });
}
