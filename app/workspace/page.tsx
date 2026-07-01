'use client'

import { Button } from '@/components/ui/button'
import { AuroraBackground } from '@/components/site/aurora-background'
import { Logo } from '@/components/site/logo'
import { JobStep } from '@/components/workspace/job-step'
import { ResumeStep } from '@/components/workspace/resume-step'
import { ReviewStep } from '@/components/workspace/review-step'
import { ResultsDashboard } from '@/components/workspace/results-dashboard'
import { Stepper, type Step } from '@/components/workspace/stepper'
import { HistoryPanel } from '@/components/workspace/history-panel'
import type { JobDescription, ResumeFile } from '@/lib/workspace'
import { type AnalysisResult, type RecruiterFeedback } from '@/lib/analysis-schema'
import {
  saveSession,
  updateSession,
  type RecruiterProfile,
  type AnalysisSession,
} from '@/lib/supabase/recruiter-store'
import { supabase, getCachedProfile, clearProfileCache } from '@/lib/supabase/auth'
import { AuthModal } from '@/components/auth/auth-modal'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  History,
  User,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '@/components/site/theme-provider'
import { cn } from '@/lib/utils'

const steps: Step[] = [
  { id: 'role',    label: 'Define role',  description: 'Job description'  },
  { id: 'resumes', label: 'Add resumes',  description: 'Upload candidates' },
  { id: 'review',  label: 'Review',       description: 'Confirm & launch'  },
]

