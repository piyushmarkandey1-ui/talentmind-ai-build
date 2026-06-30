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

  if (ext === '.json' || file.type === 'application/json') {
    const raw = buffer.toString('utf-8')
    try {
      const data = JSON.parse(raw)
      // Check if it's the hackathon schema
      if (data.candidate_id && data.profile) {
        let text = `Name: ${data.profile.anonymized_name}\nHeadline: ${data.profile.headline}\nSummary: ${data.profile.summary}\nLocation: ${data.profile.location}\nYears of Experience: ${data.profile.years_of_experience}\nCurrent Title: ${data.profile.current_title}\nCurrent Company: ${data.profile.current_company}\n\nEXPERIENCE:\n`
        if (data.career_history) {
          data.career_history.forEach((job: any) => {
            text += `- ${job.title} at ${job.company} (${job.start_date} to ${job.end_date || 'Present'}) [${job.duration_months} months]\n  ${job.description}\n`
          })
        }
        text += `\nEDUCATION:\n`
        if (data.education) {
          data.education.forEach((edu: any) => {
            text += `- ${edu.degree} in ${edu.field_of_study} at ${edu.institution} (${edu.start_year}-${edu.end_year})\n`
          })
        }
        text += `\nSKILLS:\n`
        if (data.skills) {
          text += data.skills.map((s: any) => `${s.name} (${s.proficiency})`).join(', ') + '\n'
        }
        return text
      }
      return JSON.stringify(data, null, 2)
    } catch {
      throw new Error('Invalid JSON file')
    }
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
