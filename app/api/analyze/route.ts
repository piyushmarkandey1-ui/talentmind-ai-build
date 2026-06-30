import { NextRequest, NextResponse } from 'next/server'
import { extractResumeText, normalizeResumeText } from '@/lib/extract-text'
import { analysisSchema } from '@/lib/analysis-schema'

export const maxDuration = 60

// Models to try in order — v1 models first, then v1beta
const MODELS = [
  { model: 'gemini-1.5-flash', version: 'v1' },
  { model: 'gemini-1.5-pro', version: 'v1' },
  { model: 'gemini-1.0-pro', version: 'v1' },
  { model: 'gemini-1.5-flash-latest', version: 'v1' },
  { model: 'gemini-2.0-flash', version: 'v1beta' },
  { model: 'gemini-2.0-flash-lite', version: 'v1beta' },
]

async function callGemini(
  apiKey: string,
  modelName: string,
  apiVersion: string,
  prompt: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`${res.status}: ${errText}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!text) throw new Error('Empty response from model')
  return text
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured on server.' }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const jobTitle = formData.get('jobTitle') as string
    const jobContent = formData.get('jobContent') as string
    const resumeFile = formData.get('resume') as File

    if (!jobContent || !resumeFile) {
      return NextResponse.json({ error: 'Missing job content or resume file.' }, { status: 400 })
    }

    const rawText = await extractResumeText(resumeFile)
    const resumeText = normalizeResumeText(rawText)

    const prompt = `You are an expert senior technical recruiter and AI hiring assistant.
Evaluate the candidate resume against the job description. Be objective, precise, and evidence-based.
Always cite specific evidence from the resume to justify each score.

Job Title: ${jobTitle || 'Not specified'}

Job Description:
---
${jobContent}
---

Candidate Resume:
---
${resumeText}
---

Return ONLY a valid JSON object (no markdown, no code fences, just raw JSON) matching this exact structure:
{
  "candidateName": "Full name from resume, or 'Unknown Candidate'",
  "headline": "Short professional headline e.g. 'Senior React Engineer, 6 yrs exp'",
  "overallScore": 85,
  "recommendation": "strong_yes",
  "summary": "2-3 sentence executive summary of fit for this role.",
  "dimensions": {
    "skillsMatch": { "score": 90, "rationale": "One sentence citing resume evidence." },
    "experienceDepth": { "score": 85, "rationale": "One sentence citing resume evidence." },
    "education": { "score": 80, "rationale": "One sentence citing resume evidence." },
    "careerTrajectory": { "score": 82, "rationale": "One sentence citing resume evidence." },
    "domainExpertise": { "score": 88, "rationale": "One sentence citing resume evidence." },
    "leadershipSignals": { "score": 75, "rationale": "One sentence citing resume evidence." },
    "communication": { "score": 80, "rationale": "One sentence citing resume evidence." },
    "roleFit": { "score": 87, "rationale": "One sentence citing resume evidence." }
  },
  "strengths": ["Concrete strength 1", "Concrete strength 2", "Concrete strength 3"],
  "concerns": ["Gap or concern 1", "Gap or concern 2"],
  "matchedSkills": ["Skill A", "Skill B", "Skill C"],
  "missingSkills": ["Missing skill X", "Missing skill Y"],
  "suggestedQuestions": ["Sharp interview question 1?", "Sharp interview question 2?"]
}

Rules:
- All scores: integers 0-100
- recommendation: exactly one of strong_yes, yes, maybe, no
- strengths: 3-5 items
- concerns: 2-4 items
- matchedSkills: skills clearly evidenced in the resume
- missingSkills: required skills not found in the resume
- suggestedQuestions: 2-3 probing interview questions`

    const errors: string[] = []

    for (const { model, version } of MODELS) {
      try {
        console.log(`Trying model: ${model} (${version})`)
        const rawText = await callGemini(apiKey, model, version, prompt)

        // Clean any accidental markdown wrapping
        const clean = rawText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim()

        let parsed: unknown
        try {
          parsed = JSON.parse(clean)
        } catch {
          throw new Error(`JSON parse failed. Raw: ${clean.slice(0, 300)}`)
        }

        const validated = analysisSchema.parse(parsed)
        console.log(`Success with model: ${model}`)
        return NextResponse.json(validated)
      } catch (err: any) {
        const msg = err?.message ?? String(err)
        console.warn(`Model ${model} failed: ${msg}`)
        errors.push(`${model}: ${msg}`)
        // Always continue to next model
      }
    }

    return NextResponse.json(
      {
        error: `All models failed. Errors:\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`,
      },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Unexpected server error' },
      { status: 500 }
    )
  }
}
