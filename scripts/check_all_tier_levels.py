import urllib.request
import json

with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            key = line.split('=', 1)[1].strip()

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
}

# Fetch all 1003 rows for topic 224 with pagination
all_rows = []
page = 0
limit = 500
while True:
    offset = page * limit
    req = urllib.request.Request(
        f"{url}/rest/v1/questions?topic_id=eq.224&select=id,tier_level&offset={offset}&limit={limit}",
        headers=headers
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        all_rows.extend(data)
        if len(data) < limit:
            break
    page += 1

print(f"Total rows fetched: {len(all_rows)}")
from collections import Counter
counts = Counter(r.get('tier_level') for r in all_rows)
print("Tier level breakdown:")
for k, v in counts.items():
    print(f"  '{k}': {v}")
