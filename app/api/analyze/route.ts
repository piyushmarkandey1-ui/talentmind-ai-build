import { NextRequest, NextResponse } from 'next/server'
import { extractResumeText, normalizeResumeText } from '@/lib/extract-text'
import { analysisSchema } from '@/lib/analysis-schema'

export const maxDuration = 60

// Only Gemini 2.x models — this key doesn't have access to 1.5 models
const MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash-exp',
]

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
    const code = res.status
    throw Object.assign(new Error(`HTTP ${code}: ${err.slice(0, 400)}`), { status: code })
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
      { error: 'GOOGLE_GENERATIVE_AI_API_KEY is not configured on the server.' },
      { status: 500 }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
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
    return NextResponse.json(
      { error: `Could not read resume file: ${e.message}` },
      { status: 422 }
    )
  }

  const prompt = `You are an expert senior technical recruiter and AI hiring assistant.
Evaluate the candidate resume against the job description below.
Be objective, precise, and evidence-based. Cite specific resume evidence in every rationale.

Job Title: ${jobTitle || 'Not specified'}

=== JOB DESCRIPTION ===
${jobContent}

=== CANDIDATE RESUME ===
${resumeText}

Return ONLY a raw JSON object — absolutely no markdown, no code fences, no explanation, just the JSON.

{
  "candidateName": "Full name from resume or Unknown Candidate",
  "headline": "Short professional headline e.g. Senior React Engineer · 6 yrs",
  "overallScore": 85,
  "recommendation": "yes",
  "summary": "2-3 sentence executive summary of this candidate's fit for the role.",
  "dimensions": {
    "skillsMatch":       { "score": 88, "rationale": "One sentence citing resume evidence." },
    "experienceDepth":   { "score": 82, "rationale": "One sentence citing resume evidence." },
    "education":         { "score": 75, "rationale": "One sentence citing resume evidence." },
    "careerTrajectory":  { "score": 80, "rationale": "One sentence citing resume evidence." },
    "domainExpertise":   { "score": 85, "rationale": "One sentence citing resume evidence." },
    "leadershipSignals": { "score": 70, "rationale": "One sentence citing resume evidence." },
    "communication":     { "score": 78, "rationale": "One sentence citing resume evidence." },
    "roleFit":           { "score": 86, "rationale": "One sentence citing resume evidence." }
  },
  "strengths":          ["Concrete strength 1", "Concrete strength 2", "Concrete strength 3"],
  "concerns":           ["Real concern 1", "Real concern 2"],
  "matchedSkills":      ["Skill A", "Skill B", "Skill C"],
  "missingSkills":      ["Missing skill X"],
  "suggestedQuestions": ["Sharp interview question 1?", "Sharp interview question 2?"]
}

Rules:
- overallScore: integer 0-100
- All dimension scores: integer 0-100
- recommendation: MUST be exactly one of: strong_yes, yes, maybe, no
- strengths: 3 to 5 items
- concerns: 2 to 4 items
- missingSkills: can be empty array [] if none
- suggestedQuestions: 2 to 3 items`

  const errors: string[] = []

  for (const model of MODELS) {
    // Try each model up to 2 times (once immediate, once after a short wait for quota)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[analyze] ${model} attempt ${attempt}...`)
        const raw = await callGemini(apiKey, model, prompt)

        const clean = raw
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/g, '')
          .trim()

        const parsed = JSON.parse(clean)
        const validated = analysisSchema.parse(parsed)

        console.log(`[analyze] ✓ Success with ${model} (attempt ${attempt})`)
        return NextResponse.json(validated)
      } catch (err: any) {
        const status = err?.status as number | undefined
        const msg = err?.message ?? String(err)

        if (status === 429 && attempt === 1) {
          // Quota hit — wait 5 seconds and retry this model once
          console.warn(`[analyze] ${model} quota hit, waiting 5s...`)
          await sleep(5000)
          continue
        }

        console.warn(`[analyze] ${model} attempt ${attempt} failed: ${msg.slice(0, 150)}`)
        if (attempt === 2 || status !== 429) {
          errors.push(`${model}: ${msg.slice(0, 150)}`)
          break
        }
      }
    }
  }

  return NextResponse.json(
    {
      error:
        errors.some((e) => e.includes('429'))
          ? 'API quota exceeded. The free Gemini tier allows ~15 requests/min. Please wait 1 minute and try again.'
          : `Analysis failed. Details:\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`,
    },
    { status: 500 }
  )
}
