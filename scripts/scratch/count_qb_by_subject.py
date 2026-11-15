import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

# Fetch all topics with their subject_id
req = urllib.request.Request(
    f'{u}/rest/v1/topics?select=id,title,subject_id&limit=1000',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    topics = json.loads(resp.read())

topic_to_subject = {t['id']: t['subject_id'] for t in topics}

# Count questions per subject
# Subject IDs:
# 1, 6, 10 -> Quant
# 2, 7, 11 -> English
# 3, 8, 12 -> Reasoning
# 4, 9, 13 -> GA
for name, sids in [("Quant", [1,6,10]), ("English", [2,7,11]), ("Reasoning", [3,8,12]), ("GA", [4,9,13])]:
    topic_ids = [t['id'] for t in topics if t['subject_id'] in sids]
    if topic_ids:
        in_str = ','.join(str(tid) for tid in topic_ids[:50]) # sample
        req_c = urllib.request.Request(
            f'{u}/rest/v1/questions?topic_id=in.({in_str})&select=id&limit=1',
            headers={'apikey': k, 'Authorization': f'Bearer {k}', 'Prefer': 'count=exact'}
        )
        try:
            with urllib.request.urlopen(req_c) as r:
                crange = r.headers.get('content-range')
                print(f"QB {name} (sample topics): {crange}")
        except Exception as e:
            print(f"QB {name} error: {e}")
