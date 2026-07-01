'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/auth'
import { motion, AnimatePresence } from 'motion/react'
import { X, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/site/theme-provider'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  initialMode?: 'login' | 'signup' | 'forgot_password' | 'update_password'
}

export function AuthModal({ open, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password' | 'update_password'>(initialMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  })

  // Sync mode with prop
  useEffect(() => {
    if (open) {
      setMode(initialMode)
      setError('')
      setSuccessMsg('')
      setShowPassword(false)
    }
  }, [open, initialMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
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
            onSuccess?.()
            onClose()
          } else {
            setSuccessMsg('Please check your email to confirm your account.')
          }
        }
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error

        onSuccess?.()
        onClose()
      } else if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/workspace?reset=true`,
        })

        if (error) throw error
        setSuccessMsg('We have emailed you a password reset link.')
      } else if (mode === 'update_password') {
        const { error } = await supabase.auth.updateUser({
          password: formData.password,
        })

        if (error) throw error
        setSuccessMsg('Password updated successfully!')
        
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 1500)
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
            onClick={mode === 'update_password' ? undefined : onClose} // Lock backdrop click in update_password mode
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
              {/* Close button (Hide in update_password mode to force update) */}
              {mode !== 'update_password' && (
                <button
                  onClick={onClose}
                  className={cn(
                    'absolute right-4 top-4 grid size-8 place-items-center rounded-lg transition-colors',
                    isLight ? 'text-gray-400 hover:bg-gray-100' : 'text-muted-foreground hover:bg-white/5'
                  )}
                >
                  <X className="size-4" />
                </button>
              )}

              {/* Header */}
              <div className="mb-6">
                <h2 className={cn('text-2xl font-semibold', isLight ? 'text-gray-900' : '')}>
                  {mode === 'login' && 'Welcome back'}
                  {mode === 'signup' && 'Create account'}
                  {mode === 'forgot_password' && 'Reset Password'}
                  {mode === 'update_password' && 'Update Password'}
                </h2>
                <p className={cn('mt-2 text-sm', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
                  {mode === 'login' && 'Sign in to access your workspace'}
                  {mode === 'signup' && 'Start analyzing candidates with AI'}
                  {mode === 'forgot_password' && 'Enter your email to receive a recovery link'}
                  {mode === 'update_password' && 'Enter your new password below'}
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

                {mode !== 'update_password' && (
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
                )}

                {mode !== 'forgot_password' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={cn('text-sm font-medium', isLight ? 'text-gray-700' : '')}>
                        {mode === 'update_password' ? 'New Password' : 'Password'}
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot_password')
                            setError('')
                            setSuccessMsg('')
                          }}
                          className={cn('text-xs hover:underline', isLight ? 'text-blue-600' : 'text-blue-400')}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className={cn('absolute left-3 top-1/2 size-4 -translate-y-1/2', isLight ? 'text-gray-400' : 'text-muted-foreground')} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={cn(
                          'w-full rounded-xl border pl-10 pr-12 py-3 text-sm transition-colors',
                          isLight
                            ? 'border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            : 'border-border bg-white/5 text-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        )}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          'absolute right-3 top-1/2 size-5 -translate-y-1/2 flex items-center justify-center transition-colors',
                          isLight ? 'text-gray-400 hover:text-gray-600' : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className={cn('rounded-lg p-3 text-sm', isLight ? 'bg-rose-50 text-rose-700' : 'bg-rose-500/10 text-rose-400')}>
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div className={cn('rounded-lg p-3 text-sm', isLight ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-500/10 text-emerald-400')}>
                    {successMsg}
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
                      {mode === 'login' && 'Signing in...'}
                      {mode === 'signup' && 'Creating account...'}
                      {mode === 'forgot_password' && 'Sending...'}
                      {mode === 'update_password' && 'Updating...'}
                    </span>
                  ) : (
                    <>
                      {mode === 'login' && 'Sign in'}
                      {mode === 'signup' && 'Create account'}
                      {mode === 'forgot_password' && 'Send recovery email'}
                      {mode === 'update_password' && 'Update password'}
                    </>
                  )}
                </button>
              </form>

              {/* Toggle mode */}
              {mode !== 'update_password' && (
                <p className={cn('mt-6 text-center text-sm', isLight ? 'text-gray-500' : 'text-muted-foreground')}>
                  {mode === 'forgot_password' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login')
                        setError('')
                        setSuccessMsg('')
                      }}
                      className={cn('font-medium', isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300')}
                    >
                      Back to sign in
                    </button>
                  ) : (
                    <>
                      {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode(mode === 'login' ? 'signup' : 'login')
                          setError('')
                          setSuccessMsg('')
                        }}
                        className={cn('font-medium', isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300')}
                      >
                        {mode === 'login' ? 'Sign up' : 'Sign in'}
                      </button>
                    </>
                  )}
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
