import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

all_tids = set()
for offset in range(0, 9000, 1000):
    req = urllib.request.Request(
        f'{u}/rest/v1/questions?select=topic_id&offset={offset}&limit=1000',
        headers={'apikey': k, 'Authorization': f'Bearer {k}'}
    )
    with urllib.request.urlopen(req) as resp:
        rows = json.loads(resp.read())
        for r in rows:
            all_tids.add(r['topic_id'])

print("All unique topic_ids across entire questions table:", sorted(list(all_tids)))

in_str = ','.join(str(tid) for tid in sorted(list(all_tids)))
req2 = urllib.request.Request(
    f'{u}/rest/v1/topics?id=in.({in_str})&select=id,title,subject_id,subjects(id,title)',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req2) as resp:
    topics_info = json.loads(resp.read())

for t in topics_info:
    s = t.get('subjects')
    stitle = (s.get('title') if isinstance(s, dict) else str(s))
    print(f"  Topic {t['id']}: '{t['title']}' -> {stitle}")
