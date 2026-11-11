import json
import requests
import sys
from supabase_env import get_supabase_credentials

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp_cleaned_database_payload.json", "r", encoding="utf-8") as f:
    papers = json.load(f)

# Update Paper 1 Q68
for p in papers:
    if p["paper"]["id"] == 1:
        for q in p["questions"]:
            if q["question_number"] == 68:
                q["option_a"] = "6/7 hours / 6/7 घंटे"
                q["option_b"] = "5/7 hours / 5/7 घंटे"
                q["correct_answer"] = "A"
                print("✓ Updated Paper 1 Q68 -> Option A: 6/7 hours, Answer: A")

# Update Paper 4 Q71
for p in papers:
    if p["paper"]["id"] == 4:
        for q in p["questions"]:
            if q["question_number"] == 71:
                q["option_a"] = "8√7 / 7"
                q["option_b"] = "7√7 / 8"
                q["correct_answer"] = "A"
                print("✓ Updated Paper 4 Q71 -> Option A: 8√7 / 7, Answer: A")

with open("tmp_cleaned_database_payload.json", "w", encoding="utf-8") as f:
    json.dump(papers, f, ensure_ascii=False, indent=2)

SUPABASE_URL, SERVICE_KEY = get_supabase_credentials()
HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

# Update Supabase for Paper 1 Q68 and Paper 4 Q71
for p in papers:
    if p["paper"]["id"] in [1, 4]:
        for q in p["questions"]:
            if (p["paper"]["id"] == 1 and q["question_number"] == 68) or (p["paper"]["id"] == 4 and q["question_number"] == 71):
                payload = [{
                    "id": q["id"],
                    "paper_id": p["paper"]["id"],
                    "question_number": q["question_number"],
                    "question_text": q["question_text"],
                    "option_a": q["option_a"],
                    "option_b": q["option_b"],
                    "option_c": q["option_c"],
                    "option_d": q["option_d"],
                    "correct_answer": q["correct_answer"],
                    "explanation": q.get("explanation")
                }]
                res = requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=payload)
                print(f"Supabase update status for Paper {p['paper']['id']} Q{q['question_number']}: {res.status_code}")

print("Done updating payload and Supabase!")
