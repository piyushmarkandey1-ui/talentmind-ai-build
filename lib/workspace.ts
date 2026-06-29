export type ResumeFile = {
  id: string
  name: string
  size: number
  type: string
  file: File
}

export type JobDescription = {
  title: string
  content: string
  source: 'paste' | 'file'
  fileName?: string
}

export const ACCEPTED_RESUME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain',
]

export const ACCEPTED_RESUME_EXT = '.pdf,.docx,.doc,.txt'

export const MAX_RESUME_SIZE = 10 * 1024 * 1024 // 10MB

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

export function fileExtension(name: string): string {
  const parts = name.split('.')
  return parts.length > 1 ? `.${parts.pop()!.toLowerCase()}` : ''
}

export function isAcceptedResume(file: File): boolean {
  const ext = fileExtension(file.name)
  return (
    ACCEPTED_RESUME_TYPES.includes(file.type) ||
    ['.pdf', '.docx', '.doc', '.txt'].includes(ext)
  )
}
