import requests
import json
import os
import sys

sys.path.append(os.path.abspath("."))
sys.stdout.reconfigure(encoding='utf-8')

env_path = ".env.local"
supabase_url = None
supabase_key = None

with open(env_path, "r", encoding="utf-8") as f:
    for line in f:
        if "NEXT_PUBLIC_SUPABASE_URL" in line and "=" in line:
            supabase_url = line.split("=", 1)[1].strip().strip('\"\'')
        if "SUPABASE_SERVICE_ROLE_KEY" in line and "=" in line:
            supabase_key = line.split("=", 1)[1].strip().strip('\"\'')

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

res_p = requests.get(f"{supabase_url}/rest/v1/previous_papers?year=eq.2026&select=id,title&order=id.asc", headers=headers)
papers = res_p.json() if res_p.ok else []

total_flagged_qs = 0
flagged_by_paper = {}

for p in papers:
    p_id = p["id"]
    p_title = p["title"]
    res_q = requests.get(f"{supabase_url}/rest/v1/paper_questions?paper_id=eq.{p_id}&select=id,question_number,option_a,option_b,option_c,option_d", headers=headers)
    questions = res_q.json() if res_q.ok else []
    
    paper_qs = []
    for q in questions:
        qn = q["question_number"]
        is_flagged = False
        for let in ['a', 'b', 'c', 'd']:
            val = q[f"option_{let}"].strip()
            if val == f"Option {let.upper()}" or not val:
                is_flagged = True
        if is_flagged:
            paper_qs.append(qn)
            
    if paper_qs:
        flagged_by_paper[p_title] = (p_id, paper_qs)
        total_flagged_qs += len(paper_qs)

print(f"Total questions with placeholder/empty options: {total_flagged_qs} out of 2,900 ({total_flagged_qs/2900*100:.1f}%)")
for title, (pid, q_list) in flagged_by_paper.items():
    print(f"  * {title} (ID {pid}): Qs {q_list}")
