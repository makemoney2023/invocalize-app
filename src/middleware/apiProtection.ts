import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown'
  const rateLimit = await checkRateLimit(ip)

  if (!rateLimit.success) {
    return new NextResponse(JSON.stringify({
      error: 'Too many requests',
      retryAfter: rateLimit.reset
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.reset.toString()
      }
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
