import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

# Fetch OpenAPI spec from PostgREST root
req = urllib.request.Request(
    f'{u}/rest/v1/',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    spec = json.loads(resp.read())

definitions = list(spec.get('definitions', {}).keys())
print("All tables in Supabase public schema:")
for d in sorted(definitions):
    print(f" - {d}")
