import sys, random
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

# Fetch valid papers
req = urllib.request.Request(
    f'{u}/rest/v1/previous_papers?select=id,title&order=id.asc',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    valid_papers = json.loads(resp.read())

paper_ids = [p['id'] for p in valid_papers]
paper_map = {p['id']: p['title'] for p in valid_papers}
print(f"Loaded {len(paper_ids)} valid papers: {paper_ids[0]} to {paper_ids[-1]}")

SECTIONS = [
    {"key": "reasoning", "name": "General Intelligence & Reasoning", "min": 1, "max": 25},
    {"key": "ga", "name": "General Awareness", "min": 26, "max": 50},
    {"key": "quant", "name": "Quantitative Aptitude", "min": 51, "max": 75},
    {"key": "english", "name": "English Comprehension", "min": 76, "max": 100},
]

# Simulate 25-question Speed Test distribution: 7, 6, 6, 6
counts = [7, 6, 6, 6]
speed_test_questions = []

for sec, count in zip(SECTIONS, counts):
    picked_papers = random.sample(paper_ids, 4)
    in_clause = ','.join(str(pid) for pid in picked_papers)
    req_q = urllib.request.Request(
        f'{u}/rest/v1/paper_questions?paper_id=in.({in_clause})&question_number=gte.{sec["min"]}&question_number=lte.{sec["max"]}&limit={count * 2}&select=id,paper_id,question_number,question_text,option_a,option_b,option_c,option_d,correct_answer,explanation',
        headers={'apikey': k, 'Authorization': f'Bearer {k}'}
    )
    with urllib.request.urlopen(req_q) as resp:
        rows = json.loads(resp.read())
    selected = random.sample(rows, min(count, len(rows)))
    for q in selected:
        speed_test_questions.append({
            "id": f"pyq_{q['id']}",
            "source": "pyq",
            "subject": sec["name"],
            "subjectKey": sec["key"],
            "question_text": q["question_text"][:60],
            "shift": paper_map.get(q["paper_id"])
        })
    print(f"Section '{sec['key']}': Selected {len(selected)} PYQs from shifts {picked_papers}")

print(f"\nTotal Speed Test questions generated: {len(speed_test_questions)}")
print("Sample questions:")
for sq in speed_test_questions[::6]:
    print(f"[{sq['subjectKey'].upper()}] - {sq['question_text']}... (From: {sq['shift'][:40]})")
