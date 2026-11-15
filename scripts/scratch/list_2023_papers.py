import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

req = urllib.request.Request(
    f'{u}/rest/v1/previous_papers?year=eq.2023&select=id,title&order=id.asc',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as r:
    data = json.loads(r.read())
    print(f'Total 2023 papers: {len(data)}')
    for p in data:
        print(f"  ID: {p['id']}, Title: {p['title']}")
