import { supabase } from './client'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface RecruiterProfile {
  id?: string
  name: string
  email: string
  company: string
  designation: string
}

export interface AnalysisSession {
  id?: string
  user_id: string
  recruiter_email: string
  job_title: string
  job_content: string
  results: unknown[]
  created_at: string
}

// ── Recruiter Profile ──────────────────────────────────────────────────────────
export async function getProfile(userId: string): Promise<RecruiterProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    if (!data) return null

    return {
      id: data.id,
      name: data.full_name || '',
      email: data.email,
      company: '',
      designation: '',
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

export async function saveProfile(userId: string, profile: RecruiterProfile): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: profile.email,
        full_name: profile.name,
        updated_at: new Date().toISOString(),
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving profile:', error)
    throw error
  }
}

export async function clearProfile(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error clearing profile:', error)
    throw error
  }
}

// ── Sessions ───────────────────────────────────────────────────────────────────
export async function getAllSessions(userId: string): Promise<AnalysisSession[]> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        content,
        created_at,
        analyses (
          id,
          candidate_name,
          overall_score,
          recommendation,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(job => ({
      id: job.id,
      user_id: userId,
      recruiter_email: '', // Will be fetched from profile
      job_title: job.title,
      job_content: job.content,
      results: job.analyses || [],
      created_at: job.created_at,
    })) || []
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return []
  }
}

export async function getSessionsByEmail(userId: string, email: string): Promise<AnalysisSession[]> {
  // Since we're using RLS, this will only return the user's own sessions
  return getAllSessions(userId)
}

export async function saveSession(
  userId: string,
  session: Omit<AnalysisSession, 'id' | 'created_at' | 'user_id'>
): Promise<AnalysisSession> {
  try {
    // First, create or update the job
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .upsert({
        user_id: userId,
        title: session.job_title,
        content: session.job_content,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (jobError) throw jobError

    // Then, save the analysis results
    if (session.results && session.results.length > 0) {
      for (const result of session.results as any[]) {
        await supabase.from('analyses').upsert({
          user_id: userId,
          job_id: jobData.id,
          resume_id: result.resumeId || result.id,
          candidate_name: result.candidateName || result.analysis?.candidateName,
          headline: result.headline || result.analysis?.headline,
          overall_score: result.overallScore || result.analysis?.overallScore,
          recommendation: result.recommendation || result.analysis?.recommendation,
          technical_skills: result.analysis?.technical_skills || {},
          relevant_experience: result.analysis?.relevant_experience || {},
          project_quality: result.analysis?.project_quality || {},
          career_progression: result.analysis?.career_progression || {},
          leadership: result.analysis?.leadership || {},
          communication: result.analysis?.communication || {},
          learning_potential: result.analysis?.learning_potential || {},
          transferable_skills: result.analysis?.transferable_skills || {},
          domain_knowledge: result.analysis?.domain_knowledge || {},
          missing_skills: result.analysis?.missing_skills || {},
          overall_role_fit: result.analysis?.overall_role_fit || {},
          strengths: result.analysis?.strengths || [],
          gaps: result.analysis?.gaps || [],
          interview_questions: result.analysis?.interview_questions || {},
          confidence_level: result.analysis?.confidence_level || '',
        })
      }
    }

    return {
      id: jobData.id,
      user_id: userId,
      recruiter_email: session.recruiter_email,
      job_title: session.job_title,
      job_content: session.job_content,
      results: session.results,
      created_at: jobData.created_at,
    }
  } catch (error) {
    console.error('Error saving session:', error)
    throw error
  }
}

export async function updateSession(id: string, updates: Partial<AnalysisSession>): Promise<void> {
  try {
    if (updates.job_title || updates.job_content) {
      await supabase
        .from('jobs')
        .update({
          title: updates.job_title,
          content: updates.job_content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
    }
  } catch (error) {
    console.error('Error updating session:', error)
    throw error
  }
}

export async function deleteSession(id: string): Promise<void> {
  try {
    // This will cascade delete analyses due to foreign key constraint
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting session:', error)
    throw error
  }
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
