import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { extractResumeText, normalizeResumeText } from '@/lib/extract-text'
import { analysisSchema } from '@/lib/analysis-schema'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const jobTitle = formData.get('jobTitle') as string
    const jobContent = formData.get('jobContent') as string
    const resumeFile = formData.get('resume') as File

    if (!jobContent || !resumeFile) {
      return NextResponse.json(
        { error: 'Missing job content or resume file' },
        { status: 400 }
      )
    }

    // Extract and normalize text from the resume
    const rawResumeText = await extractResumeText(resumeFile)
    const resumeText = normalizeResumeText(rawResumeText)

    // Build the prompt for Gemini
    const systemPrompt = `You are an expert senior technical recruiter and AI hiring assistant.
Your task is to evaluate the provided candidate resume against the given job description.
Be objective, precise, evidence-based, and highly analytical.
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

Evaluate the candidate thoroughly across all dimensions. 
- Score each dimension from 0-100 based on evidence in the resume.
- Provide 3-5 concrete strengths, 2-4 real concerns, matched skills, missing skills, and 2-3 sharp interview questions.
- The recommendation must be one of: strong_yes, yes, maybe, no
- The overall score should be a weighted composite of all dimension scores.
- Be honest - not every candidate is a strong yes.`

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: analysisSchema,
      prompt: systemPrompt,
    })

    return NextResponse.json(object)
  } catch (error: any) {
    console.error('Analysis failed:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze candidate' },
      { status: 500 }
    )
  }
}
