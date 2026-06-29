'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from './reveal'

export function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="glass relative overflow-hidden rounded-4xl px-6 py-16 text-center sm:px-12 sm:py-20">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-[100px]"
            style={{
              background:
                'radial-gradient(circle, oklch(0.62 0.21 264 / 0.5), transparent 60%)',
            }}
          />
          <h2 className="relative mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Hire with clarity, not guesswork
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            Bring TalentMind into your pipeline and turn stacks of resumes into a
            ranked, explainable shortlist.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-12 rounded-xl bg-foreground px-6 text-background hover:bg-foreground/90"
            >
              <Link href="/workspace">
                Start free
                <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-border bg-white/5 px-6 hover:bg-white/10"
            >
              Talk to sales
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
