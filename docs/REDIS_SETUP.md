# Upstash Redis Setup Guide

Redis is faster than SQL (sub-millisecond latency vs 10-100ms) and perfect for:
- Rate limiting
- Caching analysis results
- Session management
- Real-time features

## Setup Options

### Option 1: Via Vercel Integration (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Integrations**
3. Search for "Upstash Redis"
4. Click "Add" and follow the prompts
5. Vercel will automatically add environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Option 2: Direct Upstash Setup

1. Go to https://upstash.com
2. Sign up/login
3. Create a new Redis database
4. Choose region (closest to your users)
5. Copy the REST URL and Token
6. Add to your Vercel environment variables:
   ```
   UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   ```

## Free Tier Limits

Upstash Redis free tier includes:
- 10,000 commands per day
- 256 MB storage
- 10,000 keys
- Global edge network

## Usage in TalentMind AI

### Rate Limiting
```typescript
import { rateLimitByUser } from '@/lib/redis/rate-limit'

const result = await rateLimitByUser(userId, 10, 60) // 10 requests per minute
if (!result.success) {
  return new Response('Rate limit exceeded', { status: 429 })
}
```

### Caching Analysis Results
```typescript
import { cacheAnalysisResult, getCachedAnalysisResult } from '@/lib/redis/cache'

// Cache result
await cacheAnalysisResult(userId, resumeId, jobId, analysisData)

// Retrieve cached result
const cached = await getCachedAnalysisResult(userId, resumeId, jobId)
if (cached) {
  return cached // Return from cache (fast!)
}
```

## Performance Benefits

- **Rate limiting**: Sub-millisecond checks vs 10-100ms SQL queries
- **Caching**: Analysis results cached for 2 hours, reducing AI API calls
- **Session data**: Fast session storage for authentication
- **Real-time**: Can be used for real-time features in the future

## Security

- Upstash Redis uses TLS encryption
- REST API is secure with token authentication
- Rate limiting prevents abuse
- Data is automatically expired (TTL)

## Monitoring

Upstash dashboard shows:
- Command usage
- Memory usage
- Key count
- Latency metrics
- Error rates

## Troubleshooting

### Connection Issues
If Redis connection fails:
1. Check environment variables are set
2. Verify REST URL and token are correct
3. Check Upstash dashboard for database status
4. The app will gracefully fallback if Redis is unavailable

### Rate Limiting Not Working
If rate limiting seems ineffective:
1. Check Redis is connected
2. Verify rate limit configuration
3. Check rate_limits table in Supabase (fallback)
4. Review logs for Redis errors

### Cache Not Working
If caching doesn't work:
1. Verify Redis connection
2. Check cache keys exist in Upstash dashboard
3. Verify TTL settings
4. The app will query database if cache miss
