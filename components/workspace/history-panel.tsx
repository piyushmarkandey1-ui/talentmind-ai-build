'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  Clock,
  Briefcase,
  Trash2,
  ChevronRight,
  Users,
  CalendarDays,
  Inbox,
} from 'lucide-react'
import {
  getSessionsByEmail,
  deleteSession,
  formatSessionDate,
  type AnalysisSession,
  type RecruiterProfile,
} from '@/lib/recruiter-store'
import type { AnalysisResult } from '@/lib/analysis-schema'
import { RECOMMENDATION_META } from '@/lib/analysis-schema'
import { useTheme } from '@/components/site/theme-provider'
import { cn } from '@/lib/utils'

interface HistoryPanelProps {
  open: boolean
  onClose: () => void
  profile: RecruiterProfile
  onRestoreSession: (session: AnalysisSession) => void
}

function ResultBadge({ result, isLight }: { result: AnalysisResult; isLight: boolean }) {
  if (result.status === 'error') {
    return (
      <span className={cn('px-2 py-0.5 rounded-full text-[10px] border', isLight ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-400 border-rose-500/20')}>
        Error
      </span>
    )
  }
  const meta = RECOMMENDATION_META[result.analysis.recommendation]
  const badgeCls: Record<typeof meta.tone, { dark: string; light: string }> = {
    emerald: { dark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    blue:    { dark: 'bg-blue-500/10 text-blue-400 border-blue-500/20',           light: 'bg-blue-50 text-blue-700 border-blue-200' },
    amber:   { dark: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       light: 'bg-amber-50 text-amber-700 border-amber-200' },
    rose:    { dark: 'bg-rose-500/10 text-rose-400 border-rose-500/20',           light: 'bg-rose-50 text-rose-700 border-rose-200' },
  }
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-[10px] font-medium border',
        isLight ? badgeCls[meta.tone].light : badgeCls[meta.tone].dark
      )}
    >
      {result.status === 'ok' ? result.analysis.candidateName.split(' ')[0] : '—'} · {meta.label}
    </span>
  )
}

