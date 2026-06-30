'use client'

import { motion } from 'motion/react'
import type { AnalysisResult, RecruiterFeedback } from '@/lib/analysis-schema'
import { DIMENSIONS, RECOMMENDATION_META } from '@/lib/analysis-schema'
import { generateReportHTML } from '@/lib/generate-report'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  BrainCircuit,
  MessageSquare,
  Lightbulb,
  Download,
  ClipboardEdit,
} from 'lucide-react'
import { useState } from 'react'

type OkResult = Extract<AnalysisResult, { status: 'ok' }>

export function CandidateCard({
  result,
  jobTitle = '',
  onUpdateFeedback,
}: {
  result: OkResult
  jobTitle?: string
  onUpdateFeedback?: (feedback: RecruiterFeedback) => void
}) {
  const [exporting, setExporting] = useState(false)
  const [feedbackNotes, setFeedbackNotes] = useState(result.feedback?.notes ?? '')
  const [decision, setDecision] = useState<'yes' | 'no' | 'hold' | null>(result.feedback?.decision ?? null)

  const handleDecision = (d: 'yes' | 'no' | 'hold' | null) => {
    setDecision(d)
    onUpdateFeedback?.({ decision: d, notes: feedbackNotes })
  }

  const handleNotesBlur = () => {
    if (feedbackNotes !== (result.feedback?.notes ?? '')) {
      onUpdateFeedback?.({ decision, notes: feedbackNotes })
    }
  }

  const handleExport = () => {
    setExporting(true)
    const html = generateReportHTML(result.analysis, result.fileName, jobTitle, result.feedback)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    // Give the window time to load fonts before print dialog
    if (win) {
      win.onload = () => {
        setTimeout(() => {
          win.print()
          URL.revokeObjectURL(url)
        }, 800)
      }
    } else {
      // Fallback: direct download
      const a = document.createElement('a')
      a.href = url
      a.download = `TalentMind_${result.analysis.candidateName.replace(/\s+/g, '_')}_Report.html`
      a.click()
      URL.revokeObjectURL(url)
    }
    setTimeout(() => setExporting(false), 2000)
  }
  const { analysis } = result
  const meta = RECOMMENDATION_META[analysis.recommendation]

  const toneGlow: Record<typeof meta.tone, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  }
  const toneText: Record<typeof meta.tone, string> = {
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    rose: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 rounded-3xl border border-border/60 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className={`absolute -top-32 -right-32 w-64 h-64 blur-[100px] rounded-full opacity-15 pointer-events-none ${toneGlow[meta.tone]}`}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between z-10">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold leading-tight">{analysis.candidateName}</h2>
          <p className="text-sm text-muted-foreground">{analysis.headline}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 ${toneText[meta.tone]}`}
          >
            {meta.tone === 'emerald' && <Sparkles className="size-3" />}
            {meta.label}
          </span>
          <div className="text-right">
            <div className="text-3xl font-bold leading-none">
              {analysis.overallScore}
              <span className="text-base font-normal text-muted-foreground">/100</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
              Overall Fit
            </div>
          </div>
          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            title="Export as PDF"
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 bg-white/[0.03] hover:bg-white/[0.06] hover:border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-all disabled:opacity-50 shrink-0"
          >
            <Download className="size-3.5" />
            {exporting ? 'Preparing...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/30 pl-4 italic z-10">
        &ldquo;{analysis.summary}&rdquo;
      </p>

      {/* Dimension scores */}
      <div className="z-10">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
          Evaluation Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DIMENSIONS.map((dim) => {
            const val = analysis.dimensions[dim.key]
            const barColor =
              val.score >= 85
                ? 'from-emerald-500 to-emerald-400'
                : val.score >= 70
                  ? 'from-blue-500 to-blue-400'
                  : val.score >= 50
                    ? 'from-amber-500 to-amber-400'
                    : 'from-rose-500 to-rose-400'

            return (
              <div
                key={dim.key}
                className="group bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col gap-2.5"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-foreground/80">{dim.label}</span>
                  <span className="text-xs font-bold tabular-nums">{val.score}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${val.score}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed group-hover:text-foreground/70 transition-colors">
                  {val.rationale}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Strengths & Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-10">
        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-emerald-500/15 bg-emerald-500/5">
          <h3 className="text-xs font-medium text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
            <CheckCircle2 className="size-3.5" />
            Key Strengths
          </h3>
          <ul className="flex flex-col gap-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="text-xs text-emerald-200/80 flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-500 mt-0.5 shrink-0">▸</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-rose-500/15 bg-rose-500/5">
          <h3 className="text-xs font-medium text-rose-400 flex items-center gap-2 uppercase tracking-wider">
            <AlertCircle className="size-3.5" />
            Concerns & Gaps
          </h3>
          <ul className="flex flex-col gap-2">
            {analysis.concerns.map((s, i) => (
              <li key={i} className="text-xs text-rose-200/80 flex items-start gap-2 leading-relaxed">
                <span className="text-rose-500 mt-0.5 shrink-0">▸</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Skill alignment */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.01] z-10">
        <h3 className="text-xs font-medium text-foreground/80 flex items-center gap-2 uppercase tracking-wider">
          <BrainCircuit className="size-3.5" />
          Skill Alignment
        </h3>

        <div className="flex flex-col gap-3">
          {analysis.matchedSkills.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 block mb-2">
                ✓ Verified
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matchedSkills.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-[11px] border border-emerald-500/20"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.missingSkills.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-rose-400 block mb-2">
                ✗ Missing / Unverified
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingSkills.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 text-[11px] border border-rose-500/20 flex items-center gap-1"
                  >
                    <XCircle className="size-3 shrink-0" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interview guide */}
      {analysis.suggestedQuestions.length > 0 && (
        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-blue-500/15 bg-blue-500/5 z-10">
          <h3 className="text-xs font-medium text-blue-400 flex items-center gap-2 uppercase tracking-wider">
            <MessageSquare className="size-3.5" />
            Interview Guide
          </h3>
          <ul className="flex flex-col gap-2.5">
            {analysis.suggestedQuestions.map((q, i) => (
              <li
                key={i}
                className="text-xs text-blue-100/80 flex items-start gap-2.5 bg-black/20 p-3 rounded-xl border border-blue-500/15 leading-relaxed"
              >
                <Lightbulb className="size-3.5 text-blue-400 shrink-0 mt-0.5" />
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recruiter Feedback */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.03] z-10 mt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-foreground/90 flex items-center gap-2 uppercase tracking-wider">
            <ClipboardEdit className="size-3.5" />
            Recruiter Feedback
          </h3>
          
          {/* Decision toggles */}
          <div className="flex items-center gap-2 p-1 rounded-lg bg-black/40 border border-white/5">
            <button
              onClick={() => handleDecision(decision === 'yes' ? null : 'yes')}
              className={['px-3 py-1 rounded-md text-[11px] font-medium transition-all', decision === 'yes' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-muted-foreground hover:text-foreground border border-transparent'].join(' ')}
            >
              Selected
            </button>
            <button
              onClick={() => handleDecision(decision === 'hold' ? null : 'hold')}
              className={['px-3 py-1 rounded-md text-[11px] font-medium transition-all', decision === 'hold' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-muted-foreground hover:text-foreground border border-transparent'].join(' ')}
            >
              Hold
            </button>
            <button
              onClick={() => handleDecision(decision === 'no' ? null : 'no')}
              className={['px-3 py-1 rounded-md text-[11px] font-medium transition-all', decision === 'no' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-muted-foreground hover:text-foreground border border-transparent'].join(' ')}
            >
              Rejected
            </button>
          </div>
        </div>

        <textarea
          value={feedbackNotes}
          onChange={(e) => setFeedbackNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Add your private notes about this candidate... (Auto-saves to your history)"
          className="w-full min-h-[100px] bg-black/20 border border-white/5 rounded-xl p-3 text-sm text-foreground/90 placeholder:text-muted-foreground/40 resize-y focus:outline-none focus:border-white/20 transition-colors"
        />
      </div>
    </div>
  )
}
