import { NextRequest, NextResponse } from 'next/server'
import { extractResumeText, normalizeResumeText } from '@/lib/extract-text'
import { analysisSchema } from '@/lib/analysis-schema'

export const maxDuration = 60

// All on v1beta since the key supports it (v1 doesn't support responseMimeType)
const MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-002',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
]

async function callGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 4096,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`HTTP ${res.status}: ${err.slice(0, 300)}`)
  }

  const data = await res.json()
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!text) throw new Error('Empty response from Gemini')
  return text
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GOOGLE_GENERATIVE_AI_API_KEY is not set on the server.' },
      { status: 500 }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const jobTitle = (formData.get('jobTitle') as string) ?? ''
  const jobContent = (formData.get('jobContent') as string) ?? ''
  const resumeFile = formData.get('resume') as File | null

  if (!jobContent.trim() || !resumeFile) {
    return NextResponse.json({ error: 'Missing job content or resume file.' }, { status: 400 })
  }

  let resumeText: string
  try {
    const raw = await extractResumeText(resumeFile)
    resumeText = normalizeResumeText(raw)
  } catch (e: any) {
    return NextResponse.json({ error: `Could not read resume: ${e.message}` }, { status: 422 })
  }

  const prompt = `You are an expert senior technical recruiter and AI hiring assistant.
Evaluate the candidate resume against the job description below.
Be objective, precise, evidence-based. Cite specific resume evidence in every rationale.

Job Title: ${jobTitle || 'Not specified'}

=== JOB DESCRIPTION ===
${jobContent}

=== CANDIDATE RESUME ===
${resumeText}

Return ONLY a raw JSON object (absolutely no markdown, no code fences, no extra text) with this exact shape:
{
  "candidateName": "Full name from resume, or Unknown Candidate",
  "headline": "Short headline e.g. Senior React Engineer · 6 yrs",
  "overallScore": 85,
  "recommendation": "yes",
  "summary": "2-3 sentence executive summary of this candidate's fit.",
  "dimensions": {
    "skillsMatch":       { "score": 88, "rationale": "One sentence with resume evidence." },
    "experienceDepth":   { "score": 82, "rationale": "One sentence with resume evidence." },
    "education":         { "score": 75, "rationale": "One sentence with resume evidence." },
    "careerTrajectory":  { "score": 80, "rationale": "One sentence with resume evidence." },
    "domainExpertise":   { "score": 85, "rationale": "One sentence with resume evidence." },
    "leadershipSignals": { "score": 70, "rationale": "One sentence with resume evidence." },
    "communication":     { "score": 78, "rationale": "One sentence with resume evidence." },
    "roleFit":           { "score": 86, "rationale": "One sentence with resume evidence." }
  },
  "strengths":          ["strength 1", "strength 2", "strength 3"],
  "concerns":           ["concern 1", "concern 2"],
  "matchedSkills":      ["skill A", "skill B"],
  "missingSkills":      ["missing skill X"],
  "suggestedQuestions": ["question 1?", "question 2?"]
}

Constraints:
- All scores: integers 0-100
- recommendation MUST be exactly one of: strong_yes, yes, maybe, no
- strengths: 3 to 5 strings
- concerns: 2 to 4 strings
- matchedSkills: skills clearly evidenced in the resume
- missingSkills: required skills absent from the resume (can be empty array [])
- suggestedQuestions: 2 to 3 sharp interview questions
- Be honest — not every candidate deserves strong_yes`

  const errors: string[] = []

  for (const model of MODELS) {
    try {
      console.log(`[analyze] Trying ${model}...`)
      const raw = await callGemini(apiKey, model, prompt)

      // Strip any accidental markdown fencing
      const clean = raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/g, '')
        .trim()

      let parsed: unknown
      try {
        parsed = JSON.parse(clean)
      } catch {
        throw new Error(`JSON parse failed. First 300 chars: ${clean.slice(0, 300)}`)
      }

      const validated = analysisSchema.parse(parsed)
      console.log(`[analyze] Success with ${model}`)
      return NextResponse.json(validated)
    } catch (err: any) {
      const msg = err?.message ?? String(err)
      console.warn(`[analyze] ${model} failed: ${msg.slice(0, 200)}`)
      errors.push(`${model}: ${msg.slice(0, 200)}`)
    }
  }

  return NextResponse.json(
    {
      error: `All models failed. Details:\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`,
    },
    { status: 500 }
  )
}