export default function WorkspacePage() {
  const { theme, toggle: toggleTheme } = useTheme()
  const isLight = theme === 'light'

  // ── Recruiter state ──────────────────────────────────────────────────────
  const [profile, setProfile]               = useState<RecruiterProfile | null>(null)
  const [profileLoaded, setProfileLoaded]   = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot_password' | 'update_password'>('login')
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen]   = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Load profile from Supabase on mount
  useEffect(() => {
    async function loadProfile() {
      const params = new URLSearchParams(window.location.search)
      const isReset = params.get('reset') === 'true'

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const saved = await getCachedProfile(user.id)
        if (saved) {
          setProfile({
            id: saved.id,
            name: saved.full_name || '',
            email: saved.email,
            company: '',
            designation: '',
          })
          if (isReset) {
            setAuthModalMode('update_password')
            setShowAuthModal(true)
            window.history.replaceState({}, '', window.location.pathname)
          }
        }
      } else {
        setShowAuthModal(true)
      }
      setProfileLoaded(true)
    }
    loadProfile()
  }, [])

  // Close profile menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAuthSuccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const saved = await getCachedProfile(user.id)
      if (saved) {
        setProfile({
          id: saved.id,
          name: saved.full_name || '',
          email: saved.email,
          company: '',
          designation: '',
        })
      }
    }
    setShowAuthModal(false)
  }

  const handleSwitchUser = async () => {
    await supabase.auth.signOut()
    clearProfileCache()
    setProfile(null)
    resetAll()
    setProfileMenuOpen(false)
    setShowAuthModal(true)
  }

  // ── Wizard state ─────────────────────────────────────────────────────────
  const [current,  setCurrent]  = useState(0)
  const [job,      setJob]      = useState<JobDescription>({ title: '', content: '', source: 'paste' })
  const [resumes,  setResumes]  = useState<ResumeFile[]>([])

  // ── Analysis state ───────────────────────────────────────────────────────
  const [isAnalyzing,    setIsAnalyzing]    = useState(false)
  const [progress,       setProgress]       = useState({ done: 0, total: 0 })
  const [results,        setResults]        = useState<AnalysisResult[] | null>(null)
  const [analysisError,  setAnalysisError]  = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  const canContinue = useMemo(() => {
    if (current === 0) return job.title.trim() !== '' && job.content.trim().length > 40
    if (current === 1) return resumes.length > 0
    return true
  }, [current, job, resumes])

  const next = () => setCurrent((c) => Math.min(c + 1, steps.length - 1))
  const back = () => setCurrent((c) => Math.max(c - 1, 0))

  // ── Run analysis ─────────────────────────────────────────────────────────
  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisError(null)
    setProgress({ done: 0, total: resumes.length })
    const newResults: AnalysisResult[] = []

    for (const resume of resumes) {
      if (!resume.file) {
        newResults.push({ id: resume.id, fileName: resume.name, status: 'error', error: 'File reference lost — please re-upload.' })
        setProgress((p) => ({ ...p, done: p.done + 1 }))
        continue
      }

      const formData = new FormData()
      formData.append('jobTitle',   job.title)
      formData.append('jobContent', job.content)
      formData.append('resume',     resume.file)

      try {
        const res  = await fetch('/api/analyze', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || `Server error (${res.status})`)
        newResults.push({ id: resume.id, fileName: resume.name, status: 'ok', analysis: data })
      } catch (err: any) {
        newResults.push({ id: resume.id, fileName: resume.name, status: 'error', error: err.message || 'Analysis failed.' })
      }

      setProgress((p) => ({ ...p, done: p.done + 1 }))
    }

    setIsAnalyzing(false)

    if (newResults.every((r) => r.status === 'error')) {
      setAnalysisError(newResults[0].status === 'error' ? newResults[0].error : 'All analyses failed.')
      return
    }

    // Auto-save session linked to recruiter's email
    if (profile) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const session = await saveSession(user.id, {
          recruiter_email: profile.email,
          job_title:       job.title,
          job_content:     job.content,
          results:        newResults,
        })
        setCurrentSessionId(session.id || '')
      }
    }

    setResults(newResults)
  }

  // ── Feedback ─────────────────────────────────────────────────────────────
  const handleUpdateFeedback = (resultId: string, feedback: RecruiterFeedback) => {
    if (!results) return
    const updated = results.map(r => r.id === resultId && r.status === 'ok' ? { ...r, feedback } : r)
    setResults(updated)
    // Always persist immediately to localStorage so no feedback is lost
    if (currentSessionId) {
      updateSession(currentSessionId, { results: updated })
    }
  }

  // ── Delete Candidate ─────────────────────────────────────────────────────
  const handleDeleteResult = (resultId: string) => {
    if (!results) return
    const updated = results.filter((r) => r.id !== resultId)
    
    if (updated.length === 0) {
      resetAll()
      if (currentSessionId) updateSession(currentSessionId, { results: [] })
    } else {
      setResults(updated)
      if (currentSessionId) updateSession(currentSessionId, { results: updated })
    }
  }

  // ── Restore a saved session ──────────────────────────────────────────────
  const handleRestoreSession = (session: AnalysisSession) => {
    setJob({ title: session.job_title, content: session.job_content, source: 'paste' })
    setResults(session.results as AnalysisResult[])
    setCurrentSessionId(session.id || null)
    setCurrent(0)
    setResumes([])
  }

  // ── Reset ────────────────────────────────────────────────────────────────
  const resetAll = () => {
    setResults(null)
    setAnalysisError(null)
    setCurrentSessionId(null)
    setProgress({ done: 0, total: 0 })
    setCurrent(0)
    setJob({ title: '', content: '', source: 'paste' })
    setResumes([])
  }

  // ── Shared top bar ───────────────────────────────────────────────────────
  const TopBar = (
    <header className={cn(
      'sticky top-0 z-40 border-b backdrop-blur-xl',
      isLight
        ? 'border-gray-200 bg-white/80'
        : 'border-border/60 bg-background/60',
    )}>
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 gap-4">
        <Link href="/" aria-label="TalentMind AI home">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={cn(
              'flex items-center justify-center size-8 rounded-xl border transition-all',
              isLight
                ? 'border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-800 hover:bg-white hover:shadow-sm'
                : 'border-border/50 bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
            )}
          >
            {isLight ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>

          {/* History button */}
          {profile && (
            <button
              onClick={() => setShowHistoryPanel(true)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all',
                isLight
                  ? 'border-gray-200 bg-gray-50 text-gray-500 hover:text-gray-800 hover:bg-white hover:shadow-sm'
                  : 'border-border/50 bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/[0.04]',
              )}
            >
              <History className="size-3.5" />
              History
            </button>
          )}

          {/* Profile avatar / menu */}
          {profileLoaded && (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen((o) => !o)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all',
                  isLight
                    ? 'border-gray-200 bg-gray-50 hover:bg-white hover:shadow-sm'
                    : 'border-border/50 bg-white/[0.02] hover:bg-white/[0.04]',
                )}
              >
                <div className={cn(
                  'size-6 rounded-lg flex items-center justify-center text-xs font-bold',
                  isLight
                    ? 'bg-gradient-to-br from-blue-100 to-violet-100 text-blue-700 border border-blue-200'
                    : 'bg-gradient-to-br from-blue/40 to-purple/40 border border-white/10 text-white',
                )}>
                  {profile ? profile.name.charAt(0).toUpperCase() : <User className="size-3" />}
                </div>
                <span className={cn('text-xs max-w-[100px] truncate hidden sm:block', isLight ? 'text-gray-600' : 'text-muted-foreground')}>
                  {profile ? profile.name : 'Set up profile'}
                </span>
                <ChevronDown className={cn('size-3', isLight ? 'text-gray-400' : 'text-muted-foreground')} />
              </button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      'absolute right-0 top-full mt-2 w-56 rounded-2xl border shadow-2xl overflow-hidden z-50',
                      isLight
                        ? 'border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]'
                        : 'border-border/60 bg-[#0a0a0f]',
                    )}
                  >
                    {profile ? (
                      <>
                        <div className={cn('px-4 py-3 border-b', isLight ? 'border-gray-100' : 'border-border/40')}>
                          <p className={cn('text-sm font-semibold truncate', isLight ? 'text-gray-900' : 'text-foreground')}>{profile.name}</p>
                          {profile.email && <p className={cn('text-xs truncate', isLight ? 'text-gray-500' : 'text-muted-foreground')}>{profile.email}</p>}
                          {(profile.designation || profile.company) && (
                            <p className={cn('text-xs truncate', isLight ? 'text-gray-400' : 'text-muted-foreground/60')}>
                              {profile.designation} {profile.designation && profile.company && '·'} {profile.company}
                            </p>
                          )}
                        </div>
                        <div className="p-1.5">
                          <button
                            onClick={() => { setShowHistoryPanel(true); setProfileMenuOpen(false) }}
                            className={cn('w-full text-left px-3 py-2 rounded-xl text-sm transition-colors', isLight ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]')}
                          >
                            View history
                          </button>
                        </div>
                        <div className={cn('p-1.5 border-t', isLight ? 'border-gray-100' : 'border-border/40')}>
                          <button
                            onClick={handleSwitchUser}
                            className={cn('w-full text-left px-3 py-2 rounded-xl text-sm transition-colors', isLight ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50' : 'text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10')}
                          >
                            Sign out / Switch user
                          </button>
                        </div>
                      </>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <Link
            href="/"
            className={cn('hidden sm:flex items-center gap-1.5 text-sm transition-colors', isLight ? 'text-gray-400 hover:text-gray-800' : 'text-muted-foreground hover:text-foreground')}
          >
            <ArrowLeft className="size-4" />
            Home
          </Link>
        </div>
      </div>
    </header>
  )

  // ── Modals / Panels ──────────────────────────────────────────────────────
  const Overlays = (
    <>
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />
      {profile && (
        <HistoryPanel
          open={showHistoryPanel}
          onClose={() => setShowHistoryPanel(false)}
          profile={profile}
          onRestoreSession={handleRestoreSession}
        />
      )}
    </>
  )

  // ── Dashboard view ───────────────────────────────────────────────────────
  if (results) {
    return (
      <main className="relative min-h-svh">
        <AuroraBackground />
        {TopBar}
        {Overlays}
        <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10">
          <ResultsDashboard 
            results={results} 
            jobTitle={job.title} 
            onBack={resetAll} 
            onUpdateFeedback={handleUpdateFeedback}
            onDeleteResult={handleDeleteResult}
          />
        </div>
      </main>
    )
  }

  // ── Wizard view ──────────────────────────────────────────────────────────
  return (
    <main className="relative min-h-svh">
      <AuroraBackground />
      {Overlays}

      {/* Full-screen analysis overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
          >
            <div className="flex flex-col items-center gap-6 rounded-3xl border border-border/60 bg-white/[0.03] p-10 shadow-2xl">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-blue/20 blur-2xl" />
                <Loader2 className="relative size-12 animate-spin text-blue" />
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="text-xl font-semibold">Gemini is analyzing candidates...</h2>
                <p className="text-sm text-muted-foreground">
                  Processing resume {progress.done + 1} of {progress.total} for{' '}
                  <span className="font-medium text-foreground">{job.title}</span>
                </p>
              </div>
              <div className="w-64">
                <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{progress.done}/{progress.total}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue to-purple"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground/60">This may take 15–30 seconds per resume</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {TopBar}

      <div className="mx-auto w-full max-w-3xl px-4 pb-40 pt-10">
        {/* Heading */}
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-blue">
            <Sparkles className="size-3.5" />
            New analysis
            {profile && (
              <span className="ml-2 text-muted-foreground normal-case tracking-normal font-normal">
                · Welcome back, <span className="text-foreground">{profile.name.split(' ')[0]}</span>
              </span>
            )}
          </span>
          <h1 className="text-balance text-3xl font-semibold tracking-tight">
            Screen a batch of candidates
          </h1>
          <p className="text-pretty text-muted-foreground">
            Define the role, add resumes, and TalentMind ranks every candidate with explainable, evidence-backed scores.
            {profile && ' Results are auto-saved to your history.'}
          </p>
        </div>

        {/* Stepper */}
        <div className="mt-8 rounded-3xl border border-border bg-white/[0.02] p-3 sm:p-4">
          <Stepper steps={steps} current={current} onStepClick={setCurrent} />
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {analysisError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-400" />
              <div className="flex flex-col gap-1">
                <span className="font-medium text-rose-200">Analysis failed</span>
                <span className="text-rose-300/80 text-xs">{analysisError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step content */}
        <div className="mt-6 rounded-3xl border border-border bg-white/[0.02] p-5 sm:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {current === 0 && <JobStep value={job} onChange={setJob} />}
              {current === 1 && <ResumeStep files={resumes} onChange={setResumes} />}
              {current === 2 && <ReviewStep job={job} resumes={resumes} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <Button
            variant="ghost"
            onClick={back}
            disabled={current === 0 || isAnalyzing}
            className="text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">
              Step {current + 1} of {steps.length}
            </span>
            {current < steps.length - 1 ? (
              <Button
                onClick={next}
                disabled={!canContinue || isAnalyzing}
                className="rounded-xl bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40"
              >
                Continue
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                disabled={!canContinue || isAnalyzing}
                onClick={runAnalysis}
                className="rounded-xl bg-gradient-to-r from-blue to-purple text-white shadow-[0_0_30px_-6px] shadow-blue/60 hover:opacity-95 disabled:opacity-40"
              >
                {isAnalyzing ? (
                  <><Loader2 className="size-4 animate-spin" />Analyzing...</>
                ) : (
                  <><Sparkles className="size-4" />Run analysis</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
