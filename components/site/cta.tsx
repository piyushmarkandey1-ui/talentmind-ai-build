'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from './reveal'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'

export function Cta() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div
          className={cn(
            'relative overflow-hidden rounded-4xl px-6 py-16 text-center sm:px-12 sm:py-20 transition-all duration-300',
            isLight
              ? 'bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#3B82F6] shadow-[0_20px_60px_rgba(37,99,235,0.4)] text-white'
              : 'glass',
          )}
        >
          {/* Decorative orb */}
          <div
            aria-hidden="true"
            className={cn(
              'absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-[100px]',
              isLight
                ? 'bg-white/20'
                : '',
            )}
            style={isLight ? {} : {
              background: 'radial-gradient(circle, oklch(0.62 0.21 264 / 0.5), transparent 60%)',
            }}
          />

          <h2 className={cn(
            'relative mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl',
            isLight ? 'text-white' : '',
          )}>
            Hire with clarity, not guesswork
          </h2>
          <p className={cn(
            'relative mx-auto mt-4 max-w-xl text-pretty',
            isLight ? 'text-blue-100' : 'text-muted-foreground',
          )}>
            Bring TalentMind into your pipeline and turn stacks of resumes into a ranked, explainable shortlist.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className={cn(
                'group h-12 rounded-xl px-6 transition-all duration-200',
                isLight
                  ? 'bg-white text-blue-700 hover:bg-gray-50 shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:-translate-y-px font-semibold'
                  : 'bg-foreground text-background hover:bg-foreground/90',
              )}
            >
              <Link href="/workspace">
                Start free
                <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={cn(
                'h-12 rounded-xl px-6 transition-all duration-200',
                isLight
                  ? 'border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                  : 'border-border bg-white/5 hover:bg-white/10',
              )}
            >
              Talk to sales
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
