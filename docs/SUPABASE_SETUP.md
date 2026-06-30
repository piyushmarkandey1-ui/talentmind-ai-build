# Supabase Database Setup Guide

This guide explains the database setup for TalentMind AI using Supabase.

## Features

### Security
- **Row Level Security (RLS)**: All tables have RLS enabled ensuring users can only access their own data
- **Audit Logging**: Automatic tracking of all INSERT, UPDATE, DELETE operations
- **Rate Limiting**: Built-in rate limiting function to prevent abuse
- **Service Role Separation**: Separate admin client for privileged operations

### Performance
- **Indexes**: Strategic indexes on frequently queried fields (user_id, created_at, scores)
- **Connection Pooling**: Supabase manages connection pooling automatically
- **Query Optimization**: JSONB fields for flexible data storage

### Data Model

#### Tables

**profiles**
- Extends Supabase auth.users
- Stores user profile information (name, avatar)

**jobs**
- Job descriptions created by users
- Linked to user who created it

**resumes**
- Uploaded resume files
- Stores file metadata and extracted text content
- Linked to user and job

**analyses**
- AI analysis results for each resume
- Stores all 11 scoring dimensions as JSONB
- Includes strengths, gaps, interview questions
- Linked to user, resume, and job

**recruiter_feedback**
- User feedback on analysis results
- Ratings and notes
- One feedback per analysis per user

**rate_limits**
- Tracks API usage per user/IP
- Configurable limits per endpoint
- Time-window based limiting

**audit_logs**
- Complete audit trail of all data changes
- Records old/new values for updates
- Tracks IP and user agent

## Setup Instructions

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up/login
3. Create new project
4. Wait for database to be provisioned

### 2. Get Credentials

From your Supabase project settings:
- Project URL
- anon/public API key
- service_role key (keep secret!)

### 3. Run Migration

In Supabase dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL

Or using CLI (if Docker is available):
```bash
supabase link
supabase db push
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Enable Authentication

In Supabase dashboard:
1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email settings (or use Supabase's default)
4. Optionally enable OAuth providers (Google, GitHub, etc.)

## Security Features

### Row Level Security (RLS)

All tables have RLS policies that ensure:
- Users can only view their own data
- Users can only modify their own data
- Service role has full access for admin operations

### Rate Limiting

The `check_rate_limit()` function provides:
- Per-user rate limiting
- Per-IP rate limiting
- Per-endpoint configuration
- Time-window based counting

Usage example:
```sql
SELECT check_rate_limit(
  auth.uid(),
  '192.168.1.1',
  '/api/analyze',
  10,  -- 10 requests
  60   -- per 60 seconds
);
```

### Audit Logging

Automatic triggers log:
- All INSERT operations
- All UPDATE operations (with old/new values)
- All DELETE operations
- User ID, IP address, user agent

## Performance Optimization

### Indexes

Strategic indexes on:
- `profiles.id` (primary key)
- `jobs.user_id`, `jobs.created_at`
- `resumes.user_id`, `resumes.job_id`
- `analyses.user_id`, `analyses.resume_id`, `analyses.job_id`
- `analyses.overall_score`, `analyses.created_at`
- `rate_limits.window_start`, `rate_limits.window_end`
- `audit_logs.user_id`, `audit_logs.created_at`

### Query Tips

1. Use `select()` with specific columns instead of `*`
2. Use `eq()` for indexed columns
3. Use `order()` with indexed columns
4. Use `limit()` to prevent large result sets

## API Usage

### Client-side (Browser)
```typescript
import { supabase } from '@/lib/supabase/client'

// Get user's jobs
const { data, error } = await supabase
  .from('jobs')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
```

### Server-side (API Routes)
```typescript
import { createAdminClient } from '@/lib/supabase/server'

const supabase = await createAdminClient()

// Create analysis (bypasses RLS)
const { data, error } = await supabase
  .from('analyses')
  .insert(analysisData)
  .select()
```

## Monitoring

### Supabase Dashboard

Monitor:
- Database connections
- Query performance
- Storage usage
- API requests
- Authentication events

### Audit Logs

Query audit logs:
```sql
SELECT * FROM audit_logs
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 100;
```

## Backup

Supabase automatically:
- Backs up database daily
- Retains backups for 7 days (free tier)
- Point-in-time recovery available (paid tier)

## Scaling

### Free Tier Limits
- 500MB database storage
- 1GB bandwidth
- 2 concurrent edge functions
- 50,000 monthly active users

### When to Upgrade
- More than 500MB storage
- High traffic requiring more connections
- Need longer backup retention
- Need advanced features

## Troubleshooting

### RLS Issues
If queries fail with permission errors:
1. Check RLS policies in Supabase dashboard
2. Verify user is authenticated
3. Check service role key usage for admin operations

### Rate Limiting
If rate limit errors occur:
1. Check rate_limits table
2. Adjust limits in environment variables
3. Implement exponential backoff in client

### Performance Issues
If queries are slow:
1. Check query plan in Supabase dashboard
2. Verify indexes are being used
3. Consider adding more indexes
4. Review JSONB field sizes
