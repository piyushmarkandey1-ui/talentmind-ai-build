'use client'

import { Logo } from './logo'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'

const groups = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Evaluation', href: '#evaluation' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
]

export function Footer() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <footer className="mx-auto max-w-6xl px-6 pb-12 pt-8">
      <div
        className={cn(
          'rounded-4xl p-8 sm:p-10 transition-all duration-300',
          isLight
            ? 'bg-white shadow-[12px_12px_32px_rgba(163,177,198,0.45),-12px_-12px_32px_rgba(255,255,255,0.95)] border border-white/80'
            : 'glass',
        )}
      >
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className={cn('mt-4 max-w-xs text-sm leading-relaxed', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
              The AI hiring operating system. Final hiring decisions always remain with the recruiter.
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <p className={cn('text-sm font-semibold', isLight ? 'text-gray-900' : 'text-foreground')}>
                {g.title}
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className={cn(
                        'text-sm transition-colors',
                        isLight
                          ? 'text-gray-500 hover:text-blue-600'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className={cn(
            'mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm sm:flex-row',
            isLight ? 'border-gray-100 text-gray-400' : 'border-border text-muted-foreground',
          )}
        >
          <p>© {new Date().getFullYear()} TalentMind AI. All rights reserved.</p>
          <p>Built with Google Gemini.</p>
        </div>
      </div>
    </footer>
  )
}
