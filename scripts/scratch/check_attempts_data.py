import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

# Test test_attempts with service role key
req = urllib.request.Request(
    f'{u}/rest/v1/test_attempts?select=id,user_id,paper_id,score,status&limit=5',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())
    print("test_attempts rows:", len(data), data)

# Test bookmarks with service role key
req = urllib.request.Request(
    f'{u}/rest/v1/bookmarks?select=id,user_id,question_id,tag&limit=5',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())
    print("bookmarks rows:", len(data), data)
