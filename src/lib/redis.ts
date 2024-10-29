import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Redis credentials are not properly configured')
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export async function setCache<T>(key: string, data: T, expirationSeconds = 3600): Promise<void> {
  await redis.set(key, JSON.stringify(data), { ex: expirationSeconds })
}

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get<string>(key)
  return data ? JSON.parse(data) as T : null
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(key)
}

