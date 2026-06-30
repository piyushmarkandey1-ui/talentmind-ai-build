'use client'

import { motion } from 'motion/react'
import { AnalysisResult, DIMENSIONS, RECOMMENDATION_META } from '@/lib/analysis-schema'
import { CheckCircle2, XCircle, AlertCircle, Sparkles, BrainCircuit, MessageSquare, Lightbulb } from 'lucide-react'

export function CandidateCard({ result }: { result: Extract<AnalysisResult, { status: 'ok' }> }) {
  const analysis = result.analysis
  const meta = RECOMMENDATION_META[analysis.recommendation]

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 rounded-3xl border border-border/50 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden">
      {/* Background glow based on recommendation tone */}
      <div 
        className={`absolute -top-40 -right-40 w-80 h-80 blur-[100px] rounded-full opacity-20 pointer-events-none
          ${meta.tone === 'emerald' ? 'bg-emerald-500' : ''}
          ${meta.tone === 'blue' ? 'bg-blue-500' : ''}
          ${meta.tone === 'amber' ? 'bg-amber-500' : ''}
          ${meta.tone === 'rose' ? 'bg-rose-500' : ''}
        `}
      />

      <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="flex flex-col gap-2 z-10">
          <h2 className="text-2xl font-semibold">{analysis.candidateName}</h2>
          <p className="text-muted-foreground">{analysis.headline}</p>
        </div>
        
        <div className="flex items-center gap-4 z-10">
          <div className={`px-4 py-1.5 rounded-full border text-sm font-medium flex items-center gap-2
            ${meta.tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
            ${meta.tone === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
            ${meta.tone === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
            ${meta.tone === 'rose' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : ''}
          `}>
            {meta.tone === 'emerald' && <Sparkles className="size-4" />}
            {meta.label}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-3xl font-bold">{analysis.overallScore}<span className="text-lg text-muted-foreground font-normal">/100</span></span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Overall Fit</span>
          </div>
        </div>
      </div>

      <p className="text-pretty text-foreground/90 leading-relaxed border-l-2 border-primary/40 pl-4 italic">
        "{analysis.summary}"
      </p>

      {/* Dimensions Grid */}
      <div className="mt-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">Detailed Evaluation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DIMENSIONS.map((dim) => {
            const val = analysis.dimensions[dim.key]
            return (
              <div key={dim.key} className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col gap-3 group">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground/80">{dim.label}</span>
                  <span className="text-sm font-bold">{val.score}/100</span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${val.score}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full 
                      ${val.score >= 85 ? 'bg-emerald-500' : val.score >= 70 ? 'bg-blue-500' : val.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}
                    `}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground/80 transition-colors">
                  {val.rationale}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Strengths */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-emerald-500/10 bg-emerald-500/5">
          <h3 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            Key Strengths
          </h3>
          <ul className="flex flex-col gap-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="text-sm text-emerald-200/80 flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Concerns */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-rose-500/10 bg-rose-500/5">
          <h3 className="text-sm font-medium text-rose-400 flex items-center gap-2">
            <AlertCircle className="size-4" />
            Concerns & Gaps
          </h3>
          <ul className="flex flex-col gap-2">
            {analysis.concerns.map((s, i) => (
              <li key={i} className="text-sm text-rose-200/80 flex items-start gap-2">
                <span className="text-rose-500 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* Matched & Missing Skills */}
        <div className="flex flex-col gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.01]">
          <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2">
            <BrainCircuit className="size-4" />
            Skill Alignment
          </h3>
          
          <div>
            <span className="text-xs text-emerald-400 uppercase tracking-wider mb-2 block">Verified Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {analysis.matchedSkills.map((s, i) => (
                <span key={i} className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-300 text-xs border border-emerald-500/20">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {analysis.missingSkills.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-rose-400 uppercase tracking-wider mb-2 block">Missing / Unverified</span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingSkills.map((s, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-rose-500/10 text-rose-300 text-xs border border-rose-500/20 flex items-center gap-1">
                    <XCircle className="size-3" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suggested Questions */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-blue-500/10 bg-blue-500/5">
          <h3 className="text-sm font-medium text-blue-400 flex items-center gap-2">
            <MessageSquare className="size-4" />
            Interview Guide
          </h3>
          <p className="text-xs text-blue-200/60 mb-1">Recommended questions to probe the candidate:</p>
          <ul className="flex flex-col gap-3">
            {analysis.suggestedQuestions.map((q, i) => (
              <li key={i} className="text-sm text-blue-100 flex items-start gap-2 bg-black/20 p-3 rounded-lg border border-blue-500/20">
                <Lightbulb className="size-4 text-blue-400 shrink-0 mt-0.5" />
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
