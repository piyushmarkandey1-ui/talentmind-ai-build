import { createClient } from '@supabase/supabase-js'

function sanitizeEnv(val: string | undefined): string {
  if (!val) return ''
  // Remove surrounding quotes and leading/trailing whitespace/newlines only
  let clean = val.trim().replace(/^["']|["']$/g, '')
  // If they accidentally pasted KEY=VALUE, extract just the value
  if (clean.includes('=')) {
    if (clean.startsWith('NEXT_PUBLIC_') || clean.startsWith('SUPABASE_')) {
      clean = clean.substring(clean.indexOf('=') + 1)
    }
  }
  return clean
}

const rawUrl = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
const rawKey = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Validate URL format before creating client
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

if (!rawUrl || !isValidUrl(rawUrl)) {
  console.error(
    '[TalentMind] NEXT_PUBLIC_SUPABASE_URL is missing or invalid. ' +
    'Got:', JSON.stringify(rawUrl),
    '\nMake sure your .env.local file contains a valid NEXT_PUBLIC_SUPABASE_URL.'
  )
}

if (!rawKey) {
  console.error(
    '[TalentMind] NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. ' +
    'Make sure your .env.local file contains NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(
  rawUrl || 'https://placeholder.supabase.co',
  rawKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'talentmind-ai',
      },
    },
  }
)
