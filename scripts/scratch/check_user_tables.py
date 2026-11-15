import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

tables_to_check = [
    'user_syllabus_progress',
    'test_attempts',
    'user_test_attempts',
    'question_attempts',
    'bookmarks',
    'user_bookmarks',
    'daily_quiz_attempts',
    'practice_progress',
    'user_practice_progress',
    'speed_test_attempts'
]

for table in tables_to_check:
    req = urllib.request.Request(
        f'{u}/rest/v1/{table}?limit=1',
        headers={'apikey': k, 'Authorization': f'Bearer {k}'}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            print(f"✓ Table '{table}' EXISTS! Sample count: {len(data)}")
    except urllib.error.HTTPError as e:
        print(f"✗ Table '{table}' status {e.code}: {e.read().decode()[:80]}")
    except Exception as e:
        print(f"✗ Table '{table}' error: {e}")
