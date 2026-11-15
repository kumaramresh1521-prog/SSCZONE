import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

# Query PostgreSQL foreign keys using rpc or direct query if possible, or test an insert
# Let's inspect test_attempts RLS policies and foreign keys
req = urllib.request.Request(
    f'{u}/rest/v1/',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    spec = json.loads(resp.read())

print("Endpoints and descriptions for user_answers:")
print(spec.get('paths', {}).get('/user_answers', {}))
print("\nEndpoints and descriptions for test_attempts:")
print(spec.get('paths', {}).get('/test_attempts', {}))
