import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

// 1. Blocked User Agents (Scrapers/Bots)
const BLOCKED_USER_AGENTS = [
    'curl',
    'python-requests',
    'wget',
    'libwww-perl',
    'httpclient',
    'axios',
    'scrapy',
    'bot',
    'spider',
    'crawler'
];

// 2. Simple In-Memory Rate Limiting (Token Bucket -ish)
// Note: In a distributed environment (Vercel Edge), this Map is per-isolate.
// For a single server (VPS/Node), it works as a global limiter.
const rateLimit = new Map();

const RATE_LIMIT_WINDOW_MS = 10 * 1000; // 10 seconds
const MAX_REQUESTS_PER_WINDOW = 50; // 50 requests per 10s (~5 req/s burst)

export async function middleware(request: NextRequest) {
    let ip = (request as any).ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';

    // Handle multiple IPs in x-forwarded-for
    if (ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }
    const ua = request.headers.get('user-agent')?.toLowerCase() || 'unknown';

    // --- A. Bot Blocking ---
    const isBot = BLOCKED_USER_AGENTS.some(agent => ua.includes(agent));
    // Exception for internal API routes
    const isInternalApiRoute =
        request.nextUrl.pathname.startsWith('/api/crypto/voltsplitter') ||
        request.nextUrl.pathname.startsWith('/api/crypto/auto-forward') ||
        request.nextUrl.pathname.startsWith('/api/crypto/register-wallet') ||
        request.nextUrl.pathname.startsWith('/api/crypto/withdraw-profit') ||
        request.nextUrl.pathname.startsWith('/api/cron') ||
        request.nextUrl.pathname.startsWith('/api/webhook');

    const hasApiKey = request.headers.get('authorization')?.startsWith('Bearer sk_live_') ||
        request.headers.get('authorization')?.startsWith('Bearer vk_');

    if (isBot && !isInternalApiRoute && !hasApiKey &&
        !ua.includes('googlebot') &&
        !ua.includes('bingbot') &&
        !ua.includes('duckduckbot') &&
        !ua.includes('baiduspider') &&
        !ua.includes('yandexbot') &&
        !ua.includes('facebookexternalhit') &&
        !ua.includes('twitterbot')
    ) {
        return new NextResponse(JSON.stringify({ error: 'Access Denied: Automated access detected.' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // --- B. Rate Limiting ---
    if (
        !request.nextUrl.pathname.startsWith('/_next') &&
        !request.nextUrl.pathname.includes('.')
    ) {
        const now = Date.now();
        const record = rateLimit.get(ip) || { count: 0, startTime: now };

        if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
            record.count = 1;
            record.startTime = now;
        } else {
            record.count++;
        }

        rateLimit.set(ip, record);

        if (record.count > MAX_REQUESTS_PER_WINDOW) {
            return new NextResponse(JSON.stringify({ error: 'Too Many Requests', retryAfter: 10 }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': '10'
                }
            });
        }
    }

    // 3. Update Supabase Session
    const response = await updateSession(request);

    // --- C. Affiliate Tracking ---
    const ref = request.nextUrl.searchParams.get('ref');
    if (ref) {
        response.cookies.set('volt_ref_code', ref, {
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
            httpOnly: false,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });
    }

    response.cookies.set('volt_ip', ip, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
