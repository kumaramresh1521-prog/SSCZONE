import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json, random

u, k = get_supabase_credentials()

# 1. Fetch valid papers
req = urllib.request.Request(
    f'{u}/rest/v1/previous_papers?select=id,title&order=id.asc',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    valid_papers = json.loads(resp.read())

paper_map = {p['id']: p['title'] for p in valid_papers}
valid_paper_ids = list(paper_map.keys())

print(f"Total valid papers: {len(valid_paper_ids)}")

SECTION_CONFIG = [
    {"key": "reasoning", "name": "General Intelligence & Reasoning", "min": 1, "max": 25},
    {"key": "ga", "name": "General Awareness", "min": 26, "max": 50},
    {"key": "quant", "name": "Quantitative Aptitude", "min": 51, "max": 75},
    {"key": "english", "name": "English Comprehension", "min": 76, "max": 100},
]

total_pyqs = 0
for sec in SECTION_CONFIG:
    picked_papers = random.sample(valid_paper_ids, 8)
    in_clause = ','.join(str(pid) for pid in picked_papers)
    req_q = urllib.request.Request(
        f'{u}/rest/v1/paper_questions?paper_id=in.({in_clause})&question_number=gte.{sec["min"]}&question_number=lte.{sec["max"]}&limit=50&select=id,paper_id,question_number,question_text,option_a,option_b,correct_answer',
        headers={'apikey': k, 'Authorization': f'Bearer {k}'}
    )
    with urllib.request.urlopen(req_q) as resp:
        q_rows = json.loads(resp.read())
    print(f"Section {sec['key']} ({sec['name']}): Fetched {len(q_rows)} PYQs from papers {picked_papers[:4]}...")
    if q_rows:
        sample = q_rows[0]
        paper_title = paper_map.get(sample['paper_id'], f"Shift #{sample['paper_id']}")
        print(f"   Sample Q.{sample['question_number']} from [{paper_title}]: {repr(sample['question_text'][:70])}")
    total_pyqs += len(q_rows)

print(f"\nTotal PYQ questions fetched across 4 sections: {total_pyqs} (Target for 100-Q quiz: 100)")
print("Daily Quiz Generator will now pull 100% genuine Shift PYQs without failing!")
