'use client'

import { AnimatedCounter } from './animated-counter'
import { Reveal } from './reveal'

const stats = [
  { value: 94, suffix: '%', label: 'Match accuracy vs. hires' },
  { value: 11, suffix: '', label: 'Evaluation dimensions' },
  { value: 8, suffix: 'x', label: 'Faster shortlisting' },
  { value: 100, suffix: 'k+', label: 'Candidates analyzed' },
]

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="glass rounded-3xl p-6 text-center">
              <p className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
