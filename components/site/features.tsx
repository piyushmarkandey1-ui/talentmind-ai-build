'use client'

import { cn } from '@/lib/utils'
import {
  Brain,
  FileSearch,
  ListOrdered,
  MessageSquareQuote,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Reveal } from './reveal'
import { useTheme } from './theme-provider'

const features = [
  {
    icon: Brain,
    title: 'Semantic resume understanding',
    body: 'Gemini reads beyond keywords — grasping context, impact, and the story behind every role.',
    span: 'sm:col-span-2',
    accent: 'text-blue',
    lightAccent: 'text-blue-600',
    lightIcon: 'bg-blue-50 border-blue-100',
  },
  {
    icon: FileSearch,
    title: 'Job-aligned matching',
    body: 'Every candidate is scored against the exact requirements of your role.',
    accent: 'text-purple',
    lightAccent: 'text-violet-600',
    lightIcon: 'bg-violet-50 border-violet-100',
  },
  {
    icon: ListOrdered,
    title: 'Intelligent ranking',
    body: 'Candidates are ordered by true suitability, not noise.',
    accent: 'text-cyan',
    lightAccent: 'text-cyan-600',
    lightIcon: 'bg-cyan-50 border-cyan-100',
  },
  {
    icon: MessageSquareQuote,
    title: 'Explainable recommendations',
    body: 'Strengths, gaps, and tailored interview questions for every candidate.',
    span: 'sm:col-span-2',
    accent: 'text-emerald',
    lightAccent: 'text-emerald-600',
    lightIcon: 'bg-emerald-50 border-emerald-100',
  },
  {
    icon: Zap,
    title: 'Streaming analysis',
    body: 'Watch evaluations unfold live with real-time AI reasoning.',
    accent: 'text-blue',
    lightAccent: 'text-blue-600',
    lightIcon: 'bg-blue-50 border-blue-100',
  },
  {
    icon: ShieldCheck,
    title: 'Recruiter in control',
    body: 'TalentMind assists decisions — the final call always stays with you.',
    accent: 'text-purple',
    lightAccent: 'text-violet-600',
    lightIcon: 'bg-violet-50 border-violet-100',
  },
]

export function Features() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <section id="product" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className={cn('text-sm font-medium', isLight ? 'text-cyan-600' : 'text-cyan')}>Why TalentMind</p>
        <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Evaluation that thinks like your best recruiter
        </h2>
        <p className={cn('mt-4 text-pretty', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
          Eight dimensions of analysis, distilled into clear, defensible hiring signals.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.06} className={cn(f.span)}>
            <article
              className={cn(
                'group h-full rounded-3xl p-6 transition-all duration-300',
                isLight
                  ? 'bg-white shadow-[8px_8px_20px_rgba(163,177,198,0.45),-8px_-8px_20px_rgba(255,255,255,0.9)] border border-white/80 hover:shadow-[12px_12px_28px_rgba(163,177,198,0.55),-12px_-12px_28px_rgba(255,255,255,0.95)] hover:-translate-y-1.5'
                  : 'glass hover:bg-white/[0.07]',
              )}
            >
              <div
                className={cn(
                  'grid size-11 place-items-center rounded-2xl border',
                  isLight
                    ? `${f.lightAccent} ${f.lightIcon}`
                    : `${f.accent} border-border bg-white/5`,
                )}
                aria-hidden="true"
              >
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className={cn('mt-2 text-sm leading-relaxed', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
                {f.body}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
