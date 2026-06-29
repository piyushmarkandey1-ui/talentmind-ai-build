'use client'

import { formatBytes, type JobDescription, type ResumeFile } from '@/lib/workspace'
import { Briefcase, FileText, Layers, Sparkles } from 'lucide-react'

const dimensions = [
  'Skills match',
  'Experience depth',
  'Education',
  'Career trajectory',
  'Domain expertise',
  'Leadership signals',
  'Communication',
  'Role fit',
]

export function ReviewStep({
  job,
  resumes,
}: {
  job: JobDescription
  resumes: ResumeFile[]
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white/[0.02] p-5">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Briefcase className="size-4 text-blue" />
            Role
          </span>
          <span className="text-lg font-semibold text-foreground">
            {job.title || 'Untitled role'}
          </span>
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
            {job.content || 'No description provided.'}
          </p>
          <span className="mt-auto text-xs text-muted-foreground">
            {job.content.trim()
              ? `${job.content.trim().split(/\s+/).length} words`
              : '—'}
          </span>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white/[0.02] p-5">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Layers className="size-4 text-cyan" />
            Candidates
          </span>
          <span className="text-lg font-semibold text-foreground">
            {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}
          </span>
          <ul className="flex flex-col gap-1.5">
            {resumes.slice(0, 4).map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{r.name}</span>
                <span className="ml-auto shrink-0 text-xs">
                  {formatBytes(r.size)}
                </span>
              </li>
            ))}
            {resumes.length > 4 && (
              <li className="text-xs text-muted-foreground">
                + {resumes.length - 4} more
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-blue/20 bg-blue/[0.04] p-5">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles className="size-4 text-blue" />
          Gemini will evaluate each candidate across
        </span>
        <div className="flex flex-wrap gap-2">
          {dimensions.map((d) => (
            <span
              key={d}
              className="rounded-full border border-border bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground"
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
