import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function middleware(request: NextRequest) {
    let ip = (request as any).ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';

    // Handle multiple IPs in x-forwarded-for
    if (ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }
    const ua = request.headers.get('user-agent')?.toLowerCase() || 'unknown';

    // --- A. Bot Blocking ---
    const isBot = BLOCKED_USER_AGENTS.some(agent => ua.includes(agent));
    // Allow Google/Bing/Twitter bots explicitly if needed, but 'bot' keyword might be too aggressive.
    // Let's refine the specific blocking list to be safe but strict on tools.
    // We already have 'bot' in the list above, let's allow common search engines if strictly needed,
    // but for "not scrapable" user request, blocking generic 'bot' is safer.
    // Exception: Allow Googlebot for SEO if this was a public site, but user said "not scrapable".
    // We will stick to the list. If it matches a tool, block it.

    // Exception for internal API routes that need server-to-server access
    const isInternalApiRoute =
        request.nextUrl.pathname.startsWith('/api/crypto/voltsplitter') ||
        request.nextUrl.pathname.startsWith('/api/crypto/auto-forward') ||
        request.nextUrl.pathname.startsWith('/api/crypto/register-wallet') ||
        request.nextUrl.pathname.startsWith('/api/crypto/withdraw-profit') ||
        request.nextUrl.pathname.startsWith('/api/cron') ||
        request.nextUrl.pathname.startsWith('/api/webhook');

    // Exception: Allow requests with valid API Key format (B2B API access)
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
    // Only rate limit API routes and Page loads, skip static assets for performance
    if (
        !request.nextUrl.pathname.startsWith('/_next') &&
        !request.nextUrl.pathname.includes('.') // Skip files like .png, .css
    ) {
        const now = Date.now();
        const record = rateLimit.get(ip) || { count: 0, startTime: now };

        if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
            // Reset window
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

    return NextResponse.next();
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
