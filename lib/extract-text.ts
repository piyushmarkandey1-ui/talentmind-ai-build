import 'server-only'

import { fileExtension } from '@/lib/workspace'

/**
 * Extracts plain text from a resume file (PDF, DOCX, DOC, TXT, or image) on the server.
 * For images, uses Gemini Vision to OCR the resume content.
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

  // Image files — use Gemini Vision to OCR and extract text
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/pjpeg']
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.pjpeg']
  if (imageTypes.includes(file.type) || imageExts.includes(ext)) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) throw new Error('Gemini API key is required to process image resumes.')

    const base64 = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'

    let lastErrorMsg = ''
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  {
                    text: 'This is a resume image. Please extract ALL text content from it exactly as it appears, preserving names, companies, dates, skills, education, and contact info. Return ONLY the extracted text, no additional commentary.',
                  },
                  {
                    inline_data: { mime_type: mimeType, data: base64 },
                  },
                ],
              }],
              generationConfig: { temperature: 0, maxOutputTokens: 8192 },
            }),
          }
        )

        if (!response.ok) {
          const err = await response.text()
          const isRateLimit = response.status === 429 || err.includes('quota') || err.includes('limit')
          
          if (isRateLimit && attempt < 3) {
            const waitTime = attempt * 4000
            console.warn(`[extract-text] Gemini Vision rate limit hit (429), retrying in ${waitTime}ms...`)
            await new Promise(r => setTimeout(r, waitTime))
            continue
          }
          throw new Error(`HTTP ${response.status}: ${err}`)
        }

        const data = await response.json()
        const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        if (!text) throw new Error('Gemini Vision returned empty text for image resume.')
        return text
      } catch (err: any) {
        lastErrorMsg = err.message || String(err)
        if (attempt < 3) {
          const waitTime = attempt * 3000
          console.warn(`[extract-text] Attempt ${attempt} failed: ${lastErrorMsg}. Retrying in ${waitTime}ms...`)
          await new Promise(r => setTimeout(r, waitTime))
          continue
        }
      }
    }

    throw new Error(`Gemini Vision failed to process image resume after 3 attempts: ${lastErrorMsg}`)
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
