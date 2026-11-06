import json
import requests
import sys

sys.stdout.reconfigure(encoding='utf-8')

env = {}
with open(r'c:\ssczone\.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"\'')

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# Find all paper IDs
r_papers = requests.get(f'{SUPABASE_URL}/rest/v1/previous_papers?select=id,title', headers=HEADERS)
papers_map = {p['title']: p['id'] for p in r_papers.json()}

print("Finding target papers...")
p_13s1_id = None
p_13s2_id = None
p_15s2_id = None
p_13oct_id = None

for title, pid in papers_map.items():
    t_lower = title.lower()
    if '13 september' in t_lower and 'shift 1' in t_lower:
        p_13s1_id = pid
    elif '13 september' in t_lower and 'shift 2' in t_lower:
        p_13s2_id = pid
    elif '15 september' in t_lower and 'shift 2' in t_lower:
        p_15s2_id = pid
    elif '13 october' in t_lower and 'shift 3' in t_lower:
        p_13oct_id = pid

print(f"Paper IDs: 13s1={p_13s1_id}, 13s2={p_13s2_id}, 15s2={p_15s2_id}, 13oct={p_13oct_id}")

updates = [
    # 1. 13 Sept S1 Q53
    (p_13s1_id, 53, {
        "question_text": "Evaluate: 6 - [2/3 ÷ {1/6 + (1/2 × (1 - 1/3))}] मान ज्ञात कीजिए: 6 - [2/3 ÷ {1/6 + (1/2 × (1 - 1/3))}]",
        "option_a": "14/3",
        "option_b": "15/3",
        "option_c": "16/3",
        "option_d": "17/3",
        "correct_answer": "A",
        "explanation": "Using BODMAS:\n1) Innermost: 1 - 1/3 = 2/3\n2) Multiply: 1/2 × 2/3 = 1/3\n3) Add: 1/6 + 1/3 = 3/6 = 1/2\n4) Divide: 2/3 ÷ 1/2 = 4/3\n5) Subtract: 6 - 4/3 = (18 - 4)/3 = 14/3."
    }),
    # 2. 13 Sept S2 Q52
    (p_13s2_id, 52, {
        "question_text": "Simplify: (1 2/5 + 2.6) - 1 3/4 सरल कीजिए: (1 2/5 + 2.6) - 1 3/4",
        "option_a": "2.25",
        "option_b": "2.1",
        "option_c": "2.35",
        "option_d": "2.5",
        "correct_answer": "A",
        "explanation": "Convert to decimals:\n1 2/5 = 1.4\n2.6 = 2.6\n1 3/4 = 1.75\nExpression: (1.4 + 2.6) - 1.75 = 4.0 - 1.75 = 2.25."
    }),
    # 3. 13 Sept S2 Q53
    (p_13s2_id, 53, {
        "question_text": "Evaluate the expression: 1/(6 - 5) + 1/(5 - 4) + 1/(4 - 3) - 3 व्यंजक का मान ज्ञात कीजिए: 1/(6 - 5) + 1/(5 - 4) + 1/(4 - 3) - 3",
        "option_a": "5",
        "option_b": "3",
        "option_c": "2",
        "option_d": "0",
        "correct_answer": "D",
        "explanation": "Evaluate each term:\n1/(6 - 5) = 1/1 = 1\n1/(5 - 4) = 1/1 = 1\n1/(4 - 3) = 1/1 = 1\nTotal = 1 + 1 + 1 - 3 = 0."
    }),
    # 4. 15 Sept S2 Q71
    (p_15s2_id, 71, {
        "question_text": "Simplify: √98 - √32 + √50 सरल करें: √98 - √32 + √50",
        "option_a": "7√2",
        "option_b": "6√2",
        "option_c": "5√2",
        "option_d": "8√2",
        "correct_answer": "D",
        "explanation": "Break down each radical:\n√98 = √(49 × 2) = 7√2\n√32 = √(16 × 2) = 4√2\n√50 = √(25 × 2) = 5√2\nResult: 7√2 - 4√2 + 5√2 = 8√2."
    }),
    # 5. 13 Oct S3 Q51
    (p_13oct_id, 51, {
        "question_text": "Evaluate: 196² मान ज्ञात कीजिए: 196²",
        "option_a": "38496",
        "option_b": "38436",
        "option_c": "36466",
        "option_d": "38416",
        "correct_answer": "D",
        "explanation": "196² = (200 - 4)² = 200² - 2(200)(4) + 4² = 40000 - 1600 + 16 = 38416."
    })
]

for pid, qnum, payload in updates:
    if not pid:
        print(f"Skipping Q{qnum} - paper ID not found!")
        continue
    res = requests.patch(
        f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}&question_number=eq.{qnum}",
        headers=HEADERS,
        json=payload
    )
    print(f"Patched Paper {pid} Q{qnum}: status={res.status_code}")

# Also update the local backup files
local_updates = [
    ("src/data/pyq_backup/ssc-cgl-2025-13-september-2025-shift-1.json", 53, updates[0][2]),
    ("src/data/pyq_backup/ssc-cgl-2025-13-september-2025-shift-2.json", 52, updates[1][2]),
    ("src/data/pyq_backup/ssc-cgl-2025-13-september-2025-shift-2.json", 53, updates[2][2]),
    ("src/data/pyq_backup/ssc-cgl-2025-15-september-2025-shift-2.json", 71, updates[3][2]),
    ("src/data/pyq_backup/ssc-cgl-2026-13-october-2026-shift-3.json", 51, updates[4][2]),
]

for filepath, qnum, payload in local_updates:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for q in data:
            if q.get('question_number') == qnum:
                q.update(payload)
                break
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Updated local file: {filepath} Q{qnum}")
    except Exception as e:
        print(f"Error updating {filepath}: {e}")

print("All missing math formulas patched successfully!")
