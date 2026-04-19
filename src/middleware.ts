import { NextRequest, NextResponse } from 'next/server';

if (
  process.env.NODE_ENV === 'production' &&
  !process.env.API_SECRET_KEY
) {
  throw new Error('FATAL: API_SECRET_KEY environment variable is required in production');
}

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const CAPACITY = 10;
const REFILL_PER_WINDOW = 10;
const WINDOW_MS = 60_000;

const rateLimitStore = new Map<string, RateLimitBucket>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return (request as NextRequest & { ip?: string }).ip ?? 'unknown';
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', "default-src 'self'");
  return response;
}

export function middleware(request: NextRequest): NextResponse {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = getClientIp(request);
  const now = Date.now();
  let bucket = rateLimitStore.get(ip);

  if (!bucket) {
    bucket = { tokens: CAPACITY, lastRefill: now };
    rateLimitStore.set(ip, bucket);
  } else {
    const elapsed = now - bucket.lastRefill;
    if (elapsed >= WINDOW_MS) {
      bucket.tokens = REFILL_PER_WINDOW;
      bucket.lastRefill = now;
    }
  }

  if (bucket.tokens <= 0) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - bucket.lastRefill)) / 1000);
    const response = NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429 },
    );
    response.headers.set('Retry-After', String(retryAfter));
    return response;
  }

  bucket.tokens -= 1;

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: ['/api/:path*'],
};
