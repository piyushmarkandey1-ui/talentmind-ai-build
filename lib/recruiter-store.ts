'use client'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface RecruiterProfile {
  name: string
  email: string
  company: string
  designation: string
}

export interface AnalysisSession {
  id: string
  recruiterEmail: string
  jobTitle: string
  jobContent: string
  date: string           // ISO string
  results: unknown[]     // AnalysisResult[] — stored as-is
}

// ── Keys ───────────────────────────────────────────────────────────────────────
const PROFILE_KEY = 'talentmind_recruiter_profile'
const SESSIONS_KEY = 'talentmind_sessions'

// ── Safe localStorage wrapper ──────────────────────────────────────────────────
function get<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function set(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

// ── Recruiter Profile ──────────────────────────────────────────────────────────
export function getProfile(): RecruiterProfile | null {
  return get<RecruiterProfile>(PROFILE_KEY)
}

export function saveProfile(profile: RecruiterProfile): void {
  set(PROFILE_KEY, profile)
}

export function clearProfile(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(PROFILE_KEY)
}

// ── Sessions ───────────────────────────────────────────────────────────────────
export function getAllSessions(): AnalysisSession[] {
  return get<AnalysisSession[]>(SESSIONS_KEY) ?? []
}

export function getSessionsByEmail(email: string): AnalysisSession[] {
  return getAllSessions().filter(
    (s) => s.recruiterEmail.toLowerCase() === email.toLowerCase()
  )
}

export function saveSession(session: Omit<AnalysisSession, 'id' | 'date'>): AnalysisSession {
  const all = getAllSessions()
  const newSession: AnalysisSession = {
    ...session,
    id: Math.random().toString(36).slice(2, 12),
    date: new Date().toISOString(),
  }
  // Keep max 100 sessions total; drop oldest if needed
  const trimmed = [newSession, ...all].slice(0, 100)
  set(SESSIONS_KEY, trimmed)
  return newSession
}

export function deleteSession(id: string): void {
  const all = getAllSessions().filter((s) => s.id !== id)
  set(SESSIONS_KEY, all)
}

export function formatSessionDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
