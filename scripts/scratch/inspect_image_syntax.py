import sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parents[1]))
import urllib.request, json
from supabase_env import get_supabase_credentials

url, key = get_supabase_credentials()
headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Accept': 'application/json'}

# Fetch 200 questions to inspect what image syntax is used
req = urllib.request.Request(f"{url}/rest/v1/paper_questions?limit=200", headers=headers)
with urllib.request.urlopen(req) as res:
    rows = json.loads(res.read())

found = 0
for r in rows:
    for col in ['question_text', 'option_a', 'option_b', 'option_c', 'option_d']:
        val = str(r.get(col) or '')
        if '.png' in val or '.jpg' in val or 'images/' in val or 'img' in val.lower():
            print(f"Match in Q#{r['id']} (Q.{r['question_number']}) col={col}:")
            print("  ", val[:150])
            found += 1
            if found >= 10:
                break
    if found >= 10:
        break

if not found:
    print("No matches in first 200 rows. Searching across DB with query...")
    # Search with ilike
    for pattern in ['%images%', '%.png%', '%img%']:
        req2 = urllib.request.Request(f"{url}/rest/v1/paper_questions?question_text=ilike.{pattern}&limit=2", headers=headers)
        with urllib.request.urlopen(req2) as res2:
            d = json.loads(res2.read())
            if d:
                print(f"Found with pattern '{pattern}':", d[0]['question_text'][:150])
