import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { extractResumeText, normalizeResumeText } from '@/lib/extract-text'
import { analysisSchema } from '@/lib/analysis-schema'

export const maxDuration = 60 // Allow up to 60s for analysis

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
    const systemPrompt = `You are an expert technical recruiter and AI hiring assistant.
Your task is to evaluate the provided candidate resume against the given job description.
Be objective, evidence-based, and highly analytical.

Job Title: ${jobTitle || 'Not specified'}
Job Description:
${jobContent}

Candidate Resume Text:
${resumeText}

Analyze the candidate's fit for the role. Pay attention to:
- Technical skills vs required skills
- Depth of experience in relevant areas
- Leadership and communication signals
- Career trajectory
- Education

Generate a structured evaluation matching the requested schema. The rationale for each score must cite evidence from the resume.`

    const { object } = await generateObject({
      model: google('gemini-2.5-pro'),
      schema: analysisSchema,
      prompt: systemPrompt,
      temperature: 0.2, // Low temperature for more analytical/consistent results
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
