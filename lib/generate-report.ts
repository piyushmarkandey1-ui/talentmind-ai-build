import type { CandidateAnalysis } from '@/lib/analysis-schema'
import { DIMENSIONS, RECOMMENDATION_META } from '@/lib/analysis-schema'

function scoreBar(score: number): string {
  const color =
    score >= 85 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444'
  return `
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="flex:1;height:6px;background:#1f1f2e;border-radius:99px;overflow:hidden;">
        <div style="width:${score}%;height:100%;background:${color};border-radius:99px;"></div>
      </div>
      <span style="font-size:12px;font-weight:700;color:#fff;min-width:28px;text-align:right;">${score}</span>
    </div>`
}

function tag(text: string, color: string, bg: string, border: string): string {
  return `<span style="display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600;color:${color};background:${bg};border:1px solid ${border};margin:2px 3px 2px 0;">${text}</span>`
}

export function generateReportHTML(
  analysis: CandidateAnalysis,
  fileName: string,
  jobTitle: string
): string {
  const meta = RECOMMENDATION_META[analysis.recommendation]
  const toneMap: Record<string, { color: string; bg: string; border: string }> = {
    emerald: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
    blue: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
    amber: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
    rose: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
  }
  const tone = toneMap[meta.tone]
  const date = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>TalentMind Report — ${analysis.candidateName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: #050505;
    color: #fff;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { max-width: 820px; margin: 0 auto; padding: 48px 40px; }
  
  /* Header */
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; padding-bottom:28px; border-bottom:1px solid rgba(255,255,255,0.1); }
  .brand { display:flex; align-items:center; gap:10px; }
  .brand-icon { width:36px; height:36px; background:linear-gradient(135deg,#3b82f6,#8b5cf6); border-radius:10px; display:flex; align-items:center; justify-content:center; }
  .brand-name { font-size:17px; font-weight:700; color:#fff; letter-spacing:-0.3px; }
  .brand-sub { font-size:11px; color:rgba(255,255,255,0.4); margin-top:1px; }
  .meta { text-align:right; font-size:12px; color:rgba(255,255,255,0.45); line-height:1.7; }
  
  /* Hero */
  .hero { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:28px 32px; margin-bottom:28px; display:flex; justify-content:space-between; align-items:center; gap:20px; }
  .candidate-name { font-size:26px; font-weight:800; color:#fff; letter-spacing:-0.5px; margin-bottom:4px; }
  .candidate-headline { font-size:14px; color:rgba(255,255,255,0.55); }
  .score-block { text-align:center; }
  .score-num { font-size:48px; font-weight:800; color:#fff; line-height:1; letter-spacing:-2px; }
  .score-label { font-size:10px; text-transform:uppercase; letter-spacing:1.5px; color:rgba(255,255,255,0.4); margin-top:4px; }
  .rec-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 14px; border-radius:99px; font-size:12px; font-weight:700; border:1px solid; margin-top:10px; }
  
  /* Summary */
  .summary { font-size:14px; line-height:1.75; color:rgba(255,255,255,0.75); padding:16px 20px; border-left:3px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.02); border-radius:0 12px 12px 0; margin-bottom:28px; font-style:italic; }
  
  /* Section */
  .section-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:rgba(255,255,255,0.35); margin-bottom:14px; }
  .section { margin-bottom:28px; }
  
  /* Dimensions grid */
  .dim-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .dim-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:14px 16px; }
  .dim-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
  .dim-label { font-size:12px; font-weight:600; color:rgba(255,255,255,0.8); }
  .dim-rationale { font-size:11px; color:rgba(255,255,255,0.4); margin-top:6px; line-height:1.55; }
  
  /* Two-col layout */
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:28px; }
  
  /* Boxes */
  .box { border-radius:16px; padding:18px 20px; }
  .box-emerald { background:rgba(16,185,129,0.07); border:1px solid rgba(16,185,129,0.15); }
  .box-rose    { background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.15); }
  .box-blue    { background:rgba(59,130,246,0.07); border:1px solid rgba(59,130,246,0.15); }
  .box-neutral { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); }
  .box-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:12px; }
  .box-title-emerald { color:#10b981; }
  .box-title-rose    { color:#ef4444; }
  .box-title-blue    { color:#3b82f6; }
  .box-title-neutral { color:rgba(255,255,255,0.4); }
  
  ul.list { list-style:none; display:flex; flex-direction:column; gap:7px; }
  ul.list li { font-size:12px; line-height:1.55; color:rgba(255,255,255,0.75); display:flex; align-items:flex-start; gap:8px; }
  ul.list li::before { content:"▸"; flex-shrink:0; margin-top:1px; }
  ul.list.emerald li::before { color:#10b981; }
  ul.list.rose    li::before { color:#ef4444; }
  
  .q-item { display:flex; gap:10px; align-items:flex-start; padding:10px 12px; border-radius:10px; background:rgba(0,0,0,0.25); border:1px solid rgba(59,130,246,0.12); margin-bottom:8px; }
  .q-num  { font-size:10px; font-weight:700; color:#3b82f6; min-width:16px; margin-top:1px; }
  .q-text { font-size:12px; color:rgba(255,255,255,0.75); line-height:1.55; }
  
  /* Footer */
  .footer { margin-top:48px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center; }
  .footer-note { font-size:10px; color:rgba(255,255,255,0.25); line-height:1.6; }
  .footer-brand { font-size:10px; font-weight:600; color:rgba(255,255,255,0.2); }
  
  @media print {
    body { background:#050505 !important; }
    .page { padding:32px 36px; }
    .hero, .dim-card, .box, .q-item { break-inside: avoid; }
    .section { break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div class="brand-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2L13 7H17L14 11L15.5 16L10 13L4.5 16L6 11L3 7H7L10 2Z" fill="white" fill-opacity="0.9"/>
        </svg>
      </div>
      <div>
        <div class="brand-name">TalentMind AI</div>
        <div class="brand-sub">AI Hiring Operating System</div>
      </div>
    </div>
    <div class="meta">
      <div><strong style="color:rgba(255,255,255,0.6)">Role</strong> ${jobTitle || 'Not specified'}</div>
      <div><strong style="color:rgba(255,255,255,0.6)">Resume</strong> ${fileName}</div>
      <div><strong style="color:rgba(255,255,255,0.6)">Generated</strong> ${date}</div>
    </div>
  </div>

  <!-- Hero -->
  <div class="hero">
    <div>
      <div class="candidate-name">${analysis.candidateName}</div>
      <div class="candidate-headline">${analysis.headline}</div>
      <div>
        <span class="rec-badge" style="color:${tone.color};background:${tone.bg};border-color:${tone.border};">
          ${meta.label}
        </span>
      </div>
    </div>
    <div class="score-block">
      <div class="score-num">${analysis.overallScore}</div>
      <div class="score-label">Overall Fit Score</div>
    </div>
  </div>

  <!-- Summary -->
  <div class="summary">"${analysis.summary}"</div>

  <!-- Dimensions -->
  <div class="section">
    <div class="section-title">Evaluation Breakdown</div>
    <div class="dim-grid">
      ${DIMENSIONS.map((dim) => {
        const val = analysis.dimensions[dim.key]
        return `
        <div class="dim-card">
          <div class="dim-header">
            <span class="dim-label">${dim.label}</span>
          </div>
          ${scoreBar(val.score)}
          <div class="dim-rationale">${val.rationale}</div>
        </div>`
      }).join('')}
    </div>
  </div>

  <!-- Strengths & Concerns -->
  <div class="two-col">
    <div class="box box-emerald">
      <div class="box-title box-title-emerald">✓ Key Strengths</div>
      <ul class="list emerald">
        ${analysis.strengths.map((s) => `<li>${s}</li>`).join('')}
      </ul>
    </div>
    <div class="box box-rose">
      <div class="box-title box-title-rose">⚠ Concerns & Gaps</div>
      <ul class="list rose">
        ${analysis.concerns.map((c) => `<li>${c}</li>`).join('')}
      </ul>
    </div>
  </div>

  <!-- Skills -->
  <div class="two-col">
    <div class="box box-neutral">
      <div class="box-title box-title-neutral">✓ Verified Skills</div>
      <div>${analysis.matchedSkills.map((s) => tag(s, '#10b981', 'rgba(16,185,129,0.1)', 'rgba(16,185,129,0.25)')).join('')}</div>
    </div>
    <div class="box box-neutral">
      <div class="box-title box-title-neutral">✗ Missing Skills</div>
      <div>${analysis.missingSkills.length > 0
        ? analysis.missingSkills.map((s) => tag(s, '#ef4444', 'rgba(239,68,68,0.1)', 'rgba(239,68,68,0.25)')).join('')
        : '<span style="font-size:12px;color:rgba(255,255,255,0.3);">None identified</span>'}</div>
    </div>
  </div>

  <!-- Interview Guide -->
  ${analysis.suggestedQuestions.length > 0 ? `
  <div class="section">
    <div class="section-title">💬 Interview Guide</div>
    <div class="box box-blue">
      ${analysis.suggestedQuestions.map((q, i) => `
        <div class="q-item">
          <span class="q-num">Q${i + 1}</span>
          <span class="q-text">${q}</span>
        </div>`).join('')}
    </div>
  </div>` : ''}

  <!-- Footer -->
  <div class="footer">
    <div class="footer-note">
      This report was generated by TalentMind AI using Google Gemini.<br />
      AI-assisted analysis is advisory only. Final hiring decisions remain with the recruiter.
    </div>
    <div class="footer-brand">TalentMind AI · talentmind.ai</div>
  </div>

</div>
</body>
</html>`
}
