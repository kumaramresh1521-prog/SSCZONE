import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()
req = urllib.request.Request(
    f'{u}/rest/v1/questions?select=id,question_text&limit=20',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())

for q in data[:5]:
    txt = q['question_text'] or ''
    has_newline = '\n' in txt
    print(f"ID {q['id']}, newline? {has_newline}: {repr(txt[:80])}")
