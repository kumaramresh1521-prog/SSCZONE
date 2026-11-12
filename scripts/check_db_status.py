import os, json, urllib.request, glob

env_path = '.env.local'
url = None
key = None
with open(env_path, 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            key = line.split('=', 1)[1].strip()

print(f"{'Paper':<6} | {'Tot':<4} | {'A':<4} | {'B':<4} | {'C':<4} | {'D':<4} | {'% A':<6} | {'Status':<10}")
print("-" * 55)

balanced_count = 0
high_a_papers = []

for pid in range(25, 54):
    req_url = f"{url}/rest/v1/paper_questions?paper_id=eq.{pid}&select=question_number,correct_answer&order=question_number.asc"
    req = urllib.request.Request(req_url, headers={
        'apikey': key,
        'Authorization': f'Bearer {key}'
    })
    try:
        with urllib.request.urlopen(req) as resp:
            qs = json.loads(resp.read().decode('utf-8'))
        counts = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'Other': 0}
        for q in qs:
            ans = (q.get('correct_answer') or '').strip().upper()
            if ans in counts:
                counts[ans] += 1
            else:
                counts['Other'] += 1
        total = len(qs)
        pct_a = (counts['A'] / total * 100) if total else 0
        status = "BALANCED" if pct_a <= 35 else "HIGH A"
        if status == "BALANCED":
            balanced_count += 1
        else:
            high_a_papers.append(pid)
        print(f"P-{pid:<4} | {total:<4} | {counts['A']:<4} | {counts['B']:<4} | {counts['C']:<4} | {counts['D']:<4} | {pct_a:4.1f}% | {status}")
    except Exception as e:
        print(f"P-{pid:<4} | Error: {e}")

print("-" * 55)
print(f"Total Papers Balanced in Supabase: {balanced_count} / 29")
print(f"Remaining Papers with High A / Pending: {high_a_papers}")
