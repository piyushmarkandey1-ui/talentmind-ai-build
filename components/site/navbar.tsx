'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Menu, Moon, Sun, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Logo } from './logo'
import { useTheme } from './theme-provider'

const links = [
  { label: 'Features', href: '#product' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Evaluation', href: '#evaluation' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={cn(
          'flex w-full max-w-5xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500',
          scrolled
            ? isLight
              ? 'nav-glass shadow-[0_4px_24px_rgba(15,25,35,0.08)]'
              : 'glass shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]'
            : 'border border-transparent',
        )}
      >
        <Link href="/" aria-label="TalentMind AI home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm transition-colors',
                isLight
                  ? 'text-gray-500 hover:text-gray-900'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className={cn(
              'grid size-9 place-items-center rounded-xl transition-all duration-200',
              isLight
                ? 'bg-[#EEF2F7] text-gray-500 hover:text-gray-900 shadow-[3px_3px_8px_rgba(163,177,198,0.4),-3px_-3px_8px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_12px_rgba(163,177,198,0.5),-4px_-4px_12px_rgba(255,255,255,0.9)]'
                : 'border border-border text-muted-foreground hover:text-foreground hover:border-border/80',
            )}
          >
            {isLight ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>

          <Button
            asChild
            className={cn(
              'rounded-xl transition-all duration-200',
              isLight
                ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] hover:-translate-y-px'
                : 'bg-foreground text-background hover:bg-foreground/90',
            )}
          >
            <Link href="/workspace">Start free</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {/* Theme toggle mobile */}
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className={cn(
              'grid size-9 place-items-center rounded-lg transition-all',
              isLight
                ? 'text-gray-500 hover:text-gray-900'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {isLight ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              'grid size-9 place-items-center rounded-lg border transition-all',
              isLight
                ? 'border-gray-200 text-gray-600'
                : 'border-border text-foreground',
            )}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div
          className={cn(
            'absolute inset-x-4 top-20 rounded-2xl p-3 md:hidden',
            isLight ? 'mobile-menu' : 'glass',
          )}
        >
          <div className="flex flex-col">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-3 text-sm transition-colors',
                  isLight
                    ? 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                )}
              >
                {l.label}
              </a>
            ))}
            <div
              className={cn(
                'mt-2 flex flex-col gap-2 border-t pt-3',
                isLight ? 'border-gray-100' : 'border-border',
              )}
            >
              <Button
                asChild
                className={cn(
                  isLight
                    ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-[0_4px_14px_rgba(37,99,235,0.35)]'
                    : 'bg-foreground text-background hover:bg-foreground/90',
                )}
              >
                <Link href="/workspace" onClick={() => setOpen(false)}>
                  Start free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
