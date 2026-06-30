'use client'

import { Button } from '@/components/ui/button'
import { AuroraBackground } from '@/components/site/aurora-background'
import { Logo } from '@/components/site/logo'
import { JobStep } from '@/components/workspace/job-step'
import { ResumeStep } from '@/components/workspace/resume-step'
import { ReviewStep } from '@/components/workspace/review-step'
import { ResultsDashboard } from '@/components/workspace/results-dashboard'
import { Stepper, type Step } from '@/components/workspace/stepper'
import type { JobDescription, ResumeFile } from '@/lib/workspace'
import { AnalysisResult } from '@/lib/analysis-schema'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const steps: Step[] = [
  { id: 'role', label: 'Define role', description: 'Job description' },
  { id: 'resumes', label: 'Add resumes', description: 'Upload candidates' },
  { id: 'review', label: 'Review', description: 'Confirm & launch' },
]

export default function WorkspacePage() {
  const [current, setCurrent] = useState(0)
  const [job, setJob] = useState<JobDescription>({
    title: '',
    content: '',
    source: 'paste',
  })
  const [resumes, setResumes] = useState<ResumeFile[]>([])
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResult[] | null>(null)

  const canContinue = useMemo(() => {
    if (current === 0) return job.title.trim() !== '' && job.content.trim().length > 40
    if (current === 1) return resumes.length > 0
    return true
  }, [current, job, resumes])

  const next = () => setCurrent((c) => Math.min(c + 1, steps.length - 1))
  const back = () => setCurrent((c) => Math.max(c - 1, 0))

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    const newResults: AnalysisResult[] = []

    try {
      for (const resume of resumes) {
        if (!resume.file) continue

        const formData = new FormData()
        formData.append('jobTitle', job.title)
        formData.append('jobContent', job.content)
        formData.append('resume', resume.file)

        try {
          const res = await fetch('/api/analyze', {
            method: 'POST',
            body: formData,
          })

          if (!res.ok) {
            throw new Error(`Failed to analyze ${resume.file.name}`)
          }

          const data = await res.json()
          newResults.push({
            id: resume.id,
            fileName: resume.file.name,
            status: 'ok',
            analysis: data,
          })
        } catch (error: any) {
          console.error(error)
          newResults.push({
            id: resume.id,
            fileName: resume.file.name,
            status: 'error',
            error: error.message || 'Unknown error occurred',
          })
        }
      }

      setResults(newResults)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setResults(null)
    setCurrent(0)
    setResumes([])
  }

  return (
    <main className="relative min-h-svh">
      <AuroraBackground />

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Link href="/" aria-label="TalentMind AI home">
            <Logo />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </div>
      </header>

      {results ? (
        <div className="pt-10 px-4">
          <ResultsDashboard results={results} onBack={resetAnalysis} />
        </div>
      ) : (
        <>
          <div className="mx-auto w-full max-w-3xl px-4 pb-40 pt-10">
            {/* Heading */}
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-blue">
                <Sparkles className="size-3.5" />
                New analysis
              </span>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
                Screen a batch of candidates
              </h1>
              <p className="text-pretty text-muted-foreground">
                Define the role, add resumes, and TalentMind ranks every candidate
                with explainable, evidence-backed scores.
              </p>
            </div>

            {/* Stepper */}
            <div className="mt-8 rounded-3xl border border-border bg-white/[0.02] p-3 sm:p-4">
              <Stepper steps={steps} current={current} onStepClick={setCurrent} />
            </div>

            {/* Step content */}
            <div className="mt-6 rounded-3xl border border-border bg-white/[0.02] p-5 sm:p-7 relative overflow-hidden">
              {isAnalyzing && (
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center rounded-3xl">
                  <Loader2 className="size-8 animate-spin text-blue mb-4" />
                  <h3 className="text-xl font-semibold text-foreground">Analyzing candidates...</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs text-center">
                    Gemini AI is carefully reviewing {resumes.length} resume(s) against the requirements for {job.title}.
                  </p>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  {current === 0 && <JobStep value={job} onChange={setJob} />}
                  {current === 1 && (
                    <ResumeStep files={resumes} onChange={setResumes} />
                  )}
                  {current === 2 && <ReviewStep job={job} resumes={resumes} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Sticky action bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
              <Button
                variant="ghost"
                onClick={back}
                disabled={current === 0 || isAnalyzing}
                className="text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>

              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-muted-foreground sm:block">
                  Step {current + 1} of {steps.length}
                </span>
                {current < steps.length - 1 ? (
                  <Button
                    onClick={next}
                    disabled={!canContinue || isAnalyzing}
                    className="rounded-xl bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40"
                  >
                    Continue
                    <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    disabled={!canContinue || isAnalyzing}
                    onClick={runAnalysis}
                    className="rounded-xl bg-gradient-to-r from-blue to-purple text-white shadow-[0_0_30px_-6px] shadow-blue/60 hover:opacity-95 disabled:opacity-40"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Run analysis
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
