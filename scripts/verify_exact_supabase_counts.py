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
    'Prefer': 'count=exact'
}

for topic_id in [224, 242]:
    print(f"\n=== Exact counts for Topic {topic_id} ===")
    for tier in ['Type-I', 'Type-II', 'Type-III']:
        req = urllib.request.Request(
            f"{url}/rest/v1/questions?topic_id=eq.{topic_id}&tier_level=eq.{tier}&select=id",
            headers=headers
        )
        with urllib.request.urlopen(req) as resp:
            crange = resp.headers.get('content-range')
            print(f"  {tier}: {crange}")
            
    # Total count
    req_tot = urllib.request.Request(
        f"{url}/rest/v1/questions?topic_id=eq.{topic_id}&select=id",
        headers=headers
    )
    with urllib.request.urlopen(req_tot) as resp:
        crange_tot = resp.headers.get('content-range')
        print(f"  Total for Topic {topic_id}: {crange_tot}")
