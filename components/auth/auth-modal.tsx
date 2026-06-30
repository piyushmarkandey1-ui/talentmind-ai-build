'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/auth'
import { motion, AnimatePresence } from 'motion/react'
import { X, Mail, Lock, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/site/theme-provider'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
          },
        })

        if (error) throw error

        if (data.user) {
          // Create profile
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email!,
            full_name: formData.fullName,
          })

          // If session was created (email confirmation disabled), auto-login
          if (data.session) {
            // Session is automatically persisted by Supabase (persistSession: true)
            onSuccess?.()
            onClose()
          } else {
            // Email confirmation is enabled in Supabase
            // User needs to confirm email before they can log in
            setError('Please check your email to confirm your account. Or disable email confirmation in Supabase dashboard for immediate access.')
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error

        onSuccess?.()
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={cn('fixed inset-0 z-50', isLight ? 'bg-gray-900/40 backdrop-blur-sm' : 'bg-black')}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className={cn(
                'relative w-full max-w-md rounded-3xl p-8 shadow-2xl',
                isLight ? 'bg-white border border-gray-200' : 'bg-[#0A0A12] border border-border/50'
              )}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className={cn(
                  'absolute right-4 top-4 grid size-8 place-items-center rounded-lg transition-colors',
                  isLight ? 'text-gray-400 hover:bg-gray-100' : 'text-muted-foreground hover:bg-white/5'
                )}
              >
                <X className="size-4" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <h2 className={cn('text-2xl font-semibold', isLight ? 'text-gray-900' : '')}>
                  {mode === 'login' ? 'Welcome back' : 'Create account'}
                </h2>
                <p className={cn('mt-2 text-sm', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
                  {mode === 'login'
                    ? 'Sign in to access your workspace'
                    : 'Start analyzing candidates with AI'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : '')}>
                      Full name
                    </label>
                    <div className="relative">
                      <User className={cn('absolute left-3 top-1/2 size-4 -translate-y-1/2', isLight ? 'text-gray-400' : 'text-muted-foreground')} />
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={cn(
                          'w-full rounded-xl border px-10 py-3 text-sm transition-colors',
                          isLight
                            ? 'border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            : 'border-border bg-white/5 text-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        )}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : '')}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail className={cn('absolute left-3 top-1/2 size-4 -translate-y-1/2', isLight ? 'text-gray-400' : 'text-muted-foreground')} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={cn(
                        'w-full rounded-xl border px-10 py-3 text-sm transition-colors',
                        isLight
                          ? 'border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : 'border-border bg-white/5 text-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      )}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className={cn('mb-2 block text-sm font-medium', isLight ? 'text-gray-700' : '')}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className={cn('absolute left-3 top-1/2 size-4 -translate-y-1/2', isLight ? 'text-gray-400' : 'text-muted-foreground')} />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={cn(
                        'w-full rounded-xl border px-10 py-3 text-sm transition-colors',
                        isLight
                          ? 'border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : 'border-border bg-white/5 text-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      )}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className={cn('rounded-lg p-3 text-sm', isLight ? 'bg-rose-50 text-rose-700' : 'bg-rose-500/10 text-rose-400')}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    'w-full rounded-xl py-3 text-sm font-medium transition-colors',
                    isLight
                      ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
                      : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-500/50'
                  )}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    mode === 'login' ? 'Sign in' : 'Create account'
                  )}
                </button>
              </form>

              {/* Toggle mode */}
              <p className={cn('mt-6 text-center text-sm', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login')
                    setError('')
                  }}
                  className={cn('font-medium', isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300')}
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
