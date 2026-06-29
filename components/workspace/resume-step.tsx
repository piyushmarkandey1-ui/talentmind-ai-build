'use client'

import { cn } from '@/lib/utils'
import {
  formatBytes,
  isAcceptedResume,
  MAX_RESUME_SIZE,
  type ResumeFile,
  ACCEPTED_RESUME_EXT,
  fileExtension,
} from '@/lib/workspace'
import { AnimatePresence, motion } from 'motion/react'
import { FileText, Trash2, UploadCloud, AlertCircle } from 'lucide-react'
import { useRef, useState } from 'react'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export function ResumeStep({
  files,
  onChange,
}: {
  files: ResumeFile[]
  onChange: (next: ResumeFile[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addFiles = (incoming: FileList | File[]) => {
    setError(null)
    const list = Array.from(incoming)
    const accepted: ResumeFile[] = []
    const rejected: string[] = []

    for (const file of list) {
      if (!isAcceptedResume(file)) {
        rejected.push(`${file.name} (unsupported type)`)
        continue
      }
      if (file.size > MAX_RESUME_SIZE) {
        rejected.push(`${file.name} (over 10MB)`)
        continue
      }
      const dup = files.some(
        (f) => f.name === file.name && f.size === file.size,
      )
      if (dup) continue
      accepted.push({
        id: makeId(),
        name: file.name,
        size: file.size,
        type: file.type || fileExtension(file.name),
        file,
      })
    }

    if (rejected.length) {
      setError(`Skipped: ${rejected.join(', ')}`)
    }
    if (accepted.length) {
      onChange([...files, ...accepted])
    }
  }

  const remove = (id: string) => {
    onChange(files.filter((f) => f.id !== id))
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
        }}
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed px-6 py-14 text-center transition-all',
          dragging
            ? 'border-blue/70 bg-blue/10'
            : 'border-input bg-white/[0.02] hover:border-blue/40 hover:bg-white/[0.04]',
        )}
      >
        <motion.div
          animate={{ y: dragging ? -6 : 0 }}
          className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"
        >
          <UploadCloud
            className={cn(
              'size-7 transition-colors',
              dragging ? 'text-blue' : 'text-muted-foreground',
            )}
          />
        </motion.div>
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium text-foreground">
            {dragging ? 'Drop resumes to add them' : 'Drag & drop resumes here'}
          </span>
          <span className="text-sm text-muted-foreground">
            or click to browse — PDF, DOCX, DOC or TXT, up to 10MB each
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_RESUME_EXT}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {files.length} {files.length === 1 ? 'resume' : 'resumes'} ready
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              Clear all
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {files.map((f) => (
                <motion.li
                  key={f.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-white/[0.02] p-3"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue/10 text-blue">
                    <FileText className="size-5" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {f.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatBytes(f.size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${f.name}`}
                    onClick={() => remove(f.id)}
                    className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </div>
  )
}
