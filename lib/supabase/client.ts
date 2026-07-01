import { createClient } from '@supabase/supabase-js'

function sanitizeEnv(val: string | undefined, fallback: string): string {
  if (!val) return fallback
  // Remove all whitespace, newlines, and literal quote characters
  let clean = val.replace(/[\s\n\r"']/g, '')
  // If they accidentally pasted KEY=VALUE, extract just the value
  if (clean.includes('=')) {
    // only split if it starts with NEXT_PUBLIC_ or SUPABASE_ to be safe
    if (clean.startsWith('NEXT_PUBLIC_') || clean.startsWith('SUPABASE_')) {
      clean = clean.substring(clean.indexOf('=') + 1)
    }
  }
  return clean || fallback
}

const supabaseUrl = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'https://placeholder.supabase.co')
const supabaseAnonKey = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'placeholder')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
})
