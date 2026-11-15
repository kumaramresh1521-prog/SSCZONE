import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

# Fetch OpenAPI spec definition for test_attempts and user_answers
req = urllib.request.Request(
    f'{u}/rest/v1/',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    spec = json.loads(resp.read())

for table in ['test_attempts', 'user_answers', 'bookmarks']:
    props = spec.get('definitions', {}).get(table, {}).get('properties', {})
    print(f"\nTable '{table}' columns:")
    for col, details in props.items():
        print(f"  - {col}: {details.get('type')} (format: {details.get('format', 'none')})")
