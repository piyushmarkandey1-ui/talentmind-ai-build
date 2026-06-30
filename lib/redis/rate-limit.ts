import { redis, redisEnabled } from './client'

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

/**
 * Redis-based rate limiting using sliding window algorithm
 * Faster than SQL-based rate limiting (sub-millisecond vs 10-100ms)
 * 
 * @param identifier - User ID or IP address
 * @param limit - Maximum requests allowed
 * @param window - Time window in seconds
 * @param prefix - Key prefix for namespacing
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  window: number,
  prefix: string = 'ratelimit'
): Promise<RateLimitResult> {
  if (!redisEnabled) {
    // Fallback: always allow if Redis not configured
    return { success: true, remaining: limit, reset: Date.now() + window * 1000 }
  }

  const key = `${prefix}:${identifier}`
  const now = Date.now()
  const windowStart = now - window * 1000

  try {
    // Remove old entries outside the window
    await redis.zremrangebyscore(key, 0, windowStart)

    // Count current requests in window
    const current = await redis.zcard(key)

    if (current >= limit) {
      // Get oldest timestamp to calculate reset time
      const oldest = await redis.zrange(key, 0, 0, { withScores: true })
      const resetTime = oldest.length > 0 ? Math.floor((oldest[0] as { score: number }).score) + window * 1000 : now + window * 1000

      return {
        success: false,
        remaining: 0,
        reset: resetTime,
      }
    }

    // Add current request
    await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` })

    // Set expiration on the key
    await redis.expire(key, window)

    return {
      success: true,
      remaining: limit - current - 1,
      reset: now + window * 1000,
    }
  } catch (error) {
    console.error('Redis rate limit error:', error)
    // Fallback: allow request if Redis fails
    return { success: true, remaining: limit, reset: now + window * 1000 }
  }
}

/**
 * Rate limiting by user ID
 */
export async function rateLimitByUser(
  userId: string,
  limit: number,
  window: number
): Promise<RateLimitResult> {
  return rateLimit(userId, limit, window, 'user')
}

/**
 * Rate limiting by IP address
 */
export async function rateLimitByIP(
  ip: string,
  limit: number,
  window: number
): Promise<RateLimitResult> {
  return rateLimit(ip, limit, window, 'ip')
}

/**
 * Rate limiting by endpoint
 */
export async function rateLimitByEndpoint(
  identifier: string,
  endpoint: string,
  limit: number,
  window: number
): Promise<RateLimitResult> {
  return rateLimit(`${identifier}:${endpoint}`, limit, window, 'endpoint')
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  window: number,
  prefix: string = 'ratelimit'
): Promise<{ count: number; reset: number }> {
  if (!redisEnabled) {
    return { count: 0, reset: Date.now() + window * 1000 }
  }

  const key = `${prefix}:${identifier}`
  const now = Date.now()
  const windowStart = now - window * 1000

  try {
    await redis.zremrangebyscore(key, 0, windowStart)
    const count = await redis.zcard(key)
    const oldest = await redis.zrange(key, 0, 0, { withScores: true })
    const resetTime = oldest.length > 0 ? Math.floor((oldest[0] as { score: number }).score) + window * 1000 : now + window * 1000

    return { count, reset: resetTime }
  } catch (error) {
    console.error('Redis get rate limit error:', error)
    return { count: 0, reset: now + window * 1000 }
  }
}
