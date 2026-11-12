import os, json, urllib.request

env_path = '.env.local'
url = None
key = None
with open(env_path, 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
            url = line.split('=', 1)[1].strip()
        elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
            key = line.split('=', 1)[1].strip()

req = urllib.request.Request(
    f'{url}/rest/v1/previous_papers?select=id,title,year,total_questions&order=id.asc',
    headers={'apikey': key, 'Authorization': f'Bearer {key}'}
)
with urllib.request.urlopen(req) as resp:
    papers = json.loads(resp.read().decode('utf-8'))

print(f'Total papers in DB: {len(papers)}')
by_year = {}
for p in papers:
    yr = str(p.get('year', 'Unknown'))
    by_year.setdefault(yr, []).append(p)

for yr in sorted(by_year.keys()):
    plist = by_year[yr]
    ids = [p['id'] for p in plist]
    print(f'Year {yr}: {len(plist)} papers (IDs: {min(ids)}..{max(ids)})')
    for p in plist[:3]:
        print(f"   Sample: ID {p['id']} - {p['title']}")
    if len(plist) > 3:
        print(f"   ... and {len(plist) - 3} more")
