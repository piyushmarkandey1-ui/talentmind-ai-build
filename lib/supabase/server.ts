import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

function sanitizeEnv(val: string | undefined): string {
  if (!val) return ''
  // Only strip surrounding quotes and leading/trailing whitespace
  return val.trim().replace(/^["']|["']$/g, '')
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) || '',
    sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient(
    sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) || '',
    sanitizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
