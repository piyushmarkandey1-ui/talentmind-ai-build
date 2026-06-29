'use client'

import { FileText, Layers, ScanLine, Trophy } from 'lucide-react'
import { Reveal } from './reveal'

const steps = [
  {
    icon: FileText,
    step: '01',
    title: 'Add the job description',
    body: 'Paste or upload the role. TalentMind extracts the requirements that matter.',
  },
  {
    icon: Layers,
    step: '02',
    title: 'Upload resumes',
    body: 'Drop in one or hundreds of PDFs and DOCX files. Text is extracted instantly.',
  },
  {
    icon: ScanLine,
    step: '03',
    title: 'Gemini analyzes',
    body: 'Each candidate is evaluated across 11 dimensions and scored for fit — live.',
  },
  {
    icon: Trophy,
    step: '04',
    title: 'Review the ranking',
    body: 'Explore ranked candidates with explanations, gaps, and interview prompts.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl px-6 py-24"
    >
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-purple">How it works</p>
        <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          From resumes to ranked shortlist in minutes
        </h2>
      </Reveal>

      <div className="relative mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.step} delay={i * 0.08}>
            <div className="glass relative h-full rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div className="grid size-11 place-items-center rounded-2xl border border-border bg-white/5 text-foreground">
                  <s.icon className="size-5" />
                </div>
                <span className="font-mono text-sm text-muted-foreground">
                  {s.step}
                </span>
              </div>
              <h3 className="mt-5 text-base font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
