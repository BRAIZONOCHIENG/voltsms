import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { data: keys, error } = await supabaseAdmin
            .from('api_keys')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch keys error:', error);
            return NextResponse.json({ error: 'Failed to fetch keys' }, { status: 500 });
        }

        // Mask keys for display (show only last 4 chars? Or show full key? Usually show full key only once on creation, but for MVP we might just show them or mask them)
        // Ideally, we show full key only on creation. But simple implementations often just show them.
        // Let's Mask them for security: sk_live_...XXXX
        // Wait, if user forgets, they delete and create new.
        const maskedKeys = keys.map(k => ({
            ...k,
            key: `sk_live_...${k.key.slice(-4)}`
        }));

        return NextResponse.json(maskedKeys);

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        // Generate Key
        const randomBytes = crypto.randomBytes(24).toString('hex');
        const newKey = `sk_live_${randomBytes}`;

        const { data, error } = await supabaseAdmin
            .from('api_keys')
            .insert({
                user_id: user.id,
                key: newKey,
                label: 'Default Key'
            })
            .select()
            .single();

        if (error) {
            console.error('Create key error:', error);
            return NextResponse.json({ error: 'Failed to create key' }, { status: 500 });
        }

        return NextResponse.json({ success: true, key: data });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await req.json();
        const { id } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const { error } = await supabaseAdmin
            .from('api_keys')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Security: Ensure ownership

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