export function HistoryPanel({ open, onClose, profile, onRestoreSession }: HistoryPanelProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  
  const [sessions, setSessions] = useState<AnalysisSession[]>(() =>
    getSessionsByEmail(profile.email)
  )
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    deleteSession(id)
    setSessions(getSessionsByEmail(profile.email))
    setConfirmDelete(null)
  }

  const handleRestore = (session: AnalysisSession) => {
    onRestoreSession(session)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={cn('fixed inset-0 z-40', isLight ? 'bg-gray-900/40 backdrop-blur-sm' : 'bg-black')}
          />

          {/* Slide-over panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={cn(
              'fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col border-l shadow-2xl',
              isLight ? 'bg-white border-gray-200 shadow-[-10px_0_40px_rgba(0,0,0,0.1)]' : 'bg-[#080810] border-border/50'
            )}
          >
            {/* Header */}
            <div className={cn('flex items-center justify-between px-6 py-5 border-b', isLight ? 'border-gray-200' : 'border-border/40')}>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Clock className={cn('size-4', isLight ? 'text-blue-600' : 'text-blue')} />
                  <span className={cn('font-semibold', isLight ? 'text-gray-900' : 'text-foreground')}>Analysis History</span>
                </div>
                <p className={cn('text-xs', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
                  Linked to <span className={cn(isLight ? 'text-gray-700' : 'text-foreground/70')}>{profile.email}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className={cn(
                  'size-8 flex items-center justify-center rounded-lg border transition-all',
                  isLight ? 'border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100' : 'border-border/50 text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                )}
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Profile summary */}
            <div className={cn('mx-4 mt-4 flex items-center gap-3 p-4 rounded-2xl border', isLight ? 'bg-gray-50 border-gray-200' : 'border-border/40 bg-white/[0.02]')}>
              <div className={cn(
                'size-10 rounded-xl flex items-center justify-center text-sm font-bold',
                isLight ? 'bg-gradient-to-br from-blue-100 to-violet-100 text-blue-700 border border-blue-200' : 'bg-gradient-to-br from-blue/30 to-purple/30 border border-white/10 text-white'
              )}>
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={cn('text-sm font-semibold truncate', isLight ? 'text-gray-900' : '')}>{profile.name}</span>
                {(profile.designation || profile.company) && (
                  <span className={cn('text-xs truncate', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
                    {profile.designation} {profile.designation && profile.company && '·'} {profile.company}
                  </span>
                )}
              </div>
            </div>

            {/* Sessions list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {sessions.length === 0 ? (
                <div className={cn('flex flex-col items-center justify-center gap-3 py-20 text-center', isLight ? 'text-gray-400' : 'text-muted-foreground')}>
                  <Inbox className="size-10 opacity-30" />
                  <div>
                    <p className={cn('font-medium', isLight ? 'text-gray-600' : 'text-foreground/50')}>No sessions yet</p>
                    <p className="text-xs mt-1">
                      Run your first analysis and it will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                sessions.map((session) => {
                  const okResults = (session.results as AnalysisResult[]).filter(
                    (r) => r.status === 'ok'
                  )
                  const topScore =
                    okResults.length > 0
                      ? Math.max(
                          ...(okResults as Extract<AnalysisResult, { status: 'ok' }>[]).map(
                            (r) => r.analysis.overallScore
                          )
                        )
                      : null

                  return (
                    <motion.div
                      key={session.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={cn(
                        'group flex flex-col gap-3 rounded-2xl border p-4 transition-all',
                        isLight ? 'bg-white border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md' : 'border-border/40 bg-white/[0.02] hover:border-border/70 hover:bg-white/[0.03]'
                      )}
                    >
                      {/* Session header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={cn('size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', isLight ? 'bg-blue-50 border border-blue-100' : 'bg-blue/10 border border-blue/20')}>
                            <Briefcase className={cn('size-3.5', isLight ? 'text-blue-600' : 'text-blue')} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className={cn('text-sm font-semibold truncate', isLight ? 'text-gray-900' : '')}>
                              {session.jobTitle || 'Untitled role'}
                            </span>
                            <span className={cn('text-[11px] flex items-center gap-1 mt-0.5', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
                              <CalendarDays className="size-3" />
                              {formatSessionDate(session.date)}
                            </span>
                          </div>
                        </div>
                        {topScore !== null && (
                          <span className={cn('text-sm font-bold shrink-0', isLight ? 'text-gray-900' : 'text-foreground')}>
                            {topScore}
                            <span className={cn('text-xs font-normal', isLight ? 'text-gray-400' : 'text-muted-foreground')}>/100</span>
                          </span>
                        )}
                      </div>

                      {/* Candidates */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Users className={cn('size-3', isLight ? 'text-gray-400' : 'text-muted-foreground/50')} />
                        {(session.results as AnalysisResult[]).map((r) => (
                          <ResultBadge key={r.id} result={r} isLight={isLight} />
                        ))}
                      </div>

                      {/* Actions */}
                      <div className={cn('flex items-center gap-2 pt-1 border-t', isLight ? 'border-gray-100' : 'border-border/30')}>
                        <button
                          onClick={() => handleRestore(session)}
                          className={cn('flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors', isLight ? 'text-blue-600 hover:bg-blue-50' : 'text-blue hover:bg-blue/10')}
                        >
                          View results
                          <ChevronRight className="size-3" />
                        </button>

                        {confirmDelete === session.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className={cn('text-xs', isLight ? 'text-gray-500' : 'text-muted-foreground')}>Delete?</span>
                            <button
                              onClick={() => handleDelete(session.id)}
                              className="text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className={cn('text-xs transition-colors', isLight ? 'text-gray-500 hover:text-gray-900' : 'text-muted-foreground hover:text-foreground')}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(session.id)}
                            className={cn('size-7 flex items-center justify-center rounded-lg transition-all', isLight ? 'text-gray-400 hover:text-rose-600 hover:bg-rose-50' : 'text-muted-foreground/40 hover:text-rose-400 hover:bg-rose-500/10')}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className={cn('px-4 pb-4 pt-2 border-t text-center', isLight ? 'border-gray-100' : 'border-border/30')}>
              <p className={cn('text-[10px]', isLight ? 'text-gray-400' : 'text-muted-foreground/40')}>
                Sessions stored locally in your browser · {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
