import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json, random

u, k = get_supabase_credentials()
req = urllib.request.Request(
    f'{u}/rest/v1/previous_papers?select=id,title',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as r:
    papers = json.loads(r.read())
    pids = [p['id'] for p in papers]

sample_pids = random.sample(pids, 8)
print('Sample random paper IDs chosen:', sample_pids)

pids_str = ','.join(map(str, sample_pids))
req2 = urllib.request.Request(
    f'{u}/rest/v1/paper_questions?paper_id=in.({pids_str})&question_number=gte.1&question_number=lte.25&select=id,paper_id,question_number,question_text&limit=10',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req2) as r:
    sample_qs = json.loads(r.read())
    print(f'Successfully pulled {len(sample_qs)} PYQ questions!')
    for q in sample_qs[:3]:
        print(f"  [Paper {q['paper_id']} Q.{q['question_number']}]: {repr(q['question_text'][:80])}")
