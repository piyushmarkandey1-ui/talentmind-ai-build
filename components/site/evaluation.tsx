'use client'

import {
  Award,
  BookOpen,
  Briefcase,
  Code2,
  Compass,
  GitBranch,
  Lightbulb,
  MessageCircle,
  Puzzle,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Reveal } from './reveal'

const dimensions = [
  { icon: Code2, label: 'Technical Skills' },
  { icon: Briefcase, label: 'Relevant Experience' },
  { icon: Award, label: 'Project Quality' },
  { icon: TrendingUp, label: 'Career Progression' },
  { icon: Compass, label: 'Leadership' },
  { icon: MessageCircle, label: 'Communication' },
  { icon: Lightbulb, label: 'Learning Potential' },
  { icon: GitBranch, label: 'Transferable Skills' },
  { icon: BookOpen, label: 'Domain Knowledge' },
  { icon: Puzzle, label: 'Missing Skills' },
  { icon: Target, label: 'Overall Role Fit' },
]

export function Evaluation() {
  return (
    <section id="evaluation" className="mx-auto max-w-6xl px-6 py-24">
      <div className="glass overflow-hidden rounded-4xl p-8 sm:p-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-emerald">
            11 dimensions of intelligence
          </p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Every candidate, evaluated in full depth
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            TalentMind scores each resume across the signals that actually
            predict success in the role.
          </p>
        </Reveal>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {dimensions.map((d, i) => (
            <Reveal key={d.label} delay={i * 0.04}>
              <div className="group flex items-center gap-2.5 rounded-2xl border border-border bg-white/[0.03] px-4 py-3 transition-colors hover:border-white/25 hover:bg-white/[0.07]">
                <d.icon className="size-4 text-cyan transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium text-foreground">
                  {d.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
