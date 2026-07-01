import { NextRequest, NextResponse } from 'next/server'
import { extractResumeText, normalizeResumeText } from '@/lib/extract-text'
import { analysisSchema } from '@/lib/analysis-schema'
import crypto from 'crypto'

export const maxDuration = 60

// ── In-memory cache ──────────────────────────────────────────────────────────
// Keyed by SHA-256(jobContent + resumeText) → ensures identical input always
// returns identical output, eliminating duplicate evaluations.
const cache = new Map<string, object>()

function hashInputs(jobContent: string, resumeText: string): string {
  return crypto
    .createHash('sha256')
    .update(jobContent.trim() + '|||' + resumeText.trim())
    .digest('hex')
}

// ── Models ───────────────────────────────────────────────────────────────────
const MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash-exp',
]

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
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
        temperature: 0,        // Fully deterministic — same input = same output
        topP: 1,
        topK: 1,
        maxOutputTokens: 8192,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw Object.assign(new Error(`HTTP ${res.status}: ${err.slice(0, 400)}`), {
      status: res.status,
    })
  }

  const data = await res.json()
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!text) throw new Error('Empty response from Gemini')
  return text
}

// ── Prompt builder ───────────────────────────────────────────────────────────
function buildPrompt(jobTitle: string, jobContent: string, resumeText: string): string {
  return `You are a world-class senior technical recruiter with 20+ years of experience at top-tier companies.
You have read thousands of resumes and you provide deeply analytical, evidence-driven, candidate-specific evaluations.

Your evaluation must be:
✦ SPECIFIC: Quote or reference exact companies, job titles, years, technologies, and projects from THIS resume.
✦ UNIQUE: Every sentence must contain information specific to this candidate. Never write generic statements.
✦ HONEST: If a skill is missing, say so. If experience is shallow, say so. Not everyone scores 90+.
✦ DETERMINISTIC: For the exact same resume and JD, you must give the exact same evaluation every time.

━━━━━━━━━━━━━━━━━━━━━━━━
TARGET ROLE
━━━━━━━━━━━━━━━━━━━━━━━━
Job Title: ${jobTitle || 'Not specified'}

Job Description:
${jobContent}

━━━━━━━━━━━━━━━━━━━━━━━━
CANDIDATE RESUME
━━━━━━━━━━━━━━━━━━━━━━━━
${resumeText}

━━━━━━━━━━━━━━━━━━━━━━━━
EVALUATION INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1 — READ & EXTRACT (do this mentally before scoring):
• What is the candidate's current/most recent role and company?
• How many total years of relevant experience do they have?
• Which required skills from the JD appear in the resume? Which do not?
• What is the most impressive achievement or project mentioned?
• What education do they have and is it relevant?
• Is there evidence of leadership, team management, or mentoring?
• What is the career growth pattern — linear, lateral, or declining?

STEP 2 — SCORE each dimension (0–100) using this strict rubric:
  95–100: Exceeds every requirement with evidence of exceptional achievement
  85–94:  Meets all requirements with strong, specific evidence
  70–84:  Meets most requirements, minor gaps
  55–69:  Meets some requirements, notable gaps
  40–54:  Partial match, significant gaps
  0–39:   Mostly unqualified

CRITICAL RULES FOR RATIONALE:
• Every rationale MUST name a specific company, role, project, or technology from the resume
• FORBIDDEN phrases: "demonstrates strong", "shows experience", "has background in", "is familiar with", 
  "possesses skills", "has knowledge of", "has worked with" — these are vague and banned
• GOOD example: "Led frontend architecture at Acme Corp (2021–2023) using React 18 and TypeScript, 
  matching the JD's requirement for production-scale React expertise"
• BAD example: "Shows strong React experience and relevant frontend skills"

DIMENSION SCORING GUIDE:
- skillsMatch: Compare required skills list from JD vs skills listed/demonstrated in resume
- experienceDepth: Years in the specific domain, seniority level, and complexity of past work
- education: Relevance and level of formal education to this role
- careerTrajectory: Is the candidate growing upward? Promotions? Increasing responsibility?
- domainExpertise: Industry-specific knowledge relevant to this role
- leadershipSignals: Evidence of leading teams, mentoring, owning projects end-to-end
- communication: Quality of writing in the resume, use of metrics, clarity of impact statements
- roleFit: Overall alignment of the candidate's profile with this specific role

FOR strengths: Give 3–5 SPECIFIC points that directly reference this candidate's actual experience.
FOR concerns: Give 2–4 REAL gaps or risks, citing what is missing relative to the JD.
FOR matchedSkills: Only include skills EXPLICITLY mentioned or clearly demonstrated in the resume.
FOR missingSkills: Only include skills the JD explicitly REQUIRES that are absent from the resume.
FOR suggestedQuestions: Write probing questions that directly address the candidate's specific background.
  - Reference their actual past companies or projects
  - Probe identified weaknesses
  - Verify key claims

FOR recommendation:
  strong_yes — Score ≥ 88, meets almost all requirements, strong evidence
  yes        — Score 75–87, meets most requirements, manageable gaps
  maybe      — Score 60–74, partial match, significant concerns
  no         — Score < 60, not suitable for this role

FOR headline: Format as "Role Title · X yrs experience" using data from the resume.

FOR summary: Write 2–3 sentences that are 100% specific to this candidate.
  - Mention their actual current/recent role and company
  - Reference their most relevant experience for this role
  - State the key reason to move forward or the key concern

━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY a raw JSON object. No markdown, no code fences, no explanation. Just the JSON.

{
  "candidateName": "Extract exact name from resume",
  "headline": "Most recent role · X yrs exp",
  "overallScore": 82,
  "recommendation": "yes",
  "summary": "Candidate-specific 2-3 sentence summary mentioning actual companies and roles.",
  "dimensions": {
    "skillsMatch":       { "score": 85, "rationale": "Specific evidence from resume citing company/tech/project." },
    "experienceDepth":   { "score": 80, "rationale": "Specific evidence from resume citing years/role/scope." },
    "education":         { "score": 75, "rationale": "Specific degree and institution from resume." },
    "careerTrajectory":  { "score": 78, "rationale": "Specific progression pattern from resume." },
    "domainExpertise":   { "score": 82, "rationale": "Specific domain evidence from resume." },
    "leadershipSignals": { "score": 70, "rationale": "Specific leadership evidence or lack thereof." },
    "communication":     { "score": 76, "rationale": "Specific observation about how resume is written." },
    "roleFit":           { "score": 80, "rationale": "Specific alignment between candidate profile and this JD." }
  },
  "strengths": [
    "Specific strength 1 naming actual experience",
    "Specific strength 2 naming actual achievement",
    "Specific strength 3 naming actual skill/project"
  ],
  "concerns": [
    "Specific concern 1 referencing JD requirement vs resume gap",
    "Specific concern 2 referencing actual evidence or lack thereof"
  ],
  "matchedSkills": ["Only skills explicitly in the resume"],
  "missingSkills": ["Only skills the JD requires that are absent"],
  "suggestedQuestions": [
    "Question referencing candidate's actual experience at [Company]?",
    "Question probing identified gap or weakness?"
  ]
}`
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Neither GEMINI_API_KEY nor GOOGLE_GENERATIVE_AI_API_KEY is configured on the server.' },
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

  // Extract resume text
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

  // ── Cache check ────────────────────────────────────────────────────────────
  const cacheKey = hashInputs(jobContent, resumeText)
  if (cache.has(cacheKey)) {
    console.log(`[analyze] Cache hit for ${resumeFile.name}`)
    return NextResponse.json(cache.get(cacheKey))
  }

  // ── Build prompt and call Gemini ───────────────────────────────────────────
  const prompt = buildPrompt(jobTitle, jobContent, resumeText)
  const errors: string[] = []

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[analyze] ${model} attempt ${attempt} for "${resumeFile.name}"`)
        const raw = await callGemini(apiKey, model, prompt)

        const clean = raw
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/g, '')
          .trim()

        const parsed = JSON.parse(clean)
        const validated = analysisSchema.parse(parsed)

        // Store in cache
        cache.set(cacheKey, validated)
        // Evict old entries if cache grows large
        if (cache.size > 200) {
          const firstKey = cache.keys().next().value
          if (firstKey) cache.delete(firstKey)
        }

        console.log(`[analyze] ✓ ${model} succeeded for "${resumeFile.name}"`)
        return NextResponse.json(validated)
      } catch (err: any) {
        const status = err?.status as number | undefined
        const msg = err?.message ?? String(err)

        if (status === 429 && attempt === 1) {
          console.warn(`[analyze] ${model} quota hit, waiting 5s...`)
          await sleep(5000)
          continue
        }

        console.warn(`[analyze] ${model} attempt ${attempt} failed: ${msg.slice(0, 200)}`)
        errors.push(`${model}: ${msg.slice(0, 200)}`)
        break
      }
    }
  }

  const isQuota = errors.some((e) => e.includes('429'))
  return NextResponse.json(
    {
      error: isQuota
        ? 'API quota exceeded. The free Gemini tier allows ~15 requests/minute. Please wait 1 minute and try again.'
        : `All models failed.\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`,
    },
    { status: 500 }
  )
}
