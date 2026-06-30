import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { extractResumeText, normalizeResumeText } from '@/lib/extract-text'
import { analysisSchema } from '@/lib/analysis-schema'
import { z } from 'zod'

export const maxDuration = 60

// Try multiple models in order of preference
const MODELS_TO_TRY = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-pro',
]

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const jobTitle = formData.get('jobTitle') as string
    const jobContent = formData.get('jobContent') as string
    const resumeFile = formData.get('resume') as File

    if (!jobContent || !resumeFile) {
      return NextResponse.json({ error: 'Missing job content or resume file' }, { status: 400 })
    }

    const rawResumeText = await extractResumeText(resumeFile)
    const resumeText = normalizeResumeText(rawResumeText)

    const prompt = `You are an expert senior technical recruiter and AI hiring assistant.
Evaluate the candidate resume against the job description. Be objective, precise, and evidence-based.

Job Title: ${jobTitle || 'Not specified'}

Job Description:
---
${jobContent}
---

Candidate Resume:
---
${resumeText}
---

Return ONLY valid JSON matching this exact structure (no markdown, no code blocks, just raw JSON):
{
  "candidateName": "Full name from resume or 'Unknown Candidate'",
  "headline": "Short professional headline e.g. 'Senior React Engineer, 6 yrs'",
  "overallScore": 85,
  "recommendation": "strong_yes|yes|maybe|no",
  "summary": "2-3 sentence executive summary of fit for the role.",
  "dimensions": {
    "skillsMatch": { "score": 90, "rationale": "Evidence-based one sentence." },
    "experienceDepth": { "score": 85, "rationale": "Evidence-based one sentence." },
    "education": { "score": 80, "rationale": "Evidence-based one sentence." },
    "careerTrajectory": { "score": 82, "rationale": "Evidence-based one sentence." },
    "domainExpertise": { "score": 88, "rationale": "Evidence-based one sentence." },
    "leadershipSignals": { "score": 75, "rationale": "Evidence-based one sentence." },
    "communication": { "score": 80, "rationale": "Evidence-based one sentence." },
    "roleFit": { "score": 87, "rationale": "Evidence-based one sentence." }
  },
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "concerns": ["Concern 1", "Concern 2"],
  "matchedSkills": ["Skill A", "Skill B", "Skill C"],
  "missingSkills": ["Missing Skill X", "Missing Skill Y"],
  "suggestedQuestions": ["Question 1?", "Question 2?"]
}

Rules:
- All scores are integers 0-100
- recommendation must be exactly one of: strong_yes, yes, maybe, no
- strengths: 3-5 items
- concerns: 2-4 items  
- matchedSkills: skills the candidate clearly has
- missingSkills: required skills not evidenced
- suggestedQuestions: 2-3 sharp interview questions
- Be honest, not everyone is strong_yes`

    const genAI = new GoogleGenerativeAI(apiKey)

    let lastError: Error | null = null
    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        })

        const result = await model.generateContent(prompt)
        const text = result.response.text()

        // Parse and validate the JSON
        let parsed: unknown
        try {
          // Strip any accidental markdown code fences
          const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
          parsed = JSON.parse(clean)
        } catch {
          throw new Error(`Invalid JSON from model: ${text.slice(0, 200)}`)
        }

        // Validate with zod
        const validated = analysisSchema.parse(parsed)
        return NextResponse.json(validated)
      } catch (err: any) {
        console.warn(`Model ${modelName} failed:`, err.message)
        lastError = err
        // If it's a model-not-found error, try next model
        if (
          err.message?.includes('not found') ||
          err.message?.includes('not supported') ||
          err.message?.includes('PERMISSION_DENIED') ||
          err.message?.includes('404')
        ) {
          continue
        }
        // For other errors (JSON parse, quota, etc.) — still try next model
        continue
      }
    }

    throw lastError || new Error('All models failed to generate a response')
  } catch (error: any) {
    console.error('Analysis failed:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze candidate' },
      { status: 500 }
    )
  }
}
