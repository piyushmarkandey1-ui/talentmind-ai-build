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
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '@/components/site/theme-provider'
import { cn } from '@/lib/utils'

type OkResult = Extract<AnalysisResult, { status: 'ok' }>

export function CandidateCard({
  result,
  jobTitle = '',
  onUpdateFeedback,
  onDelete,
}: {
  result: OkResult
  jobTitle?: string
  onUpdateFeedback?: (feedback: RecruiterFeedback) => void
  onDelete?: () => void
}) {
  const [exporting, setExporting] = useState(false)
  const [feedbackNotes, setFeedbackNotes] = useState(result.feedback?.notes ?? '')
  const [decision, setDecision] = useState<'yes' | 'no' | 'hold' | null>(result.feedback?.decision ?? null)
  const { theme } = useTheme()
  const isLight = theme === 'light'

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
    if (win) {
      win.onload = () => {
        setTimeout(() => {
          win.print()
          URL.revokeObjectURL(url)
        }, 800)
      }
    } else {
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

  // Tone colors — light vs dark
  const toneGlow: Record<typeof meta.tone, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  }

  const toneBadge: Record<typeof meta.tone, { dark: string; light: string }> = {
    emerald: {
      dark: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      light: 'text-emerald-700 border-emerald-300 bg-emerald-50',
    },
    blue: {
      dark: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      light: 'text-blue-700 border-blue-300 bg-blue-50',
    },
    amber: {
      dark: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      light: 'text-amber-700 border-amber-300 bg-amber-50',
    },
    rose: {
      dark: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      light: 'text-rose-700 border-rose-300 bg-rose-50',
    },
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-6 p-6 md:p-8 rounded-3xl border relative overflow-hidden',
        isLight
          ? 'bg-white border-gray-200 shadow-[8px_8px_24px_rgba(163,177,198,0.35),-8px_-8px_24px_rgba(255,255,255,0.9)]'
          : 'border-border/60 bg-white/[0.02] backdrop-blur-sm',
      )}
    >
      {/* Background radial glow */}
      <div
        className={`absolute -top-32 -right-32 w-64 h-64 blur-[100px] rounded-full pointer-events-none ${toneGlow[meta.tone]} ${isLight ? 'opacity-5' : 'opacity-15'}`}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between z-10">
        <div className="flex flex-col gap-1">
          <h2 className={cn('text-2xl font-semibold leading-tight', isLight ? 'text-gray-900' : '')}>
            {analysis.candidateName}
          </h2>
          <p className={cn('text-sm', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
            {analysis.headline}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={cn(
              'px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5',
              isLight ? toneBadge[meta.tone].light : toneBadge[meta.tone].dark,
            )}
          >
            {meta.tone === 'emerald' && <Sparkles className="size-3" />}
            {meta.label}
          </span>
          <div className="text-right">
            <div className={cn('text-3xl font-bold leading-none', isLight ? 'text-gray-900' : '')}>
              {analysis.overallScore}
              <span className={cn('text-base font-normal', isLight ? 'text-gray-400' : 'text-muted-foreground')}>/100</span>
            </div>
            <div className={cn('text-[10px] uppercase tracking-wider mt-0.5', isLight ? 'text-gray-400' : 'text-muted-foreground')}>
              Overall Fit
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export button */}
            <button
              onClick={handleExport}
              disabled={exporting}
              title="Export as PDF"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all disabled:opacity-50 shrink-0',
                isLight
                  ? 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-white hover:text-gray-800 hover:border-gray-300 hover:shadow-sm'
                  : 'border-border/60 bg-white/[0.03] hover:bg-white/[0.06] hover:border-border text-muted-foreground hover:text-foreground',
              )}
            >
              <Download className="size-3.5" />
              {exporting ? 'Preparing...' : 'Export PDF'}
            </button>

            {/* Delete button */}
            {onDelete && (
              <button
                onClick={onDelete}
                title="Remove candidate"
                className={cn(
                  'flex items-center justify-center size-9 rounded-xl border transition-all shrink-0',
                  isLight
                    ? 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600'
                    : 'border-border/60 bg-white/[0.03] hover:bg-rose-500/10 hover:border-rose-500/30 text-muted-foreground hover:text-rose-400',
                )}
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <p
        className={cn(
          'text-sm leading-relaxed border-l-2 pl-4 italic z-10',
          isLight ? 'text-gray-600 border-blue-300' : 'text-foreground/80 border-primary/30',
        )}
      >
        &ldquo;{analysis.summary}&rdquo;
      </p>

      {/* Dimension scores */}
      <div className="z-10">
        <h3 className={cn('text-xs font-medium uppercase tracking-wider mb-4', isLight ? 'text-gray-400' : 'text-muted-foreground')}>
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
                className={cn(
                  'group p-4 rounded-xl border flex flex-col gap-2.5 transition-all duration-200',
                  isLight
                    ? 'bg-[#F4F6F8] border-gray-200 hover:bg-white hover:shadow-[4px_4px_12px_rgba(163,177,198,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)]'
                    : 'bg-black/20 border-white/5',
                )}
              >
                <div className="flex justify-between items-center">
                  <span className={cn('text-xs font-medium', isLight ? 'text-gray-700' : 'text-foreground/80')}>
                    {dim.label}
                  </span>
                  <span className={cn('text-xs font-bold tabular-nums', isLight ? 'text-gray-900' : '')}>
                    {val.score}
                  </span>
                </div>
                <div className={cn('h-1.5 w-full rounded-full overflow-hidden', isLight ? 'bg-gray-200' : 'bg-white/5')}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${val.score}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                  />
                </div>
                <p className={cn('text-[11px] leading-relaxed transition-colors', isLight ? 'text-gray-500 group-hover:text-gray-700' : 'text-muted-foreground group-hover:text-foreground/70')}>
                  {val.rationale}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Strengths & Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-10">
        <div
          className={cn(
            'flex flex-col gap-3 p-5 rounded-2xl border',
            isLight ? 'border-emerald-200 bg-emerald-50' : 'border-emerald-500/15 bg-emerald-500/5',
          )}
        >
          <h3 className={cn('text-xs font-medium flex items-center gap-2 uppercase tracking-wider', isLight ? 'text-emerald-700' : 'text-emerald-400')}>
            <CheckCircle2 className="size-3.5" />
            Key Strengths
          </h3>
          <ul className="flex flex-col gap-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className={cn('text-xs flex items-start gap-2 leading-relaxed', isLight ? 'text-gray-800' : 'text-emerald-200/80')}>
                <span className={cn('mt-0.5 shrink-0', isLight ? 'text-emerald-600 font-bold' : 'text-emerald-500')}>▸</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div
          className={cn(
            'flex flex-col gap-3 p-5 rounded-2xl border',
            isLight ? 'border-rose-200 bg-rose-50' : 'border-rose-500/15 bg-rose-500/5',
          )}
        >
          <h3 className={cn('text-xs font-medium flex items-center gap-2 uppercase tracking-wider', isLight ? 'text-rose-700' : 'text-rose-400')}>
            <AlertCircle className="size-3.5" />
            Concerns & Gaps
          </h3>
          <ul className="flex flex-col gap-2">
            {analysis.concerns.map((s, i) => (
              <li key={i} className={cn('text-xs flex items-start gap-2 leading-relaxed', isLight ? 'text-gray-800' : 'text-rose-200/80')}>
                <span className={cn('mt-0.5 shrink-0', isLight ? 'text-rose-600 font-bold' : 'text-rose-500')}>▸</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Skill alignment */}
      <div
        className={cn(
          'flex flex-col gap-4 p-5 rounded-2xl border z-10',
          isLight ? 'border-gray-200 bg-gray-50' : 'border-white/5 bg-white/[0.01]',
        )}
      >
        <h3 className={cn('text-xs font-medium flex items-center gap-2 uppercase tracking-wider', isLight ? 'text-gray-700' : 'text-foreground/80')}>
          <BrainCircuit className="size-3.5" />
          Skill Alignment
        </h3>

        <div className="flex flex-col gap-3">
          {analysis.matchedSkills.length > 0 && (
            <div>
              <span className={cn('text-[10px] uppercase tracking-wider block mb-2', isLight ? 'text-emerald-600 font-semibold' : 'text-emerald-400')}>
                ✓ Verified
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matchedSkills.map((s, i) => (
                  <span
                    key={i}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[11px] border',
                      isLight
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
                    )}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.missingSkills.length > 0 && (
            <div>
              <span className={cn('text-[10px] uppercase tracking-wider block mb-2', isLight ? 'text-rose-600 font-semibold' : 'text-rose-400')}>
                ✗ Missing / Unverified
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingSkills.map((s, i) => (
                  <span
                    key={i}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[11px] border flex items-center gap-1',
                      isLight
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/20',
                    )}
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
        <div
          className={cn(
            'flex flex-col gap-3 p-5 rounded-2xl border z-10',
            isLight ? 'border-blue-200 bg-blue-50' : 'border-blue-500/15 bg-blue-500/5',
          )}
        >
          <h3 className={cn('text-xs font-medium flex items-center gap-2 uppercase tracking-wider', isLight ? 'text-blue-700' : 'text-blue-400')}>
            <MessageSquare className="size-3.5" />
            Interview Guide
          </h3>
          <ul className="flex flex-col gap-2.5">
            {analysis.suggestedQuestions.map((q, i) => (
              <li
                key={i}
                className={cn(
                  'text-xs flex items-start gap-2.5 p-3 rounded-xl border leading-relaxed',
                  isLight
                    ? 'bg-white text-gray-800 border-blue-100 shadow-sm'
                    : 'bg-black/20 text-blue-100/80 border-blue-500/15',
                )}
              >
                <Lightbulb className={cn('size-3.5 shrink-0 mt-0.5', isLight ? 'text-blue-500' : 'text-blue-400')} />
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recruiter Feedback */}
      <div
        className={cn(
          'flex flex-col gap-4 p-5 rounded-2xl border z-10 mt-2',
          isLight ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-white/[0.03]',
        )}
      >
        <div className="flex items-center justify-between">
          <h3 className={cn('text-xs font-medium flex items-center gap-2 uppercase tracking-wider', isLight ? 'text-gray-700' : 'text-foreground/90')}>
            <ClipboardEdit className="size-3.5" />
            Recruiter Feedback
          </h3>

          {/* Decision toggles */}
          <div
            className={cn(
              'flex items-center gap-2 p-1 rounded-lg border',
              isLight ? 'bg-gray-100 border-gray-200' : 'bg-black/40 border-white/5',
            )}
          >
            <button
              onClick={() => handleDecision(decision === 'yes' ? null : 'yes')}
              className={cn(
                'px-3 py-1 rounded-md text-[11px] font-medium transition-all border',
                decision === 'yes'
                  ? isLight
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : isLight
                    ? 'text-gray-500 hover:text-gray-800 border-transparent'
                    : 'text-muted-foreground hover:text-foreground border-transparent',
              )}
            >
              Selected
            </button>
            <button
              onClick={() => handleDecision(decision === 'hold' ? null : 'hold')}
              className={cn(
                'px-3 py-1 rounded-md text-[11px] font-medium transition-all border',
                decision === 'hold'
                  ? isLight
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : isLight
                    ? 'text-gray-500 hover:text-gray-800 border-transparent'
                    : 'text-muted-foreground hover:text-foreground border-transparent',
              )}
            >
              Hold
            </button>
            <button
              onClick={() => handleDecision(decision === 'no' ? null : 'no')}
              className={cn(
                'px-3 py-1 rounded-md text-[11px] font-medium transition-all border',
                decision === 'no'
                  ? isLight
                    ? 'bg-rose-100 text-rose-700 border-rose-300'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : isLight
                    ? 'text-gray-500 hover:text-gray-800 border-transparent'
                    : 'text-muted-foreground hover:text-foreground border-transparent',
              )}
            >
              Rejected
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={feedbackNotes}
            onChange={(e) => setFeedbackNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add your private notes about this candidate... (auto-saved)"
            className={cn(
              'w-full min-h-[120px] rounded-xl p-3 text-sm resize-y focus:outline-none transition-colors',
              isLight
                ? 'bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50'
                : 'bg-black/20 border border-white/5 text-foreground/90 placeholder:text-muted-foreground/40 focus:border-white/20',
            )}
          />
          <p className={cn('mt-1.5 text-[10px] flex items-center gap-1', isLight ? 'text-gray-400' : 'text-muted-foreground/50')}>
            <span className={cn('inline-block size-1.5 rounded-full', isLight ? 'bg-emerald-400' : 'bg-emerald-500')} />
            Auto-saved to your session history on every change
          </p>
        </div>
      </div>
    </div>
  )
}
