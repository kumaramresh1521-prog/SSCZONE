import requests
import json
import re
import sys
from supabase_env import get_supabase_credentials

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL, SERVICE_KEY = get_supabase_credentials()
HEADERS = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}

res = requests.get(f"{SUPABASE_URL}/rest/v1/previous_papers?order=id.asc", headers=HEADERS)
papers = res.json()
print(f"Total papers found: {len(papers)}")

all_papers_info = []

for p in papers:
    pid = p['id']
    title = p['title']
    res_q = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}&order=question_number.asc", headers=HEADERS)
    qs = res_q.json() if res_q.ok else []
    print(f"Paper {pid:2d}: {title} -> {len(qs)} questions")
    all_papers_info.append({"paper": p, "questions": qs})

with open("tmp_papers_data.json", "w", encoding="utf-8") as f:
    json.dump(all_papers_info, f, ensure_ascii=False)

print("Saved tmp_papers_data.json")
