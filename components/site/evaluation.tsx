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
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'

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
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <section id="evaluation" className="mx-auto max-w-6xl px-6 py-24">
      <div
        className={cn(
          'overflow-hidden rounded-4xl p-8 sm:p-12 transition-all duration-300',
          isLight
            ? 'bg-white shadow-[12px_12px_32px_rgba(163,177,198,0.5),-12px_-12px_32px_rgba(255,255,255,0.95)] border border-white/80'
            : 'glass',
        )}
      >
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className={cn('text-sm font-medium', isLight ? 'text-emerald-600' : 'text-emerald')}>
            11 dimensions of intelligence
          </p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Every candidate, evaluated in full depth
          </h2>
          <p className={cn('mt-4 text-pretty', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
            TalentMind scores each resume across the signals that actually predict success in the role.
          </p>
        </Reveal>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {dimensions.map((d, i) => (
            <Reveal key={d.label} delay={i * 0.04}>
              <div
                className={cn(
                  'group flex items-center gap-2.5 rounded-2xl px-4 py-3 transition-all duration-200',
                  isLight
                    ? 'bg-[#F4F6F8] text-gray-600 shadow-[4px_4px_10px_rgba(163,177,198,0.4),-4px_-4px_10px_rgba(255,255,255,0.85)] border border-white/80 hover:shadow-[6px_6px_14px_rgba(163,177,198,0.5),-6px_-6px_14px_rgba(255,255,255,0.9)] hover:-translate-y-0.5 hover:text-blue-600'
                    : 'border border-border bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.07]',
                )}
              >
                <d.icon
                  className={cn(
                    'size-4 transition-transform group-hover:scale-110',
                    isLight ? 'text-cyan-600' : 'text-cyan',
                  )}
                  aria-hidden="true"
                />
                <span className={cn('text-sm font-medium', isLight ? '' : 'text-foreground')}>
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
