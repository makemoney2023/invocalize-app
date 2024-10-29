import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Redis credentials are not properly configured')
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Create a new ratelimiter that allows 10 requests per 10 seconds
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
})

export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const result = await ratelimit.limit(identifier)
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}
