import json, os, sys, urllib.request, urllib.parse
from collections import Counter

# Load .env.local
env = {}
with open('.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'].rstrip('/')
SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

HEADERS = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json',
}

def rest_req(method, path, data=None, extra_headers=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    hdrs = dict(HEADERS)
    if extra_headers:
        hdrs.update(extra_headers)
    body = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(url, data=body, headers=hdrs, method=method)
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read().decode('utf-8')
        return json.loads(raw) if raw else None

def fetch_counts():
    counts = Counter()
    seen_ids = set()
    offset = 0
    while True:
        rows = rest_req(
            'GET',
            f"questions?topic_id=in.(224,242)&select=id,topic_id,tier_level&order=id.asc&limit=1000&offset={offset}",
        )
        if not rows:
            break
        for r in rows:
            assert r['id'] not in seen_ids, f"Duplicate id in pagination: {r['id']}"
            seen_ids.add(r['id'])
            counts[(r['topic_id'], r['tier_level'] or 'NULL')] += 1
        if len(rows) < 1000:
            break
        offset += 1000
    return counts

print("1. Inspecting sample existing question schema & pre-sync counts...")
sample = rest_req('GET', "questions?topic_id=eq.224&limit=1")
if sample:
    print("   Existing columns:", list(sample[0].keys()))
pre_counts = fetch_counts()
for k, v in sorted(pre_counts.items()):
    print(f"   Pre-sync topic_id={k[0]} tier={k[1]}: {v}")

with open('kiran_type4_254_verified.json', 'r', encoding='utf-8') as f:
    b4 = json.load(f)
with open('kiran_type5_25_verified.json', 'r', encoding='utf-8') as f:
    b5 = json.load(f)

assert len(b4) == 253, len(b4)
assert len(b5) == 25, len(b5)

if '--verify-only' not in sys.argv:
    print("\n2. Clearing existing Type-IV and Type-V rows for topic_id 224 and 242...")
    rest_req(
        'DELETE',
        "questions?topic_id=in.(224,242)&tier_level=in.(Type-IV,Type-V)",
        extra_headers={'Prefer': 'return=minimal'}
    )

    def build_rows(items, topic_id, tier_level):
        out = []
        for it in items:
            out.append({
                'topic_id': topic_id,
                'question_text': it['question_text'],
                'option_a': it['options'][0],
                'option_b': it['options'][1],
                'option_c': it['options'][2],
                'option_d': it['options'][3],
                'correct_answer': it['correct_option'],
                'explanation': it['explanation'],
                'exam_tag': it['exam_tag'],
                'difficulty': 'medium',
                'is_active': True,
                'tier_level': tier_level,
            })
        return out

    all_rows = (
        build_rows(b4, 224, 'Type-IV') +
        build_rows(b4, 242, 'Type-IV') +
        build_rows(b5, 224, 'Type-V') +
        build_rows(b5, 242, 'Type-V')
    )
    print(f"\n3. Inserting {len(all_rows)} rows (253*2 Type-IV + 25*2 Type-V) in batches of 50...")
    BATCH = 50
    for i in range(0, len(all_rows), BATCH):
        chunk = all_rows[i:i+BATCH]
        rest_req('POST', 'questions', data=chunk, extra_headers={'Prefer': 'return=minimal'})
    print("   All batches inserted successfully!")

print("\n4. Verifying live Supabase counts across all Analogy tiers (topics 224 & 242):")
post_counts = fetch_counts()
for k, v in sorted(post_counts.items()):
    print(f"   Live topic_id={k[0]} tier={k[1]}: {v}")

assert post_counts[(224, 'Type-IV')] == 253
assert post_counts[(242, 'Type-IV')] == 253
assert post_counts[(224, 'Type-V')] == 25
assert post_counts[(242, 'Type-V')] == 25
print("\n[SUCCESS] Verified Type-IV (253 each) and Type-V (25 each) synced cleanly to Supabase for topics 224 & 242!")
