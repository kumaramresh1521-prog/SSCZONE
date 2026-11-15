import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

# Check options across 2023 papers for newlines or formatting
req = urllib.request.Request(
    f'{u}/rest/v1/paper_questions?paper_id=eq.110&select=question_number,option_a,option_b,option_c,option_d',
    headers={'apikey': k, 'Authorization': f'Bearer {k}'}
)
with urllib.request.urlopen(req) as r:
    data = json.loads(r.read())
    opts_with_nl = []
    for q in data:
        for opt_key in ['option_a', 'option_b', 'option_c', 'option_d']:
            val = q.get(opt_key) or ''
            if '\n' in val:
                opts_with_nl.append((q['question_number'], opt_key, val))
    print(f'Total options with newlines in Paper 110: {len(opts_with_nl)}')
    for qno, k_opt, val in opts_with_nl[:10]:
        print(f"  Q.{qno} {k_opt}: {repr(val)}")
