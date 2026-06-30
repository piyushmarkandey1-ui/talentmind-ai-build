'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Reveal } from './reveal'

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

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <Reveal className="text-center">
        <p className="text-sm font-medium text-blue">FAQ</p>
        <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Questions, answered
        </h2>
      </Reveal>

      <div className="mt-12 flex flex-col gap-3">
        {faqs.map((f, i) => {
          const isOpen = open === i
          return (
            <Reveal key={f.q} delay={i * 0.05}>
              <div className="glass overflow-hidden rounded-2xl">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-base font-medium text-foreground">
                    {f.q}
                  </span>
                  <Plus
                    className={`size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
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
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
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
