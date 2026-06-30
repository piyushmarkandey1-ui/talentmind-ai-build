import { redis, redisEnabled } from './client'

/**
 * Redis caching for analysis results
 * Faster than SQL queries (sub-millisecond vs 10-100ms)
 * Reduces database load and improves response times
 */

const CACHE_TTL = 3600 // 1 hour in seconds

interface CacheEntry<T> {
  data: T
  timestamp: number
}

/**
 * Get cached data
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisEnabled) return null

  try {
    const cached = await redis.get<CacheEntry<T>>(key)
    if (!cached) return null

    // Check if cache is expired
    const now = Date.now()
    if (now - cached.timestamp > CACHE_TTL * 1000) {
      await redis.del(key)
      return null
    }

    return cached.data
  } catch (error) {
    console.error('Redis get cache error:', error)
    return null
  }
}

/**
 * Set cached data
 */
export async function setCache<T>(key: string, data: T, ttl: number = CACHE_TTL): Promise<void> {
  if (!redisEnabled) return

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    }
    await redis.set(key, entry, { ex: ttl })
  } catch (error) {
    console.error('Redis set cache error:', error)
  }
}

/**
 * Delete cached data
 */
export async function deleteCache(key: string): Promise<void> {
  if (!redisEnabled) return

  try {
    await redis.del(key)
  } catch (error) {
    console.error('Redis delete cache error:', error)
  }
}

/**
 * Delete multiple cache keys by pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  if (!redisEnabled) return

  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Redis delete cache pattern error:', error)
  }
}

/**
 * Cache analysis result
 */
export async function cacheAnalysisResult(
  userId: string,
  resumeId: string,
  jobId: string,
  data: any
): Promise<void> {
  const key = `analysis:${userId}:${resumeId}:${jobId}`
  await setCache(key, data, 7200) // Cache for 2 hours
}

/**
 * Get cached analysis result
 */
export async function getCachedAnalysisResult(
  userId: string,
  resumeId: string,
  jobId: string
): Promise<any | null> {
  const key = `analysis:${userId}:${resumeId}:${jobId}`
  return getCache(key)
}

/**
 * Invalidate user's analysis cache
 */
export async function invalidateUserAnalysisCache(userId: string): Promise<void> {
  await deleteCachePattern(`analysis:${userId}:*`)
}

/**
 * Cache job data
 */
export async function cacheJobData(userId: string, jobId: string, data: any): Promise<void> {
  const key = `job:${userId}:${jobId}`
  await setCache(key, data, 3600) // Cache for 1 hour
}

/**
 * Get cached job data
 */
export async function getCachedJobData(userId: string, jobId: string): Promise<any | null> {
  const key = `job:${userId}:${jobId}`
  return getCache(key)
}

/**
 * Invalidate user's job cache
 */
export async function invalidateUserJobCache(userId: string): Promise<void> {
  await deleteCachePattern(`job:${userId}:*`)
}
