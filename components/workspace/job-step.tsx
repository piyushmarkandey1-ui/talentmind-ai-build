'use client'

import type { JobDescription } from '@/lib/workspace'
import { cn } from '@/lib/utils'
import { FileText, Sparkles, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

const templates = [
  {
    title: 'Senior Frontend Engineer',
    content:
      'We are looking for a Senior Frontend Engineer with 5+ years of experience building production React applications. Strong TypeScript, modern CSS, performance optimization, and accessibility. Experience leading projects and mentoring engineers is a plus.',
  },
  {
    title: 'Product Designer',
    content:
      'Seeking a Product Designer who can own end-to-end design — from discovery and research through high-fidelity prototypes and shipped UI. Fluent in Figma, design systems, and collaborating closely with engineering. Portfolio required.',
  },
  {
    title: 'Data Scientist',
    content:
      'Hiring a Data Scientist with strong statistics and Python (pandas, scikit-learn). Experience with experimentation, A/B testing, and communicating insights to non-technical stakeholders. ML model deployment experience preferred.',
  },
]

export function JobStep({
  value,
  onChange,
}: {
  value: JobDescription
  onChange: (next: JobDescription) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const readFile = async (file: File) => {
    const text = await file.text()
    onChange({
      title: value.title || file.name.replace(/\.[^.]+$/, ''),
      content: text,
      source: 'file',
      fileName: file.name,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        {/* Title */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">
            Role title
          </span>
          <input
            value={value.title}
            onChange={(e) =>
              onChange({ ...value, title: e.target.value })
            }
            placeholder="e.g. Senior Frontend Engineer"
            className="h-11 rounded-xl border border-input bg-white/[0.03] px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-blue/60 focus:bg-white/[0.05]"
          />
        </label>
        <div className="hidden md:block" />
        <div
          className="flex flex-col gap-2"
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) void readFile(file)
          }}
        >
          <span className="text-sm font-medium text-foreground">
            Or upload a file
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed text-sm transition-colors',
              dragging
                ? 'border-blue/60 bg-blue/10 text-foreground'
                : 'border-input bg-white/[0.03] text-muted-foreground hover:border-blue/40 hover:text-foreground',
            )}
          >
            <Upload className="size-4" />
            {value.source === 'file' && value.fileName
              ? value.fileName
              : 'Drop or browse .txt / .md'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,text/plain"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void readFile(file)
            }}
          />
        </div>
      </div>

      {/* Content */}
      <label className="flex flex-col gap-2">
        <span className="flex items-center justify-between text-sm font-medium text-foreground">
          Job description
          <span className="text-xs font-normal text-muted-foreground">
            {value.content.trim()
              ? `${value.content.trim().split(/\s+/).length} words`
              : 'Paste the full description for the most accurate analysis'}
          </span>
        </span>
        <textarea
          value={value.content}
          onChange={(e) =>
            onChange({ ...value, content: e.target.value, source: 'paste' })
          }
          rows={10}
          placeholder="Paste responsibilities, requirements, and nice-to-haves here..."
          className="resize-y rounded-2xl border border-input bg-white/[0.03] p-4 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-blue/60 focus:bg-white/[0.05]"
        />
      </label>

      {/* Templates */}
      <div className="flex flex-col gap-3">
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3.5 text-blue" />
          Quick start templates
        </span>
        <div className="grid gap-3 sm:grid-cols-3">
          {templates.map((t) => (
            <button
              key={t.title}
              type="button"
              onClick={() =>
                onChange({
                  title: t.title,
                  content: t.content,
                  source: 'paste',
                })
              }
              className="group flex flex-col gap-2 rounded-2xl border border-border bg-white/[0.02] p-4 text-left transition-colors hover:border-blue/40 hover:bg-white/[0.04]"
            >
              <FileText className="size-5 text-muted-foreground transition-colors group-hover:text-blue" />
              <span className="text-sm font-medium text-foreground">
                {t.title}
              </span>
              <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {t.content}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
