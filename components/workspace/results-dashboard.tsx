'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { AnalysisResult, RecruiterFeedback } from '@/lib/analysis-schema'
import { RECOMMENDATION_META } from '@/lib/analysis-schema'
import { CandidateCard } from './candidate-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trophy, Users, AlertCircle, Save, Check, Loader2 } from 'lucide-react'
import { useTheme } from '@/components/site/theme-provider'
import { cn } from '@/lib/utils'

interface ResultsDashboardProps {
  results: AnalysisResult[]
  jobTitle?: string
  onBack: () => void
  onUpdateFeedback?: (resultId: string, feedback: RecruiterFeedback) => void
  onDeleteResult?: (resultId: string) => void
  onSaveSession?: () => Promise<void>
  isSaved?: boolean
}

export function ResultsDashboard({ results, jobTitle = '', onBack, onUpdateFeedback, onDeleteResult, onSaveSession, isSaved = false }: ResultsDashboardProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const successfulResults = results.filter(
    (r): r is Extract<AnalysisResult, { status: 'ok' }> => r.status === 'ok'
  )
  const failedResults = results.filter((r) => r.status === 'error')

  const ranked = [...successfulResults].sort(
    (a, b) => b.analysis.overallScore - a.analysis.overallScore
  )

  const [selectedId, setSelectedId] = useState<string>(ranked[0]?.id ?? '')
  const selectedResult = ranked.find((r) => r.id === selectedId) ?? ranked[0]
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveClick = async () => {
    if (!onSaveSession || isSaved || isSaving) return
    setIsSaving(true)
    try {
      await onSaveSession()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className={cn('text-2xl font-semibold tracking-tight', isLight ? 'text-gray-900' : '')}>
            Analysis Results
          </h2>
          <p className={cn('text-sm flex items-center gap-1.5', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
            <Users className="inline size-4" />
            {successfulResults.length} candidate{successfulResults.length !== 1 ? 's' : ''} analyzed
            {failedResults.length > 0 && (
              <span className={isLight ? 'text-rose-600 ml-1' : 'text-rose-400 ml-1'}>
                · {failedResults.length} failed
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onBack}
            className={cn(isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' : 'text-muted-foreground hover:text-foreground')}
          >
            <ArrowLeft className="size-4 mr-2" />
            Start Over
          </Button>

          {onSaveSession && (
            <Button
              onClick={handleSaveClick}
              disabled={isSaved || isSaving}
              className={cn(
                'rounded-xl text-white font-medium shadow-sm transition-all',
                isSaved 
                  ? 'bg-emerald-500 hover:bg-emerald-600 disabled:opacity-100'
                  : 'bg-gradient-to-r from-blue to-purple hover:opacity-90 shadow-blue/20'
              )}
            >
              {isSaving ? (
                <><Loader2 className="size-4 mr-2 animate-spin" /> Saving...</>
              ) : isSaved ? (
                <><Check className="size-4 mr-2" /> Saved to History</>
              ) : (
                <><Save className="size-4 mr-2" /> Save Results</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Failed results banner */}
      {failedResults.length > 0 && (
        <div
          className={cn(
            'flex flex-col gap-2 rounded-2xl border p-4',
            isLight ? 'border-rose-200 bg-rose-50' : 'border-rose-500/20 bg-rose-500/5',
          )}
        >
          <div className={cn('flex items-center gap-2 text-sm font-medium', isLight ? 'text-rose-700' : 'text-rose-300')}>
            <AlertCircle className="size-4" />
            {failedResults.length} resume{failedResults.length > 1 ? 's' : ''} could not be analyzed
          </div>
          <ul className="flex flex-col gap-1">
            {failedResults.map((r) => (
              <li key={r.id} className={cn('text-xs', isLight ? 'text-rose-600' : 'text-rose-300/70')}>
                <span className="font-medium">{r.fileName}</span>
                {r.status === 'error' && ` — ${r.error}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {ranked.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center text-muted-foreground">
          <AlertCircle className="size-10 text-rose-400" />
          <div>
            <p className={cn('font-medium', isLight ? 'text-gray-900' : 'text-foreground')}>No successful analyses</p>
            <p className="text-sm mt-1">All resumes failed to be analyzed. Please check your API key and try again.</p>
          </div>
          <Button onClick={onBack} className="mt-2 rounded-xl bg-foreground text-background">
            Start Over
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Leaderboard sidebar */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <p className={cn('text-xs font-medium uppercase tracking-wider flex items-center gap-2 mb-1', isLight ? 'text-gray-400' : 'text-muted-foreground')}>
              <Trophy className="size-3.5 text-amber-400" aria-hidden="true" />
              Ranked by fit score
            </p>

            <div className="flex flex-col gap-2">
              {ranked.map((res, index) => {
                const { analysis } = res
                const isSelected = res.id === selectedId
                const meta = RECOMMENDATION_META[analysis.recommendation]

                // Light mode tone colors for sidebar cards
                const scoreBg: Record<typeof meta.tone, { dark: string; light: string }> = {
                  emerald: { dark: 'bg-emerald-500/15 text-emerald-400', light: 'bg-emerald-100 text-emerald-700' },
                  blue:    { dark: 'bg-blue-500/15 text-blue-400',       light: 'bg-blue-100 text-blue-700' },
                  amber:   { dark: 'bg-amber-500/15 text-amber-400',     light: 'bg-amber-100 text-amber-700' },
                  rose:    { dark: 'bg-rose-500/15 text-rose-400',       light: 'bg-rose-100 text-rose-700' },
                }
                const badgeCls: Record<typeof meta.tone, { dark: string; light: string }> = {
                  emerald: { dark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  blue:    { dark: 'bg-blue-500/10 text-blue-400 border-blue-500/20',           light: 'bg-blue-50 text-blue-700 border-blue-200' },
                  amber:   { dark: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       light: 'bg-amber-50 text-amber-700 border-amber-200' },
                  rose:    { dark: 'bg-rose-500/10 text-rose-400 border-rose-500/20',           light: 'bg-rose-50 text-rose-700 border-rose-200' },
                }

                return (
                  <motion.button
                    key={res.id}
                    onClick={() => setSelectedId(res.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      'group flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden',
                      isLight
                        ? isSelected
                          ? 'bg-white border-blue-300 shadow-[6px_6px_16px_rgba(163,177,198,0.4),-6px_-6px_16px_rgba(255,255,255,0.9)]'
                          : 'bg-[#F4F6F8] border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md'
                        : isSelected
                          ? 'bg-white/[0.05] border-white/20 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]'
                          : 'bg-white/[0.01] border-border/50 hover:bg-white/[0.03] hover:border-border',
                    )}
                  >
                    {/* Rank badge */}
                    <span
                      className={cn(
                        'absolute top-3 right-3 size-6 flex items-center justify-center rounded-full text-xs font-bold',
                        index === 0
                          ? isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-400'
                          : isLight ? 'bg-gray-100 text-gray-500' : 'bg-white/5 text-muted-foreground',
                      )}
                    >
                      {index + 1}
                    </span>

                    <div className="flex items-start gap-3 pr-7">
                      {/* Score chip */}
                      <div
                        className={cn(
                          'shrink-0 flex items-center justify-center size-11 rounded-xl text-sm font-bold',
                          isLight ? scoreBg[meta.tone].light : scoreBg[meta.tone].dark,
                        )}
                      >
                        {analysis.overallScore}
                      </div>

                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className={cn('font-medium text-sm truncate', isLight ? 'text-gray-900' : 'text-foreground')}>
                          {analysis.candidateName}
                        </span>
                        <span className={cn('text-xs truncate leading-tight', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
                          {analysis.headline}
                        </span>
                        <span
                          className={cn(
                            'mt-1 self-start px-2 py-0.5 rounded-full border text-[10px] font-medium',
                            isLight ? badgeCls[meta.tone].light : badgeCls[meta.tone].dark,
                          )}
                        >
                          {meta.label}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Detail panel */}
          <div className="md:col-span-8">
            <AnimatePresence mode="wait">
              {selectedResult && (
                <motion.div
                  key={selectedResult.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <CandidateCard
                    result={selectedResult}
                    jobTitle={jobTitle}
                    onUpdateFeedback={(feedback) => onUpdateFeedback?.(selectedResult.id, feedback)}
                    onDelete={() => onDeleteResult?.(selectedResult.id)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
