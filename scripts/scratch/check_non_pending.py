import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

req = urllib.request.Request(
    f'{u}/rest/v1/math_review?status=neq.pending&select=*',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as r:
    data = json.loads(r.read())
    print('Non-pending math_review rows:', len(data))
    for row in data:
        print(f"ID: {row['id']}, Paper: {row['paper_id']}, Q_ID: {row['question_id']}, Q_Num: {row['question_number']}, Status: {row['status']}")
        print(f"  Admin: {repr(row['admin_latex'])[:150]}")
