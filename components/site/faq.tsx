'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Reveal } from './reveal'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'How does TalentMind evaluate candidates?',
    a: 'TalentMind extracts the text from each resume and sends it to Google Gemini alongside your job description. Gemini compares the two semantically and returns structured scores across 8 dimensions, plus strengths, gaps, and tailored interview questions.',
  },
  {
    q: 'Which file formats are supported?',
    a: 'You can upload PDF and DOCX resumes — individually or in bulk. Text is extracted automatically before analysis.',
  },
  {
    q: 'Does the AI make hiring decisions for me?',
    a: 'No. TalentMind is a decision-support tool. It surfaces explainable signals and rankings, but the final hiring decision always stays with the recruiter.',
  },
  {
    q: 'Is my candidate data secure?',
    a: 'API keys are stored as environment variables and never exposed to the client. Resume text is only used to generate the analysis you request.',
  },
  {
    q: 'Can I see why a candidate was ranked a certain way?',
    a: 'Every recommendation comes with an explanation — the strengths and weaknesses that drove the score, missing skills, and a confidence level.',
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <Reveal className="text-center">
        <p className={cn('text-sm font-medium', isLight ? 'text-blue-600' : 'text-blue')}>FAQ</p>
        <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Questions, answered
        </h2>
      </Reveal>

      <div className="mt-12 flex flex-col gap-3">
        {faqs.map((f, i) => {
          const isOpen = open === i
          return (
            <Reveal key={f.q} delay={i * 0.05}>
              <div
                className={cn(
                  'overflow-hidden rounded-2xl transition-all duration-300',
                  isLight
                    ? 'bg-white shadow-[6px_6px_16px_rgba(163,177,198,0.4),-6px_-6px_16px_rgba(255,255,255,0.9)] border border-white/80'
                    : 'glass',
                  isOpen && isLight
                    ? 'shadow-[8px_8px_20px_rgba(163,177,198,0.5),-8px_-8px_20px_rgba(255,255,255,0.95)]'
                    : '',
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className={cn('text-base font-medium', isLight ? 'text-gray-900' : 'text-foreground')}>
                    {f.q}
                  </span>
                  <Plus
                    className={cn(
                      'size-4 shrink-0 transition-transform duration-300',
                      isLight ? 'text-gray-400' : 'text-muted-foreground',
                      isOpen ? 'rotate-45' : '',
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p className={cn('px-5 pb-5 text-sm leading-relaxed', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
