import json
import gzip
import csv
import os
from datetime import datetime

DATASET_PATH = r"d:\Hackathons\India runs\talentmind-ai-build\[PUB] India_runs_data_and_ai_challenge\[PUB] India_runs_data_and_ai_challenge\India_runs_data_and_ai_challenge\candidates.jsonl"
OUT_CSV = "submission.csv"

CONSULTING_FIRMS = {"tcs", "infosys", "wipro", "accenture", "cognizant", "capgemini", "ibm", "deloitte"}
VECTOR_DBS = {"pinecone", "weaviate", "qdrant", "milvus", "opensearch", "elasticsearch", "faiss"}
EMBEDDINGS = {"embeddings", "sentence-transformers", "bge", "e5", "retrieval", "rag"}
EVAL_METRICS = {"ndcg", "mrr", "map", "a/b test", "correlation", "evaluation framework"}
ACADEMIC_TERMS = {"university", "academic", "research lab", "institute of technology"}

def parse_date(date_str):
    if not date_str: return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except:
        return None

def is_honeypot(c):
    expert_zero = 0
    for skill in c.get("skills", []):
        if skill.get("proficiency") == "expert" and skill.get("duration_months", 1) == 0:
            expert_zero += 1
    if expert_zero >= 3:
        return True
            
    title = c.get("profile", {}).get("current_title", "").lower()
    bad_titles = ["marketing", "sales", "hr", "recruiter", "manager", "accountant"]
    if any(bt in title for bt in bad_titles) and not ("engineering manager" in title or "product manager" in title):
        text = str(c.get("skills", [])).lower()
        if "python" in text or "machine learning" in text:
            return True
    return False

def score_candidate(c):
    if is_honeypot(c):
        return -999, "Disqualified: Profile identified as a honeypot."
        
    score = 0.0
    reasoning_parts = []
    
    profile = c.get("profile", {})
    signals = c.get("redrob_signals", {})
    history = c.get("career_history", [])
    skills = c.get("skills", [])
    
    yoe = profile.get("years_of_experience", 0)
    
    # --- 1. Target Experience (5-9 years) ---
    if 5 <= yoe <= 9:
        score += 30
        reasoning_parts.append(f"Ideal {yoe} YOE.")
    elif 4 <= yoe <= 12:
        score += 15
        
    # --- 2. Advanced Skill Proficiency & Duration ---
    # Calculate exact months of experience in key areas
    vector_db_months = 0
    embed_months = 0
    
    for s in skills:
        name = s.get("name", "").lower()
        dur = s.get("duration_months", 0)
        prof = s.get("proficiency", "beginner")
        
        prof_multiplier = {"beginner": 0.5, "intermediate": 1.0, "advanced": 1.5, "expert": 2.0}.get(prof, 1.0)
        
        if any(v in name for v in VECTOR_DBS):
            vector_db_months += dur
            score += 2 * prof_multiplier
        if any(e in name for e in EMBEDDINGS):
            embed_months += dur
            score += 2 * prof_multiplier
            
    if vector_db_months > 0 or embed_months > 0:
        score += min((vector_db_months + embed_months) / 2, 20) # Cap duration bonus at 20 pts
        reasoning_parts.append(f"{vector_db_months + embed_months}mo specialized ML/IR experience.")
        
    # --- 3. "Title-Chaser" Penalty ---
    if len(history) >= 3:
        avg_tenure = sum(h.get("duration_months", 0) for h in history) / len(history)
        if avg_tenure < 18:
            score -= 40
            reasoning_parts.append(f"Job hopper (avg tenure {round(avg_tenure,1)}mo).")
            
    # --- 4. "Pure Research" Penalty ---
    latest_company = profile.get("current_company", "").lower()
    title = profile.get("current_title", "").lower()
    
    if any(ac in latest_company for ac in ACADEMIC_TERMS):
        if "engineer" not in title and "developer" not in title:
            score -= 30
            reasoning_parts.append("Pure research/academic background.")
            
    # Filter consulting
    if any(cf in latest_company for cf in CONSULTING_FIRMS):
        score -= 20
        reasoning_parts.append("Currently at a pure services firm.")
        
    # Title enforcement
    if "engineer" not in title and "data" not in title and "scientist" not in title and "developer" not in title:
        score -= 25
        
    # --- 5. Textual Matching for unlisted skills ---
    text_corpus = (
        profile.get("headline", "") + " " + 
        profile.get("summary", "") + " " + 
        " ".join([h.get("description", "") + " " + h.get("title", "") for h in history])
    ).lower()
    
    if "recommendation system" in text_corpus or "search ranking" in text_corpus:
        score += 25
        reasoning_parts.append("Built recommendation/ranking systems.")
    if any(m in text_corpus for m in EVAL_METRICS):
        score += 15
        
    # --- 6. Behavioral & Redrob Signals ---
    last_active = parse_date(signals.get("last_active_date"))
    if last_active:
        days_inactive = (datetime(2024, 1, 1) - last_active).days
        if days_inactive > 180:
            score -= 30
            reasoning_parts.append("Inactive >6mo.")
            
    if signals.get("recruiter_response_rate", 1.0) < 0.2:
        score -= 20
        
    gh_score = signals.get("github_activity_score", -1)
    if gh_score > 50:
        score += (gh_score / 10)
        reasoning_parts.append(f"High GitHub activity ({gh_score}).")
        
    # Profile completeness as a minor tiebreaker
    score += signals.get("profile_completeness_score", 0) * 0.01

    if not reasoning_parts:
        reasoning_parts.append(f"General profile with {yoe} YOE.")
        
    reasoning = " ".join(reasoning_parts)
    # Ensure it's not too long and looks clean
    if len(reasoning) > 150:
        reasoning = reasoning[:147] + "..."
        
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
    # Deterministic tie-breaking
    scored_candidates.sort(key=lambda x: (-x["score"], x["candidate_id"]))
    
    top_100 = scored_candidates[:100]
    
    print("Writing submission.csv...")
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as outf:
        writer = csv.writer(outf)
        writer.writerow(["candidate_id", "rank", "score", "reasoning"])
        for i, c in enumerate(top_100):
            writer.writerow([c["candidate_id"], i+1, round(c["score"], 3), c["reasoning"]])
            
    print("Done! Generated submission.csv")

if __name__ == "__main__":
    main()
