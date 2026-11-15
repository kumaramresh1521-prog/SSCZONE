import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json
from collections import Counter

u, k = get_supabase_credentials()

# Fetch unique topic_ids from questions table
req = urllib.request.Request(
    f'{u}/rest/v1/questions?select=topic_id&limit=1000',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())

topic_counts = Counter(q['topic_id'] for q in data)
print(f"Sample 1000 questions have topic_ids: {list(topic_counts.keys())[:15]}")

# Let's inspect topics details for these topic_ids
sample_tids = list(topic_counts.keys())[:10]
in_str = ','.join(str(tid) for tid in sample_tids)
req2 = urllib.request.Request(
    f'{u}/rest/v1/topics?id=in.({in_str})&select=id,title,subject_id,subjects(id,title)',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req2) as resp:
    topics_info = json.loads(resp.read())
for t in topics_info:
    s_title = t.get('subjects', {}).get('title') if isinstance(t.get('subjects'), dict) else t.get('subjects')
    print(f"  Topic ID {t['id']}: '{t['title']}' -> Subject: {s_title} (ID {t['subject_id']})")
