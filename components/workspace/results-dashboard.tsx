'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { AnalysisResult } from '@/lib/analysis-schema'
import { RECOMMENDATION_META } from '@/lib/analysis-schema'
import { CandidateCard } from './candidate-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trophy, Users, AlertCircle } from 'lucide-react'

interface ResultsDashboardProps {
  results: AnalysisResult[]
  jobTitle?: string
  onBack: () => void
}

export function ResultsDashboard({ results, jobTitle = '', onBack }: ResultsDashboardProps) {
  const successfulResults = results.filter(
    (r): r is Extract<AnalysisResult, { status: 'ok' }> => r.status === 'ok'
  )
  const failedResults = results.filter((r) => r.status === 'error')

  // Sort by overall score descending
  const ranked = [...successfulResults].sort(
    (a, b) => b.analysis.overallScore - a.analysis.overallScore
  )

  const [selectedId, setSelectedId] = useState<string>(ranked[0]?.id ?? '')

  const selectedResult = ranked.find((r) => r.id === selectedId) ?? ranked[0]

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Analysis Results</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Users className="inline size-4" />
            {successfulResults.length} candidate{successfulResults.length !== 1 ? 's' : ''} analyzed
            {failedResults.length > 0 && (
              <span className="text-rose-400 ml-1">· {failedResults.length} failed</span>
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 mr-2" />
          Start Over
        </Button>
      </div>

      {/* Failed results banner */}
      {failedResults.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-rose-300">
            <AlertCircle className="size-4" />
            {failedResults.length} resume{failedResults.length > 1 ? 's' : ''} could not be analyzed
          </div>
          <ul className="flex flex-col gap-1">
            {failedResults.map((r) => (
              <li key={r.id} className="text-xs text-rose-300/70">
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
            <p className="font-medium text-foreground">No successful analyses</p>
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
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-1">
              <Trophy className="size-3.5 text-amber-400" />
              Ranked by fit score
            </p>

            <div className="flex flex-col gap-2">
              {ranked.map((res, index) => {
                const { analysis } = res
                const isSelected = res.id === selectedId
                const meta = RECOMMENDATION_META[analysis.recommendation]

                return (
                  <motion.button
                    key={res.id}
                    onClick={() => setSelectedId(res.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={[
                      'group flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden',
                      isSelected
                        ? 'bg-white/[0.05] border-white/20 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]'
                        : 'bg-white/[0.01] border-border/50 hover:bg-white/[0.03] hover:border-border',
                    ].join(' ')}
                  >
                    {/* Rank badge */}
                    <span
                      className={[
                        'absolute top-3 right-3 size-6 flex items-center justify-center rounded-full text-xs font-bold',
                        index === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-muted-foreground',
                      ].join(' ')}
                    >
                      {index + 1}
                    </span>

                    <div className="flex items-start gap-3 pr-7">
                      {/* Score ring */}
                      <div
                        className={[
                          'shrink-0 flex items-center justify-center size-11 rounded-xl text-sm font-bold',
                          meta.tone === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' : '',
                          meta.tone === 'blue' ? 'bg-blue-500/15 text-blue-400' : '',
                          meta.tone === 'amber' ? 'bg-amber-500/15 text-amber-400' : '',
                          meta.tone === 'rose' ? 'bg-rose-500/15 text-rose-400' : '',
                        ].join(' ')}
                      >
                        {analysis.overallScore}
                      </div>

                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-medium text-sm text-foreground truncate">
                          {analysis.candidateName}
                        </span>
                        <span className="text-xs text-muted-foreground truncate leading-tight">
                          {analysis.headline}
                        </span>
                        <span
                          className={[
                            'mt-1 self-start px-2 py-0.5 rounded-full border text-[10px] font-medium',
                            meta.tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : '',
                            meta.tone === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : '',
                            meta.tone === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : '',
                            meta.tone === 'rose' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : '',
                          ].join(' ')}
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
                  <CandidateCard result={selectedResult} jobTitle={jobTitle} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
