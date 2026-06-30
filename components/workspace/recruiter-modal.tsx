'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { User, Building2, Briefcase, Mail, Sparkles, CheckCircle2, Edit2 } from 'lucide-react'
import type { RecruiterProfile } from '@/lib/recruiter-store'

interface RecruiterModalProps {
  open: boolean
  initial?: RecruiterProfile | null
  onSave: (profile: RecruiterProfile) => void
  onClose?: () => void
  /** If false, the modal cannot be dismissed without saving */
  dismissible?: boolean
}

const FIELDS: {
  key: keyof RecruiterProfile
  label: string
  placeholder: string
  type: string
  icon: React.ElementType
}[] = [
  { key: 'name',        label: 'Full name',       placeholder: 'e.g. Priya Sharma',                type: 'text',  icon: User },
  { key: 'email',       label: 'Work email',       placeholder: 'e.g. priya@company.com',           type: 'email', icon: Mail },
  { key: 'company',     label: 'Company',          placeholder: 'e.g. Acme Technologies',           type: 'text',  icon: Building2 },
  { key: 'designation', label: 'Your designation', placeholder: 'e.g. Senior Talent Acquisition Lead', type: 'text', icon: Briefcase },
]

export function RecruiterModal({
  open,
  initial,
  onSave,
  onClose,
  dismissible = false,
}: RecruiterModalProps) {
  const [form, setForm] = useState<RecruiterProfile>(
    initial ?? { name: '', email: '', company: '', designation: '' }
  )
  const [errors, setErrors] = useState<Partial<Record<keyof RecruiterProfile, string>>>({})
  const [saved, setSaved] = useState(false)

  const validate = () => {
    const e: typeof errors = {}
    if (!form.name.trim())        e.name        = 'Name is required'
    if (!form.email.trim())       e.email       = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.company.trim())     e.company     = 'Company is required'
    if (!form.designation.trim()) e.designation = 'Designation is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onSave(form)
    }, 700)
  }

  const handleChange = (key: keyof RecruiterProfile, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={dismissible ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-lg rounded-3xl border border-border/60 bg-[#0a0a0f] p-8 shadow-2xl"
          >
            {/* Glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-40 bg-blue/20 blur-[80px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col gap-2 mb-8">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center size-9 rounded-xl bg-blue/10 border border-blue/20">
                  <Sparkles className="size-4 text-blue" />
                </span>
                <span className="text-xs font-medium uppercase tracking-widest text-blue">
                  {initial ? 'Edit profile' : 'Recruiter setup'}
                </span>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {initial ? 'Update your profile' : 'Welcome to TalentMind AI'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {initial
                  ? 'Update your details. Your analysis history is linked to your email.'
                  : 'Enter your details once. All your candidate evaluations will be saved and linked to your email.'}
              </p>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4 mb-8">
              {FIELDS.map(({ key, label, placeholder, type, icon: Icon }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground/70 flex items-center gap-1.5">
                    <Icon className="size-3.5" />
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder={placeholder}
                    className={[
                      'h-11 rounded-xl border px-4 text-sm text-foreground bg-white/[0.03] outline-none transition-all',
                      'placeholder:text-muted-foreground/50',
                      errors[key]
                        ? 'border-rose-500/60 focus:border-rose-500'
                        : 'border-border/60 focus:border-blue/50 focus:bg-white/[0.05]',
                    ].join(' ')}
                  />
                  {errors[key] && (
                    <p className="text-xs text-rose-400">{errors[key]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              {dismissible && onClose ? (
                <button
                  onClick={onClose}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              ) : (
                <span className="text-xs text-muted-foreground/50">
                  Your data stays in your browser only
                </span>
              )}

              <button
                onClick={handleSave}
                disabled={saved}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue to-purple text-white text-sm font-semibold shadow-[0_0_24px_-6px] shadow-blue/50 hover:opacity-90 transition-all disabled:opacity-70"
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="size-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Edit2 className="size-4" />
                    {initial ? 'Update profile' : 'Save & continue'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
