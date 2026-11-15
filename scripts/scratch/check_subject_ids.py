import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json
from collections import Counter

u, k = get_supabase_credentials()

# Check subjects table
req = urllib.request.Request(
    f'{u}/rest/v1/subjects?select=id,title,exam_id',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    subjects = json.loads(resp.read())
print("Subjects in DB:")
for s in subjects:
    print(f"  ID {s['id']}: {s['title']} (Exam {s.get('exam_id')})")

# Check topics table subject_ids
req2 = urllib.request.Request(
    f'{u}/rest/v1/topics?select=id,title,subject_id&limit=200',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req2) as resp:
    topics = json.loads(resp.read())
subj_counts = Counter(t['subject_id'] for t in topics)
print("\nTopics per subject_id:", dict(subj_counts))
