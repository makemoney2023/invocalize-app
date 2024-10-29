import { redis } from '@/lib/rateLimit'

export async function testRedisConnection() {
  try {
    // Try to set a test value
    await redis.set('test-key', 'test-value', { ex: 60 })
    
    // Try to get the test value
    const value = await redis.get('test-key')
    
    if (value === 'test-value') {
      console.log('✅ Redis connection successful')
      return true
    } else {
      console.error('❌ Redis connection failed: Unexpected value')
      return false
    }
  } catch (error) {
    console.error('❌ Redis connection failed:', error)
    return false
  }
}

