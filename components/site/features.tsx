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

const features = [
  {
    icon: Brain,
    title: 'Semantic resume understanding',
    body: 'Gemini reads beyond keywords — grasping context, impact, and the story behind every role.',
    span: 'sm:col-span-2',
    accent: 'text-blue',
  },
  {
    icon: FileSearch,
    title: 'Job-aligned matching',
    body: 'Every candidate is scored against the exact requirements of your role.',
    accent: 'text-purple',
  },
  {
    icon: ListOrdered,
    title: 'Intelligent ranking',
    body: 'Candidates are ordered by true suitability, not noise.',
    accent: 'text-cyan',
  },
  {
    icon: MessageSquareQuote,
    title: 'Explainable recommendations',
    body: 'Strengths, gaps, and tailored interview questions for every candidate.',
    span: 'sm:col-span-2',
    accent: 'text-emerald',
  },
  {
    icon: Zap,
    title: 'Streaming analysis',
    body: 'Watch evaluations unfold live with real-time AI reasoning.',
    accent: 'text-blue',
  },
  {
    icon: ShieldCheck,
    title: 'Recruiter in control',
    body: 'TalentMind assists decisions — the final call always stays with you.',
    accent: 'text-purple',
  },
]

export function Features() {
  return (
    <section id="product" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-cyan">Why TalentMind</p>
        <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Evaluation that thinks like your best recruiter
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          Eight dimensions of analysis, distilled into clear, defensible
          hiring signals.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map((f, i) => (
          <Reveal
            key={f.title}
            delay={i * 0.06}
            className={cn(f.span)}
          >
            <article className="glass group h-full rounded-3xl p-6 transition-colors hover:bg-white/[0.07]">
              <div
                className={cn(
                  'grid size-11 place-items-center rounded-2xl border border-border bg-white/5',
                  f.accent,
                )}
              >
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
