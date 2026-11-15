import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

# Check how many 2023 questions have newlines in question_text
req = urllib.request.Request(
    f'{u}/rest/v1/previous_papers?year=eq.2023&select=id',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as r:
    papers = json.loads(r.read())
    pids = [p['id'] for p in papers]
    print(f'Total 2023 papers: {len(pids)}')

# Sample 5 papers to see newline statistics
for pid in pids[:5]:
    req_q = urllib.request.Request(
        f'{u}/rest/v1/paper_questions?paper_id=eq.{pid}&select=id,question_text',
        headers={'apikey': k, 'Authorization': f'Bearer {k}'}
    )
    with urllib.request.urlopen(req_q) as r:
        qs = json.loads(r.read())
        with_nl = [q for q in qs if '\n' in (q.get('question_text') or '')]
        print(f"Paper {pid}: {len(with_nl)} of {len(qs)} questions have newlines")
