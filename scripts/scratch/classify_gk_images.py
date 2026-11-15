import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
import urllib.request, json
from supabase_env import get_supabase_credentials

url, key = get_supabase_credentials()
headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Accept': 'application/json'}

req = urllib.request.Request(
    f"{url}/rest/v1/paper_questions?question_number=gte.26&question_number=lte.50&question_text=ilike.*images*&limit=50&select=id,paper_id,question_number,question_text,option_a",
    headers=headers
)
with urllib.request.urlopen(req) as res:
    rows = json.loads(res.read())

print(f"Total GK questions with images: {len(rows)}")
table_match_count = 0
pure_bio_diagram_count = 0

for r in rows:
    opt = str(r.get('option_a') or '')
    txt = str(r.get('question_text') or '')
    is_matching = any(x in opt.lower() for x in ['-', '(', ';']) or 'match' in txt.lower() or 'column' in txt.lower()
    if is_matching:
        table_match_count += 1
        print(f"TABLE MATCH: Q#{r['id']} (Q.{r['question_number']}) P.{r['paper_id']} OptA={opt[:30]}")
    else:
        pure_bio_diagram_count += 1
        print(f"DIAGRAM/OTHER: Q#{r['id']} (Q.{r['question_number']}) P.{r['paper_id']} Txt={txt[:50]}")

print(f"\nBreakdown: {table_match_count} Table Matching questions, {pure_bio_diagram_count} Diagrams/Others.")
