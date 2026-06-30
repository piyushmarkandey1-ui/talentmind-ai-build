import json
import gzip
import csv
import os
import math
from datetime import datetime

DATASET_PATH = r"d:\Hackathons\India runs\talentmind-ai-build\[PUB] India_runs_data_and_ai_challenge\[PUB] India_runs_data_and_ai_challenge\India_runs_data_and_ai_challenge\candidates.jsonl"
OUT_CSV = "submission.csv"

CONSULTING_FIRMS = {"tcs", "infosys", "wipro", "accenture", "cognizant", "capgemini", "ibm", "deloitte"}
ACADEMIC_TERMS = {"university", "academic", "research lab", "institute of technology"}
VECTOR_DBS = {"pinecone", "weaviate", "qdrant", "milvus", "opensearch", "elasticsearch", "faiss"}
EMBEDDINGS = {"embeddings", "sentence-transformers", "bge", "e5", "retrieval", "rag"}
CORE_ML = {"pytorch", "tensorflow", "scikit-learn", "xgboost", "machine learning", "nlp", "lora", "qlora", "peft"}
FRAMEWORKS = {"langchain", "llamaindex"}
EVAL_METRICS = {"ndcg", "mrr", "map", "a/b test", "correlation", "evaluation framework"}

def parse_date(date_str):
    if not date_str: return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except:
        return None

def calculate_log_score(value, base=10, max_cap=20):
    if value <= 0: return 0
    return min(math.log(value + 1, base) * 5, max_cap)

def is_honeypot(c, profile, history, skills):
    # 1. Zero Experience Experts
    expert_zero = 0
    for s in skills:
        if s.get("proficiency") == "expert" and s.get("duration_months", 1) == 0:
            expert_zero += 1
    if expert_zero >= 3:
        return "Disqualified: Claimed multiple 'Expert' skills with 0 months experience."

    # 2. Fake Engineering Title
    title = profile.get("current_title", "").lower()
    bad_titles = ["marketing", "sales", "hr", "recruiter", "manager", "accountant"]
    if any(bt in title for bt in bad_titles) and not ("engineering manager" in title or "product manager" in title):
        text = str(skills).lower()
        if "python" in text or "machine learning" in text:
            return "Disqualified: Non-engineering primary role claiming deep ML skills."

    # 3. Fake YOE Trap
    claimed_yoe = profile.get("years_of_experience", 0)
    eng_months = 0
    for h in history:
        t = h.get("title", "").lower()
        if "engineer" in t or "developer" in t or "scientist" in t or "researcher" in t or "architect" in t:
            eng_months += h.get("duration_months", 0)
    
    # If claimed YOE is e.g. 10 (120 mo) but actual eng months is < 24 mo
    if claimed_yoe > 3 and eng_months < (claimed_yoe * 12 * 0.3):
        return "Disqualified: Claimed YOE drastically exceeds actual engineering work history."

    # 4. Framework Enthusiast Trap
    framework_months = sum(s.get("duration_months", 0) for s in skills if s.get("name", "").lower() in FRAMEWORKS)
    core_ml_months = sum(s.get("duration_months", 0) for s in skills if s.get("name", "").lower() in CORE_ML or s.get("name", "").lower() in VECTOR_DBS)
    
    if framework_months > 12 and core_ml_months == 0:
        return "Disqualified: High framework usage (LangChain/LlamaIndex) with zero Core ML or Vector DB foundation."

    return False

