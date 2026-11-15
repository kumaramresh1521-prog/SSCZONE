import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

# Check sample question columns
req = urllib.request.Request(
    f'{u}/rest/v1/questions?limit=2',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())
    if data:
        print("Questions columns:", list(data[0].keys()))
        print("Sample question:", data[0])

# Check how many questions exist per subject in questions table via topics
req2 = urllib.request.Request(
    f'{u}/rest/v1/topics?select=id,title,subject_id&limit=10',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req2) as resp:
    topics = json.loads(resp.read())
    print("\nSample topics with subject_id:")
    for t in topics:
        print(f"  Topic ID {t['id']}: {t['title']} -> Subject ID {t['subject_id']}")
