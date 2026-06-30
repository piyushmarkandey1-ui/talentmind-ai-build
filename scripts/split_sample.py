import json
import os

def main():
    source_file = r"d:\Hackathons\India runs\talentmind-ai-build\[PUB] India_runs_data_and_ai_challenge\[PUB] India_runs_data_and_ai_challenge\India_runs_data_and_ai_challenge\sample_candidates.json"
    target_dir = r"d:\Hackathons\India runs\talentmind-ai-build\sample_resumes"
    
    os.makedirs(target_dir, exist_ok=True)
    
    with open(source_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for c in data:
        cid = c.get("candidate_id")
        out_path = os.path.join(target_dir, f"{cid}.json")
        with open(out_path, 'w', encoding='utf-8') as out:
            json.dump(c, out, indent=2)
            
    print(f"Split {len(data)} candidates into {target_dir}")

if __name__ == "__main__":
    main()
