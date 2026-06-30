'use client'

import { FileText, Layers, ScanLine, Trophy } from 'lucide-react'
import { Reveal } from './reveal'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'

const steps = [
  {
    icon: FileText,
    step: '01',
    title: 'Add the job description',
    body: 'Paste or upload the role. TalentMind extracts the requirements that matter.',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-100',
  },
  {
    icon: Layers,
    step: '02',
    title: 'Upload resumes',
    body: 'Drop in one or hundreds of PDFs and DOCX files. Text is extracted instantly.',
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-100',
  },
  {
    icon: ScanLine,
    step: '03',
    title: 'Gemini analyzes',
    body: 'Each candidate is evaluated across 8 dimensions and scored for fit — live.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50 border-cyan-100',
  },
  {
    icon: Trophy,
    step: '04',
    title: 'Review the ranking',
    body: 'Explore ranked candidates with explanations, gaps, and interview prompts.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-100',
  },
]

export function HowItWorks() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className={cn('text-sm font-medium', isLight ? 'text-violet-600' : 'text-purple')}>How it works</p>
        <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          From resumes to ranked shortlist in minutes
        </h2>
      </Reveal>

      <div className="relative mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.step} delay={i * 0.08}>
            <div
              className={cn(
                'relative h-full rounded-3xl p-6 transition-all duration-300',
                isLight
                  ? 'bg-white shadow-[8px_8px_20px_rgba(163,177,198,0.45),-8px_-8px_20px_rgba(255,255,255,0.9)] border border-white/80 hover:shadow-[12px_12px_28px_rgba(163,177,198,0.55),-12px_-12px_28px_rgba(255,255,255,0.95)] hover:-translate-y-1.5'
                  : 'glass',
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'grid size-11 place-items-center rounded-2xl border',
                    isLight
                      ? `${s.color} ${s.bg}`
                      : 'border-border bg-white/5 text-foreground',
                  )}
                >
                  <s.icon className="size-5" />
                </div>
                <span className={cn('font-mono text-sm', isLight ? 'text-gray-300 font-semibold' : 'text-muted-foreground')}>
                  {s.step}
                </span>
              </div>
              <h3 className="mt-5 text-base font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className={cn('mt-2 text-sm leading-relaxed', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
                {s.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
