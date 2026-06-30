# TalentMind AI — The AI Hiring Operating System

> **Built for India Runs Data & AI Challenge 2026**  
> Turning stacks of resumes into a ranked, explainable shortlist in minutes — powered by Google Gemini.

---

## 🔗 Live Demo

**[https://talentmind-ai-build.vercel.app](https://talentmind-ai-build.vercel.app)**

**GitHub:** [https://github.com/piyushmarkandey1-ui/talentmind-ai-build](https://github.com/piyushmarkandey1-ui/talentmind-ai-build)

---

## What is TalentMind AI?

TalentMind AI is a production-grade AI recruiting assistant that helps recruiters evaluate candidates semantically — not just by keyword matching. A recruiter pastes a job description, uploads one or more resumes (PDF/DOCX), and receives a ranked shortlist with deep, evidence-backed analysis for each candidate.

The tool is designed to **augment human judgment**, not replace it. Every recommendation comes with a detailed explanation so the recruiter always understands *why* a candidate ranked where they did.

---

## Core Features

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

### 👤 Recruiter Identity & Session System
- Recruiters enter their **name, email, company, and designation** (email/company/designation are optional)
- All candidate evaluations are **automatically saved** to a session in `localStorage`, linked to the recruiter's profile
- A **History Panel** lets recruiters restore any past session with a single click — all results, feedback, and notes are fully preserved
- Multiple recruiters can use the same device: **Sign out / Switch user** clears the active profile and prompts a new setup

### 📝 Recruiter Feedback & Decision Tracking
- On every candidate card, the recruiter can mark a final decision: **Selected ✓ / Hold ⏸ / Rejected ✗**
- A private **notes field** lets the recruiter write anything about the candidate
- Feedback is **auto-saved in real time** to the session — no save button needed
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
| **File Parsing** | `pdf-parse-fork` (PDF), `mammoth` (DOCX) |
| **Content Hashing** | Web Crypto API — SHA-256 |
| **Storage** | Browser `localStorage` (recruiter profiles + sessions) |
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

### Why localStorage instead of a backend database?
This keeps the app **zero-infrastructure** — no auth, no database, no backend cost. Recruiter data never leaves the device, which is a genuine privacy benefit for sensitive candidate information.

---

## Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/piyushmarkandey1-ui/talentmind-ai-build.git
cd talentmind-ai-build

# 2. Install dependencies
npm install

# 3. Set your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Get a free Gemini API key at: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## Project Structure

```
app/
  api/analyze/route.ts   — Gemini API call, SHA-256 caching, model fallback
  workspace/page.tsx     — Main recruiter workspace orchestrator
  globals.css            — Dark glassmorphism + Light neumorphic design tokens

components/
  site/                  — Landing page (Hero, Features, FAQ, CTA, Footer, Navbar)
  workspace/             — App UI (CandidateCard, ResultsDashboard, RecruiterModal, HistoryPanel)

lib/
  analysis-schema.ts     — TypeScript types for all AI output
  generate-report.ts     — HTML report generator (print-safe CSS)
  recruiter-store.ts     — localStorage read/write helpers
  workspace.ts           — Job description type
```

---

## What Judges Should See

1. **Landing page** at [talentmind-ai-build.vercel.app](https://talentmind-ai-build.vercel.app) — toggle between Dark and Light themes using the ☀️/🌙 button in the navbar
2. **Click "Start free"** → set up a recruiter profile (only name is required)
3. **Paste a job description** or use one of the quick-start templates
4. **Upload 2–3 resumes** (PDF or DOCX) — watch the live streaming evaluation
5. **Explore the ranked shortlist** — click each candidate to see their full 11-dimension breakdown
6. **Add recruiter feedback** — mark a candidate as Selected/Hold/Rejected and add private notes
7. **Export a PDF report** — see the full print-optimized report with recruiter notes included
8. **Re-upload the same resume** — observe that the score is identical (deterministic AI + caching)
9. **Switch user** via the profile menu — demonstrate multi-recruiter session isolation

---

*Built with ❤️ by Piyush Markandey*
