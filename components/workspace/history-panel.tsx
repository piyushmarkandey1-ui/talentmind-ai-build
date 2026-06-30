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

interface HistoryPanelProps {
  open: boolean
  onClose: () => void
  profile: RecruiterProfile
  onRestoreSession: (session: AnalysisSession) => void
}

function ResultBadge({ result }: { result: AnalysisResult }) {
  if (result.status === 'error') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
        Error
      </span>
    )
  }
  const meta = RECOMMENDATION_META[result.analysis.recommendation]
  return (
    <span
      className={[
        'px-2 py-0.5 rounded-full text-[10px] font-medium border',
        meta.tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : '',
        meta.tone === 'blue'    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'       : '',
        meta.tone === 'amber'   ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'    : '',
        meta.tone === 'rose'    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'       : '',
      ].join(' ')}
    >
      {result.status === 'ok' ? result.analysis.candidateName.split(' ')[0] : '—'} · {meta.label}
    </span>
  )
}

export function HistoryPanel({ open, onClose, profile, onRestoreSession }: HistoryPanelProps) {
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
            className="fixed inset-0 z-40 bg-black"
          />

          {/* Slide-over panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col bg-[#080810] border-l border-border/50 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-blue" />
                  <span className="font-semibold text-foreground">Analysis History</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Linked to <span className="text-foreground/70">{profile.email}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="size-8 flex items-center justify-center rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Profile summary */}
            <div className="mx-4 mt-4 flex items-center gap-3 p-4 rounded-2xl border border-border/40 bg-white/[0.02]">
              <div className="size-10 rounded-xl bg-gradient-to-br from-blue/30 to-purple/30 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">{profile.name}</span>
                {(profile.designation || profile.company) && (
                  <span className="text-xs text-muted-foreground truncate">
                    {profile.designation} {profile.designation && profile.company && '·'} {profile.company}
                  </span>
                )}
              </div>
            </div>

            {/* Sessions list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground">
                  <Inbox className="size-10 opacity-30" />
                  <div>
                    <p className="font-medium text-foreground/50">No sessions yet</p>
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
                      className="group flex flex-col gap-3 rounded-2xl border border-border/40 bg-white/[0.02] p-4 hover:border-border/70 hover:bg-white/[0.03] transition-all"
                    >
                      {/* Session header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="size-8 rounded-lg bg-blue/10 border border-blue/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Briefcase className="size-3.5 text-blue" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold truncate">
                              {session.jobTitle || 'Untitled role'}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <CalendarDays className="size-3" />
                              {formatSessionDate(session.date)}
                            </span>
                          </div>
                        </div>
                        {topScore !== null && (
                          <span className="text-sm font-bold text-foreground shrink-0">
                            {topScore}
                            <span className="text-xs font-normal text-muted-foreground">/100</span>
                          </span>
                        )}
                      </div>

                      {/* Candidates */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Users className="size-3 text-muted-foreground/50" />
                        {(session.results as AnalysisResult[]).map((r) => (
                          <ResultBadge key={r.id} result={r} />
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                        <button
                          onClick={() => handleRestore(session)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-blue hover:bg-blue/10 transition-colors"
                        >
                          View results
                          <ChevronRight className="size-3" />
                        </button>

                        {confirmDelete === session.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Delete?</span>
                            <button
                              onClick={() => handleDelete(session.id)}
                              className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(session.id)}
                            className="size-7 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
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
            <div className="px-4 pb-4 pt-2 border-t border-border/30 text-center">
              <p className="text-[10px] text-muted-foreground/40">
                Sessions stored locally in your browser · {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
