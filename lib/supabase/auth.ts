import { supabase } from './client'

// Profile cache structure
interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Cache user profile to avoid repeated database queries
let cachedProfile: Profile | null = null
let profileCacheTime = 0
const PROFILE_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getCachedProfile(userId: string): Promise<Profile | null> {
  const now = Date.now()
  
  // Return cached profile if still valid
  if (cachedProfile && cachedProfile.id === userId && now - profileCacheTime < PROFILE_CACHE_TTL) {
    return cachedProfile
  }

  // Fetch from database
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  // Update cache
  if (data) {
    cachedProfile = data as Profile
    profileCacheTime = now
  }

  return data as Profile
}

export function clearProfileCache() {
  cachedProfile = null
  profileCacheTime = 0
}

// Get current user session (uses Supabase's built-in session management)
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  return user
}

// Check if user is authenticated (uses session, no DB query)
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}

// Re-export supabase for convenience
export { supabase }
