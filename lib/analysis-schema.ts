import { z } from 'zod'

export const DIMENSIONS = [
  { key: 'skillsMatch', label: 'Skills match' },
  { key: 'experienceDepth', label: 'Experience depth' },
  { key: 'education', label: 'Education' },
  { key: 'careerTrajectory', label: 'Career trajectory' },
  { key: 'domainExpertise', label: 'Domain expertise' },
  { key: 'leadershipSignals', label: 'Leadership signals' },
  { key: 'communication', label: 'Communication' },
  { key: 'roleFit', label: 'Role fit' },
] as const

export type DimensionKey = (typeof DIMENSIONS)[number]['key']

const dimensionScore = z.object({
  score: z.number().min(0).max(100).describe('Score from 0-100 for this dimension'),
  rationale: z
    .string()
    .describe('One-sentence, evidence-backed justification citing the resume'),
})

export const analysisSchema = z.object({
  candidateName: z
    .string()
    .describe('The candidate full name as found in the resume, or "Unknown candidate"'),
  headline: z
    .string()
    .describe('A short professional headline, e.g. "Senior Frontend Engineer, 8 yrs"'),
  overallScore: z
    .number()
    .min(0)
    .max(100)
    .describe('Overall weighted fit score from 0-100'),
  recommendation: z
    .enum(['strong_yes', 'yes', 'maybe', 'no'])
    .describe('Hiring recommendation'),
  summary: z
    .string()
    .describe('2-3 sentence executive summary of fit for the role'),
  dimensions: z.object({
    skillsMatch: dimensionScore,
    experienceDepth: dimensionScore,
    education: dimensionScore,
    careerTrajectory: dimensionScore,
    domainExpertise: dimensionScore,
    leadershipSignals: dimensionScore,
    communication: dimensionScore,
    roleFit: dimensionScore,
  }),
  strengths: z
    .array(z.string())
    .describe('3-5 concrete strengths relevant to the role'),
  concerns: z
    .array(z.string())
    .describe('2-4 gaps, risks, or missing qualifications'),
  matchedSkills: z
    .array(z.string())
    .describe('Key required skills the candidate clearly demonstrates'),
  missingSkills: z
    .array(z.string())
    .describe('Required skills not evidenced in the resume'),
  suggestedQuestions: z
    .array(z.string())
    .describe('2-3 sharp interview questions to probe gaps or verify strengths'),
})

export type CandidateAnalysis = z.infer<typeof analysisSchema>

export type RecruiterFeedback = {
  decision: 'yes' | 'no' | 'hold' | null
  notes: string
}

export type AnalysisResult =
  | { id: string; fileName: string; status: 'ok'; analysis: CandidateAnalysis; feedback?: RecruiterFeedback }
  | { id: string; fileName: string; status: 'error'; error: string }

export const RECOMMENDATION_META: Record<
  CandidateAnalysis['recommendation'],
  { label: string; tone: 'emerald' | 'blue' | 'amber' | 'rose' }
> = {
  strong_yes: { label: 'Strong yes', tone: 'emerald' },
  yes: { label: 'Yes', tone: 'blue' },
  maybe: { label: 'Maybe', tone: 'amber' },
  no: { label: 'No', tone: 'rose' },
}
