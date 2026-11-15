import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json
from collections import Counter

u, k = get_supabase_credentials()

# Fetch all topics with their subjects
req = urllib.request.Request(
    f'{u}/rest/v1/topics?select=id,title,subject_id,subjects(id,title)&limit=1000',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    topics = json.loads(resp.read())

subj_topic_ids = {"quant": [], "reasoning": [], "english": [], "ga": []}

for t in topics:
    s = t.get('subjects')
    stitle = (s.get('title') if isinstance(s, dict) else '').lower()
    if 'math' in stitle:
        subj_topic_ids['quant'].append(t['id'])
    elif 'reason' in stitle:
        subj_topic_ids['reasoning'].append(t['id'])
    elif 'english' in stitle:
        subj_topic_ids['english'].append(t['id'])
    else:
        subj_topic_ids['ga'].append(t['id'])

print("Topics mapped to subjects:")
for k_s, ids in subj_topic_ids.items():
    print(f"  {k_s}: {len(ids)} topics")

# Now let's test fetching sample questions from questions table for each subject
for k_s, ids in subj_topic_ids.items():
    in_s = ','.join(str(i) for i in ids[:40])
    req_q = urllib.request.Request(
        f'{u}/rest/v1/questions?topic_id=in.({in_s})&select=id,question_text,topic_id&limit=5',
        headers={'apikey': k, 'Authorization': f'Bearer {k}'}
    )
    with urllib.request.urlopen(req_q) as resp:
        qs = json.loads(resp.read())
    print(f"  {k_s} Question Bank sample fetched: {len(qs)} questions")
    if qs:
        print(f"     Sample 1: {repr(qs[0]['question_text'][:60])}")
