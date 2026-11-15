import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

req = urllib.request.Request(
    f'{u}/rest/v1/paper_questions?paper_id=eq.110&question_number=in.(4,8,14)&select=question_number,question_text&order=question_number.asc',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as r:
    data = json.loads(r.read())
    for q in data:
        print(f"=== Q.{q['question_number']} ===")
        print(repr(q['question_text']))
        print()