def score_candidate(c):
    profile = c.get("profile", {})
    signals = c.get("redrob_signals", {})
    history = c.get("career_history", [])
    skills = c.get("skills", [])
    education = c.get("education", [])

    hp_reason = is_honeypot(c, profile, history, skills)
    if hp_reason:
        return -999, hp_reason
        
    score = 0.0
    reasoning_parts = []
    
    # --- 1. Experience & Trajectory (Max 40 pts) ---
    yoe = profile.get("years_of_experience", 0)
    if 5 <= yoe <= 9:
        score += 30
        reasoning_parts.append(f"Ideal {yoe} YOE.")
    elif 4 <= yoe <= 12:
        score += 15
        
    if len(history) >= 3:
        avg_tenure = sum(h.get("duration_months", 0) for h in history) / len(history)
        if avg_tenure < 18:
            score -= 50
            reasoning_parts.append(f"Job hopper (avg tenure {round(avg_tenure,1)}mo).")
        elif avg_tenure > 36:
            score += 10
            reasoning_parts.append("Exceptional loyalty/tenure.")

    latest_company = profile.get("current_company", "").lower()
    title = profile.get("current_title", "").lower()

    if any(ac in latest_company for ac in ACADEMIC_TERMS):
        if "engineer" not in title and "developer" not in title:
            score -= 40
            reasoning_parts.append("Pure research/academic background.")
            
    if any(cf in latest_company for cf in CONSULTING_FIRMS):
        score -= 25
        reasoning_parts.append("Currently at a pure services firm.")

    co_size = profile.get("current_company_size", "")
    if co_size in ["51-200", "201-500"]:
        score += 5
    elif co_size in ["5001-10000", "10001+"]:
        score -= 5

    if "pune" in str(profile.get("location", "")).lower() or "noida" in str(profile.get("location", "")).lower():
        score += 5

    # --- 2. Education Tier (Max 15 pts) ---
    has_top_tier = False
    for e in education:
        tier = e.get("tier", "")
        if tier == "tier_1":
            score += 10
            has_top_tier = True
        elif tier == "tier_2":
            score += 5
        
        deg = str(e.get("degree", "")).lower()
        if "master" in deg or "ms" in deg or "m.s" in deg or "phd" in deg or "ph.d" in deg:
            score += 5

    if has_top_tier:
        reasoning_parts.append("Tier-1 education.")

    # --- 3. Deep Skill Profiling (Max 50 pts) ---
    vector_score = 0
    embed_score = 0
    core_ml_score = 0

    for s in skills:
        name = s.get("name", "").lower()
        dur = s.get("duration_months", 0)
        prof = s.get("proficiency", "beginner")
        prof_multiplier = {"beginner": 0.2, "intermediate": 0.8, "advanced": 1.5, "expert": 2.5}.get(prof, 1.0)
        
        pts = dur * prof_multiplier
        if any(v in name for v in VECTOR_DBS): vector_score += pts
        if any(e in name for e in EMBEDDINGS): embed_score += pts
        if any(m in name for m in CORE_ML): core_ml_score += pts

    v_log = calculate_log_score(vector_score, base=2, max_cap=20)
    e_log = calculate_log_score(embed_score, base=2, max_cap=20)
    m_log = calculate_log_score(core_ml_score, base=2, max_cap=10)
    
    score += v_log + e_log + m_log
    
    if v_log > 10 and e_log > 10:
        reasoning_parts.append("Deep, production-grade Vector DB & Embeddings expertise.")
    elif m_log > 5:
        reasoning_parts.append("Strong Core ML foundation.")

    # --- 4. Deep Career Description Matching (Max 25 pts) ---
    text_corpus = (
        profile.get("headline", "") + " " + 
        profile.get("summary", "") + " " + 
        " ".join([h.get("description", "") + " " + h.get("title", "") for h in history])
    ).lower()
    
    if "recommendation system" in text_corpus or "search ranking" in text_corpus or "retrieval system" in text_corpus:
        score += 25
        reasoning_parts.append("Built real-world recommendation/ranking systems.")
    if any(m in text_corpus for m in EVAL_METRICS):
        score += 15

    # --- 5. Redrob Behavioral Signals (Max 40 pts) ---
    last_active = parse_date(signals.get("last_active_date"))
    if last_active:
        days_inactive = (datetime(2024, 1, 1) - last_active).days
        if days_inactive > 180:
            score -= 50
            reasoning_parts.append("Inactive >6mo.")
            
    if signals.get("recruiter_response_rate", 1.0) < 0.2:
        score -= 30
    elif signals.get("recruiter_response_rate", 0.0) > 0.8:
        score += 5
        
    gh_score = signals.get("github_activity_score", -1)
    if gh_score > 60:
        score += 15
        reasoning_parts.append(f"Exceptional open-source/GitHub presence ({gh_score}/100).")
        
    interview_rate = signals.get("interview_completion_rate", 1.0)
    if interview_rate < 0.5:
        score -= 20
        
    searches = signals.get("search_appearance_30d", 0)
    saves = signals.get("saved_by_recruiters_30d", 0)
    score += calculate_log_score(searches + saves * 5, base=10, max_cap=10)

    assessments = signals.get("skill_assessment_scores", {})
    if assessments:
        avg_assessment = sum(assessments.values()) / len(assessments)
        if avg_assessment > 80:
            score += 5
            
    notice = signals.get("notice_period_days", 90)
    if notice <= 30:
        score += 5
    elif notice >= 90:
        score -= 10

    # Profile completeness as micro tiebreaker
    score += signals.get("profile_completeness_score", 0) * 0.001

    if not reasoning_parts:
        reasoning_parts.append(f"Qualified engineering profile.")
        
    reasoning = " ".join(reasoning_parts)
    if len(reasoning) > 200:
        reasoning = reasoning[:197] + "..."
        
    return score, reasoning

def main():
    print("Reading dataset...")
    candidates = []
    
    if os.path.exists(DATASET_PATH + ".gz"):
        f = gzip.open(DATASET_PATH + ".gz", "rt", encoding="utf-8")
    else:
        f = open(DATASET_PATH, "r", encoding="utf-8")
        
    count = 0
    scored_candidates = []
    
    for line in f:
        line = line.strip()
        if not line: continue
        
        c = json.loads(line)
        score, reasoning = score_candidate(c)
        
        scored_candidates.append({
            "candidate_id": c["candidate_id"],
            "score": score,
            "reasoning": reasoning
        })
        
        count += 1
        if count % 10000 == 0:
            print(f"Processed {count} candidates...")
            
    f.close()
    
    print("Sorting candidates...")
    # Round scores BEFORE sorting to ensure tie-breaking matches the final CSV perfectly
    for c in scored_candidates:
        c["score"] = round(c["score"], 3)
        
    scored_candidates.sort(key=lambda x: (-x["score"], x["candidate_id"]))
    
    top_100 = scored_candidates[:100]
    
    print("Writing submission.csv...")
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as outf:
        writer = csv.writer(outf)
        writer.writerow(["candidate_id", "rank", "score", "reasoning"])
        for i, c in enumerate(top_100):
            writer.writerow([c["candidate_id"], i+1, c["score"], c["reasoning"]])
            
    print("Done! Generated submission.csv")

if __name__ == "__main__":
    main()
