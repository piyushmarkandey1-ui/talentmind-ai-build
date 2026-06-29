import 'server-only'

import { fileExtension } from '@/lib/workspace'

/**
 * Extracts plain text from a resume file (PDF, DOCX, DOC, TXT) on the server.
 * Throws a descriptive error when the file can't be read.
 */
export async function extractResumeText(file: File): Promise<string> {
  const ext = fileExtension(file.name)
  const buffer = Buffer.from(await file.arrayBuffer())

  if (ext === '.pdf' || file.type === 'application/pdf') {
    const { default: pdfParse } = await import('pdf-parse-fork')
    const data = await pdfParse(buffer)
    return data.text
  }

  if (
    ext === '.docx' ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const { default: mammoth } = await import('mammoth')
    const { value } = await mammoth.extractRawText({ buffer })
    return value
  }

  if (ext === '.txt' || file.type === 'text/plain') {
    return buffer.toString('utf-8')
  }

  // Best effort for legacy .doc (binary) — extract readable ASCII runs.
  if (ext === '.doc' || file.type === 'application/msword') {
    const raw = buffer.toString('latin1')
    const cleaned = raw
      .replace(/[^\x09\x0A\x0D\x20-\x7E]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
    if (cleaned.length < 50) {
      throw new Error('Could not extract text from this .doc file')
    }
    return cleaned
  }

  throw new Error(`Unsupported file type: ${file.name}`)
}

/** Normalizes and caps extracted text to keep prompts within reasonable limits. */
export function normalizeResumeText(text: string, maxChars = 18000): string {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  return normalized.length > maxChars
    ? `${normalized.slice(0, maxChars)}\n\n[... truncated ...]`
    : normalized
}
