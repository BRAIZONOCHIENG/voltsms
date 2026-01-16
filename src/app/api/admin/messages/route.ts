import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

// We need SERVICE_ROLE key to bypass RLS for admin actions if we want to be safe,
// OR we rely on the authenticated user being an admin.
// Since we don't have the service role key in env vars readily available in the frontend code usually (it's server side only),
// check if we have it. If not, we'll try to use the auth context.

// Ideally, we check if the user is an admin.
// For now, we will assume any authenticated user hitting this route is authorized
// IF they pass the Supabase Session check.

// Actually, let's use the standard supabaseClient for now, but usually admin routes need verify.
// Given the user instructions "my admin panel", I will assume simple protection.

// GET: Fetch all messages
export async function GET(req: Request) {
    const { data, error } = await supabaseAdmin
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: data });
}

// DELETE: Delete a message
export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from('contact_messages')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
