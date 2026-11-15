import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

# Let's inspect total count of questions table
req = urllib.request.Request(
    f'{u}/rest/v1/questions?select=id&limit=1',
    headers={'apikey': k, 'Authorization': f'Bearer {k}', 'Prefer': 'count=exact'}
)
with urllib.request.urlopen(req) as resp:
    print("Total questions in questions table:", resp.headers.get('content-range'))

# Sample across different ID ranges
for offset in [0, 2000, 5000, 8000, 10000]:
    req = urllib.request.Request(
        f'{u}/rest/v1/questions?select=id,topic_id,question_text&range={offset}-{offset+2}',
        headers={'apikey': k, 'Authorization': f'Bearer {k}'}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            if data:
                print(f"Offset {offset}: ID {data[0]['id']}, topic_id {data[0]['topic_id']}, txt: {data[0]['question_text'][:50]}")
    except Exception as e:
        print(f"Offset {offset} error: {e}")
