import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json
from collections import Counter

u, k = get_supabase_credentials()
req = urllib.request.Request(
    f'{u}/rest/v1/previous_papers?select=id,title,year,total_questions&order=id.asc',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as resp:
    papers = json.loads(resp.read())

print(f"Total papers in previous_papers: {len(papers)}")
year_counter = Counter(p['year'] for p in papers)
print("Papers by year:", dict(year_counter))

papers_2023 = [p for p in papers if p['year'] == 2023]
papers_2024 = [p for p in papers if p['year'] == 2024]
other_papers = [p for p in papers if p['year'] not in (2023, 2024)]

if papers_2023:
    print(f"2023 papers count: {len(papers_2023)}, IDs: {min(p['id'] for p in papers_2023)} to {max(p['id'] for p in papers_2023)}")
if papers_2024:
    print(f"2024 papers count: {len(papers_2024)}, IDs: {min(p['id'] for p in papers_2024)} to {max(p['id'] for p in papers_2024)}")
if other_papers:
    print(f"Other papers: {[p['id'] for p in other_papers]}")
