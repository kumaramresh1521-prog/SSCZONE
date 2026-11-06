import json, sys, os, requests
sys.stdout.reconfigure(encoding='utf-8')

env = {}
with open(r'c:\ssczone\.env.local', 'r') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

json_path = r'c:\ssczone\src\data\pyq_backup\ssc-cgl-2026-12-october-2026-shift-3.json'
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

paper_id = 50
base_name = 'ssc-cgl-2026-12-october-2026-shift-3'
img_base = f'/images/pyq/2026/{base_name}'

# Fix Q.14: The q14_fig.jpeg I extracted is actually a different question's figure.
# Q.14 is "Complete the pattern" and Figure(X) is a partial pattern matrix.
# Since original Figure(X) is unavailable (DIAGRAM_OR_GEOMETRIC in PDF),
# we should NOT link the wrong figure. Instead, clean the question text.
for q in data:
    if q['question_number'] == 14:
        old = q['question_text']
        # Clean: remove the incorrect figure link, keep descriptive text
        q['question_text'] = 'Complete the pattern in fig. (X) by selecting one of the figures from the four alternatives:\n\nFigure(X):'
        print(f"Q.14 fixed:")
        print(f"  OLD: {old}")
        print(f"  NEW: {q['question_text']}")
        break

# Also check Q.11 - keep the generic grid image (at least shows question type)
for q in data:
    if q['question_number'] == 11:
        print(f"\nQ.11 current: {q['question_text']}")
        # Keep as is - generic grid is acceptable
        break

# Save JSON
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("\nSaved local JSON")

# Save F: drive
f_path = r'F:\startup  send mail\2026\ssc-cgl-2026-12-october-2026-shift-3.json'
with open(f_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Saved F: drive JSON")

# Save TXTs
for txt_path in [
    r'c:\ssczone\src\data\pyq_backup\ssc-cgl-2026-12-october-2026-shift-3.txt',
    r'F:\startup  send mail\2026\ssc-cgl-2026-12-october-2026-shift-3.txt'
]:
    txt_lines = []
    for q in sorted(data, key=lambda x: x['question_number']):
        txt_lines.append(f"Q.{q['question_number']}: {q['question_text']}")
        txt_lines.append(f"A: {q['option_a']}")
        txt_lines.append(f"B: {q['option_b']}")
        txt_lines.append(f"C: {q['option_c']}")
        txt_lines.append(f"D: {q['option_d']}")
        txt_lines.append(f"ANS: {q['correct_answer']}")
        txt_lines.append("")
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(txt_lines))
    print(f"Saved TXT: {txt_path}")

# Update just Q.14 in Supabase
print("\nUpdating Q.14 in Supabase...")
for q in data:
    if q['question_number'] == 14:
        resp = requests.patch(
            f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{paper_id}&question_number=eq.14',
            headers=HEADERS,
            json={'question_text': q['question_text']}
        )
        print(f"UPDATE Q.14: {resp.status_code}")
        if resp.status_code not in [200, 204]:
            print(f"Error: {resp.text}")
        break

print("\nDone!")
