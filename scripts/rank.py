import json
import gzip
import csv
import os
from datetime import datetime

# Path to candidates file (can be .jsonl or .jsonl.gz)
DATASET_PATH = r"d:\Hackathons\India runs\talentmind-ai-build\[PUB] India_runs_data_and_ai_challenge\[PUB] India_runs_data_and_ai_challenge\India_runs_data_and_ai_challenge\candidates.jsonl"
OUT_CSV = "submission.csv"

CONSULTING_FIRMS = {"tcs", "infosys", "wipro", "accenture", "cognizant", "capgemini", "ibm", "deloitte"}
VECTOR_DBS = {"pinecone", "weaviate", "qdrant", "milvus", "opensearch", "elasticsearch", "faiss"}
EMBEDDINGS = {"embeddings", "sentence-transformers", "bge", "e5", "retrieval", "rag"}
EVAL_METRICS = {"ndcg", "mrr", "map", "a/b test", "correlation", "evaluation framework"}
BAD_DOMAINS = {"computer vision", "speech", "robotics"}
FRAMEWORKS = {"langchain", "llamaindex"}

def parse_date(date_str):
    if not date_str: return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except:
        return None

def is_honeypot(c):
    # Check for "expert" skills with 0 months experience
    expert_zero = 0
    for skill in c.get("skills", []):
        if skill.get("proficiency") == "expert" and skill.get("duration_months", 1) == 0:
            expert_zero += 1
    if expert_zero >= 3:
        return True
            
    # Check if they have an obviously non-engineering title but lots of AI skills
    title = c.get("profile", {}).get("current_title", "").lower()
    bad_titles = ["marketing", "sales", "hr", "recruiter", "manager", "accountant"]
    if any(bt in title for bt in bad_titles) and not ("engineering manager" in title or "product manager" in title):
        # Only honeypot if they claim to have AI skills
        text = str(c.get("skills", [])).lower()
        if "python" in text or "machine learning" in text:
            return True
            
    return False

def score_candidate(c):
    if is_honeypot(c):
        return -999, "Honeypot profile detected."
        
    score = 0.0
    reasoning_parts = []
    
    profile = c.get("profile", {})
    signals = c.get("redrob_signals", {})
    history = c.get("career_history", [])
    skills = c.get("skills", [])
    
    yoe = profile.get("years_of_experience", 0)
    
    # 1. Experience (Target 5-9)
    if 5 <= yoe <= 9:
        score += 20
    elif 4 <= yoe <= 12:
        score += 10
        
    # 2. Behavioral Signals
    last_active = parse_date(signals.get("last_active_date"))
    if last_active:
        days_inactive = (datetime(2024, 1, 1) - last_active).days # Assume current year is around data collection
        if days_inactive > 180:
            score -= 30
            reasoning_parts.append("Inactive for >6 months.")
            
    if signals.get("recruiter_response_rate", 1.0) < 0.2:
        score -= 20
        reasoning_parts.append("Very low recruiter response rate.")
        
    notice_period = signals.get("notice_period_days", 90)
    if notice_period <= 30:
        score += 5
        
    # 3. Text Matching for specific tech & product company
    text_corpus = (
        profile.get("headline", "") + " " + 
        profile.get("summary", "") + " " + 
        " ".join([h.get("description", "") + " " + h.get("title", "") for h in history]) + " " +
        " ".join([s.get("name", "") for s in skills])
    ).lower()
    
    has_vector = any(v in text_corpus for v in VECTOR_DBS)
    has_embed = any(e in text_corpus for e in EMBEDDINGS)
    has_eval = any(m in text_corpus for m in EVAL_METRICS)
    has_python = "python" in text_corpus
    has_recsys = "recommendation system" in text_corpus or "search ranking" in text_corpus
    
    if has_vector: score += 15
    if has_embed: score += 15
    if has_eval: score += 10
    if has_python: score += 5
    if has_recsys: score += 20
    
    # 4. Filter consulting
    latest_company = profile.get("current_company", "").lower()
    if any(cf in latest_company for cf in CONSULTING_FIRMS):
        score -= 15
        reasoning_parts.append("Currently at a pure services/consulting firm.")
        
    title = profile.get("current_title", "").lower()
    if "engineer" not in title and "data" not in title and "scientist" not in title and "developer" not in title:
        score -= 20
        reasoning_parts.append("Title does not suggest an engineering role.")
        
    # Build a reasonable sounding reasoning
    if has_recsys:
        reasoning_parts.append("Has direct experience building recommendation/ranking systems.")
    if has_vector and has_embed:
        reasoning_parts.append("Strong production experience with vector databases and embeddings.")
    elif has_embed:
        reasoning_parts.append("Has relevant embeddings/retrieval experience.")
        
    if 5 <= yoe <= 9:
        reasoning_parts.append(f"{yoe} years of experience fits the target band.")
        
    reasoning = " ".join(reasoning_parts)
    if not reasoning:
        reasoning = f"Generic profile with {yoe} YOE, limited direct relevance to ranking/IR."
        
    return score, reasoning

def main():
    print("Reading dataset...")
    candidates = []
    
    # Check if gzip or raw
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
    # Sort descending by score, ascending by candidate_id for ties
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
