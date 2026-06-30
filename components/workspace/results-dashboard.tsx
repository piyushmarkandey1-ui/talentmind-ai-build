'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AnalysisResult, RECOMMENDATION_META } from '@/lib/analysis-schema'
import { CandidateCard } from './candidate-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trophy, Users } from 'lucide-react'

interface ResultsDashboardProps {
  results: AnalysisResult[]
  onBack: () => void
}

export function ResultsDashboard({ results, onBack }: ResultsDashboardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const successfulResults = results.filter((r) => r.status === 'ok') as Extract<AnalysisResult, { status: 'ok' }>[]
  
  // Sort by overall score descending
  const ranked = [...successfulResults].sort((a, b) => b.analysis.overallScore - a.analysis.overallScore)

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Analysis Results</h2>
          <p className="text-muted-foreground mt-1">
            <Users className="inline size-4 mr-1.5" />
            {successfulResults.length} candidates analyzed
          </p>
        </div>
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="size-4 mr-2" />
          Start Over
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative">
        {/* Leaderboard Column */}
        <div className="md:col-span-4 flex flex-col gap-3">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
            <Trophy className="size-4 text-emerald-400" />
            Leaderboard
          </h3>
          
          <div className="flex flex-col gap-3">
            {ranked.map((res, index) => {
              const analysis = res.analysis
              const isSelected = selectedId === res.id || (!selectedId && index === 0)
              const meta = RECOMMENDATION_META[analysis.recommendation]
              
              return (
                <motion.button
                  key={res.id}
                  onClick={() => setSelectedId(res.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden
                    ${isSelected ? 'bg-white/[0.04] border-white/20 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]' : 'bg-white/[0.01] border-border/50 hover:bg-white/[0.02]'}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground truncate mr-2">
                      {analysis.candidateName}
                    </span>
                    <span className="text-xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                      {analysis.overallScore}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate mr-4">
                      {analysis.headline}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border text-xs font-medium shrink-0
                      ${meta.tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                      ${meta.tone === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                      ${meta.tone === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                      ${meta.tone === 'rose' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : ''}
                    `}>
                      {meta.label}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Details Column */}
        <div className="md:col-span-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedId || (ranked[0]?.id)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {ranked.length > 0 && (
                <CandidateCard 
                  result={ranked.find(r => r.id === selectedId) || ranked[0]} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
