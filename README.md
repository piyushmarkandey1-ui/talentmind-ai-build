# TalentMind AI — The AI Hiring Operating System

> **AI-Powered Resume Analysis & Candidate Ranking**  
> Turning stacks of resumes into a ranked, explainable shortlist in minutes — powered by Google Gemini.

**Built by:** Piyush Markandey & Anish Kumar

---

## 🔗 Live Demo

**[https://talentmind-ai-build.vercel.app](https://talentmind-ai-build.vercel.app)**

---

## What is TalentMind AI?

TalentMind AI is a production-grade AI recruiting assistant that helps recruiters evaluate candidates semantically — not just by keyword matching. A recruiter pastes a job description, uploads one or more resumes (PDF/DOCX), and receives a ranked shortlist with deep, evidence-backed analysis for each candidate.

The tool is designed to **augment human judgment**, not replace it. Every recommendation comes with a detailed explanation so the recruiter always understands *why* a candidate ranked where they did.

---

## Core Features

### 🔐 Authentication & User Management
- **Email/password signup** with Supabase Auth
- **Persistent sessions** — users stay logged in across devices
- **Profile management** — name, email stored in Supabase database
- **Sign out / Switch user** functionality for multiple recruiters

### 🧠 AI Candidate Evaluation
- Evaluates each resume across **11 dimensions**: Technical Skills, Relevant Experience, Project Quality, Career Progression, Leadership, Communication, Learning Potential, Transferable Skills, Domain Knowledge, Missing Skills, and Overall Role Fit
- Each dimension returns a **score (0–100)** plus an evidence-backed rationale pulled directly from the resume
- Returns **strengths**, **concerns & gaps**, **verified skills**, **missing skills**, and **5 tailored interview questions** per candidate
- Generates a **human-readable summary** and a final recommendation: Strong Recommend / Recommend / Borderline / Not Recommended

### 🎯 Smart Evaluation Engine
- **Deterministic results**: `temperature: 0` ensures identical resumes always produce identical scores — no randomness between evaluation runs
- **SHA-256 content hashing**: If the exact same resume + job description combination is submitted, the cached result is returned instantly — no duplicate API calls
- **Strict prompt engineering**: The system prompt explicitly forbids generic "fluff" and demands evidence anchored to specific company names, project names, and role details from the actual resume
- **Model fallback**: Automatically falls back `gemini-2.0-flash` → `gemini-1.5-flash` → `gemini-1.5-flash-8b` on quota errors

### � Cloud Storage with Supabase
- **Persistent database storage** — all recruiter profiles, job descriptions, resumes, and analyses stored in Supabase
- **Session history** — view and restore past analysis sessions
- **Cross-device access** — data accessible from any device
- **Profile caching** — reduces database queries with 5-minute cache TTL
- **Row Level Security** — users can only access their own data

### 📝 Recruiter Feedback & Decision Tracking
- On every candidate card, the recruiter can mark a final decision: **Selected ✓ / Hold ⏸ / Rejected ✗**
- A private **notes field** lets the recruiter write anything about the candidate
- Feedback is **auto-saved in real time** to the database — no save button needed
- Candidates can be **deleted** individually from the results view

### 📄 PDF / Print Export
- Every candidate card has an **Export PDF** button
- Generates a fully styled HTML report and opens the system print dialog
- The report uses **CSS variables** that automatically switch to a clean light theme for printing — all text is visible and readable
- Includes: candidate name, headline, overall score, recommendation badge, all 11 dimension scores with rationale, strengths, concerns, verified/missing skills, interview questions, and the recruiter's feedback notes + decision

### 🌗 Dual Theme System
- **Dark Mode** (default): Glassmorphism, aurora gradient blobs, floating particle canvas, subtle glow — premium and immersive
- **Light Mode**: Premium Neumorphic Soft UI — Apple/Notion/Linear aesthetic with raised white cards, soft layered shadows, neumorphic buttons, and a deep-blue CTA banner
- Theme toggle (☀️/🌙) in the navbar, persisted to `localStorage`, applied before first paint with no flash

### 📱 Mobile Responsive
- **Fully responsive design** optimized for mobile devices
- **Compact stepper** with horizontal scroll on mobile
- **Responsive typography** scaling across screen sizes
- **Touch-friendly UI** with appropriate tap targets

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + Custom Neumorphic CSS |
| **Animations** | Motion (Framer Motion v12) |
| **AI Model** | Google Gemini 2.0 Flash (`gemini-2.0-flash-exp`) |
| **AI Integration** | Direct `fetch` to Gemini REST API (`v1beta`) |
| **Authentication** | Supabase Auth (Email/Password) |
| **Database** | Supabase PostgreSQL |
| **File Parsing** | `pdf-parse-fork` (PDF), `mammoth` (DOCX) |
| **Content Hashing** | Web Crypto API — SHA-256 |
| **Rate Limiting** | Upstash Redis (optional) |
| **PDF Export** | Blob URL + system print dialog |
| **Deployment** | Vercel |
| **Analytics** | Vercel Analytics |

---

## Key Technical Decisions

### Why direct `fetch` instead of the Gemini SDK?
The SDK does not expose fine-grained control over quota error retry logic. Using `fetch` directly against the `v1beta` REST endpoint allows the app to detect `429 RESOURCE_EXHAUSTED` errors and silently fall back to smaller models without breaking the user experience.

### Why `responseMimeType: 'application/json'`?
The `v1beta` endpoint supports JSON mode natively. This guarantees the model returns valid, parseable JSON every time instead of Markdown-wrapped code blocks that require regex stripping.

### Why SHA-256 hashing for caching?
Generating AI evaluations is expensive (latency + quota). By hashing the concatenated job description + resume text, TalentMind can detect byte-for-byte identical submissions and return the cached result instantly — ensuring a recruiter who accidentally re-uploads a resume doesn't waste quota or see different scores.

### Why `temperature: 0`?
Hiring is consequential. A recruiter should be able to share a report with a colleague and know the scores are stable and reproducible. Zero temperature eliminates stochastic variation.

### Why Supabase instead of localStorage?
Supabase provides persistent cloud storage that works across devices and sessions. Unlike localStorage, data is accessible from any device and won't be lost if the browser cache is cleared. Row Level Security ensures users can only access their own data.

---

## Running Locally

### Prerequisites
- Node.js 18+ installed
- A Supabase project (free tier works)
- A Google Gemini API key

### Setup Steps

```bash
# 1. Clone the repo
git clone https://github.com/piyushmarkandey1-ui/talentmind-ai-build.git
cd talentmind-ai-build

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Copy example.env to .env and fill in your values
cp example.env .env

# 4. Set up Supabase
# Create a new project at https://supabase.com/dashboard
# Run the migration in supabase/migrations/001_initial_schema.sql
# Disable email confirmation in Supabase Dashboard → Authentication → Providers → Email

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Rate Limiting (optional - if using Upstash Redis)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Security
SESSION_SECRET=your_random_secret_key
```

Get a free Gemini API key at: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Important: Fix for Deployed Database

If you have already deployed the migration and are experiencing audit log issues, run this SQL command in your Supabase Dashboard SQL Editor:

```sql
ALTER FUNCTION public.log_audit_changes() SECURITY DEFINER;
```

This ensures the audit log function has the correct permissions to write to the audit_logs table.

---

## Project Structure

```
app/
  api/analyze/route.ts       — Gemini API call, SHA-256 caching, model fallback
  auth/callback/route.ts     — OAuth callback handler
  workspace/page.tsx         — Main recruiter workspace orchestrator
  layout.tsx                 — Root layout with theme provider
  globals.css                — Dark glassmorphism + Light neumorphic design tokens

components/
  auth/                      — Authentication components
    auth-modal.tsx           — Login/signup modal
  site/                      — Landing page
    hero.tsx                 — Hero section
    features.tsx             — Features section
    navbar.tsx               — Navigation with auth state
    theme-provider.tsx      — Theme context provider
  workspace/                 — App UI
    candidate-card.tsx       — Individual candidate result card
    results-dashboard.tsx    — Ranked results display
    history-panel.tsx        — Session history viewer
    stepper.tsx              — Step progress indicator
    job-step.tsx             — Job description input
    resume-step.tsx          — Resume upload
    review-step.tsx          — Review before analysis

lib/
  supabase/
    client.ts                — Supabase client (browser)
    admin.ts                 — Supabase admin client (server)
    auth.ts                  — Auth helpers + profile caching
    recruiter-store.ts       — Database operations for profiles/sessions
  analysis-schema.ts         — TypeScript types for all AI output
  generate-report.ts         — HTML report generator (print-safe CSS)
  workspace.ts              — Job description type

supabase/
  migrations/
    001_initial_schema.sql   — Database schema and RLS policies
```

---

## 🚀 Try These to Test the App

1. **Open the app** at [talentmind-ai-build.vercel.app](https://talentmind-ai-build.vercel.app) — toggle between Dark and Light themes using the ☀️/🌙 button in the navbar
2. **Click "Sign in"** → create an account (email + password)
3. **Paste a job description** or use one of the quick-start templates
4. **Upload 2–3 resumes** (PDF or DOCX) — watch the live streaming evaluation
5. **Explore the ranked shortlist** — click each candidate to see their full 11-dimension breakdown
6. **Add recruiter feedback** — mark a candidate as Selected / Hold / Rejected and add private notes
7. **Export a PDF report** — see the full print-optimized report with your notes included
8. **Check history panel** — view and restore past analysis sessions
9. **Test on mobile** — open on a mobile device to see responsive design
10. **Sign out** — test authentication flow

---

## Deployment

### Vercel Deployment

The app is configured for Vercel deployment:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Environment variables needed in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `SESSION_SECRET`

---

## Security Features

- **Row Level Security (RLS)** on all Supabase tables
- **Service role key** only used in server-side code
- **Rate limiting** to prevent API abuse
- **Audit logging** for all data changes
- **Session persistence** with automatic token refresh
- **Input validation** on all file uploads
- **Session hijacking mitigation** via secure cookies
