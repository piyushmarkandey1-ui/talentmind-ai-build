import { Redis } from '@upstash/redis'

// Upstash Redis client for Vercel deployment
// Redis is faster than SQL (in-memory, sub-millisecond latency)
// Perfect for rate limiting, caching, and session management

const redisUrl = process.env.UPSTASH_REDIS_REST_URL!
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN!

export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
})

// Fallback for local development without Upstash
let redisEnabled = true
if (!redisUrl || !redisToken) {
  console.warn('Upstash Redis not configured. Rate limiting and caching will be disabled.')
  redisEnabled = false
}

export { redisEnabled }
