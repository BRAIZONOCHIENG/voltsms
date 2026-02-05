import { NextResponse } from 'next/server';
import { HARDCODED_SERVICES } from './data';

// Standard cache
export const revalidate = 3600;

export async function GET(req: Request) {
    // Simply return the hardcoded list
    // This is instant, crash-proof, and meets the user's "Competitive Price" strategy

    // Sort logic: Category then Name
    const sorted = [...HARDCODED_SERVICES].sort((a, b) => {
        if (a.category === 'Social' && b.category !== 'Social') return -1;
        if (a.category !== 'Social' && b.category === 'Social') return 1;
        return a.name.localeCompare(b.name);
    });

    return NextResponse.json(sorted);
}
