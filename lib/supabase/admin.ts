import { createClient } from '@supabase/supabase-js'

function sanitizeEnv(val: string | undefined, fallback: string): string {
  if (!val) return fallback
  let clean = val.replace(/[\s\n\r"']/g, '')
  if (clean.includes('=')) {
    if (clean.startsWith('NEXT_PUBLIC_') || clean.startsWith('SUPABASE_')) {
      clean = clean.substring(clean.indexOf('=') + 1)
    }
  }
  return clean || fallback
}

const supabaseUrl = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'https://placeholder.supabase.co')
const supabaseServiceRoleKey = sanitizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY, 'placeholder')

// Admin client for server-side operations only
// This uses the service role key which has full access to the database
// DO NOT use this in client-side code
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
