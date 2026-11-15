import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

# Fetch distinct topic_ids in questions table
# We can do this by paging through questions or querying topics that have questions
req = urllib.request.Request(
    f'{u}/rest/v1/questions?select=topic_id&limit=8500',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())

unique_tids = sorted(list(set(q['topic_id'] for q in data)))
print(f"Total questions: {len(data)}, unique topic_ids in questions table: {len(unique_tids)}")
print(f"Topic IDs: {unique_tids}")

# Get subject for each topic_id
in_str = ','.join(str(tid) for tid in unique_tids)
req2 = urllib.request.Request(
    f'{u}/rest/v1/topics?id=in.({in_str})&select=id,title,subject_id,subjects(id,title)',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req2) as resp:
    topics_info = json.loads(resp.read())

subject_counts = {}
for t in topics_info:
    s = t.get('subjects')
    stitle = (s.get('title') if isinstance(s, dict) else str(s))
    subject_counts[stitle] = subject_counts.get(stitle, 0) + 1
    print(f"  Topic {t['id']}: '{t['title']}' -> {stitle}")

print("\nSubject breakdown of Question Bank topics:", subject_counts)
