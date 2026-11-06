import os
import glob
import json
import re
import sys
import requests

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r'c:\ssczone\src\data\pyq_backup'
f_drive = r'F:\startup  send mail\2026'

# Load Supabase credentials
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
    'Prefer': 'return=minimal'
}

paper_mapping = [
    (25, "ssc-cgl-2026-30-september-2026-shift-2"),
    (26, "ssc-cgl-2026-30-september-2026-shift-3"),
    (27, "ssc-cgl-2026-1-october-2026-shift-1"),
    (28, "ssc-cgl-2026-1-october-2026-shift-2"),
    (29, "ssc-cgl-2026-1-october-2026-shift-3"),
    (30, "ssc-cgl-2026-5-october-2026-shift-1"),
    (31, "ssc-cgl-2026-5-october-2026-shift-2"),
    (32, "ssc-cgl-2026-5-october-2026-shift-3"),
    (33, "ssc-cgl-2026-6-october-2026-shift-1"),
    (34, "ssc-cgl-2026-6-october-2026-shift-2"),
    (35, "ssc-cgl-2026-6-october-2026-shift-3"),
    (36, "ssc-cgl-2026-7-october-2026-shift-1"),
    (37, "ssc-cgl-2026-7-october-2026-shift-2"),
    (38, "ssc-cgl-2026-7-october-2026-shift-3"),
    (39, "ssc-cgl-2026-8-october-2026-shift-1"),
    (40, "ssc-cgl-2026-8-october-2026-shift-2"),
    (41, "ssc-cgl-2026-8-october-2026-shift-3"),
    (42, "ssc-cgl-2026-9-october-2026-shift-1"),
    (43, "ssc-cgl-2026-9-october-2026-shift-2"),
    (44, "ssc-cgl-2026-9-october-2026-shift-3"),
    (45, "ssc-cgl-2026-10-october-2026-shift-1"),
    (46, "ssc-cgl-2026-10-october-2026-shift-2"),
    (47, "ssc-cgl-2026-10-october-2026-shift-3"),
    (48, "ssc-cgl-2026-12-october-2026-shift-1"),
    (49, "ssc-cgl-2026-12-october-2026-shift-2"),
    (50, "ssc-cgl-2026-12-october-2026-shift-3"),
    (51, "ssc-cgl-2026-13-october-2026-shift-1"),
    (52, "ssc-cgl-2026-13-october-2026-shift-2"),
    (53, "ssc-cgl-2026-13-october-2026-shift-3"),
]

def clean_option(val):
    if not isinstance(val, str):
        return val
    s = val.strip()
    # Strip stray section headers
    s = re.sub(r'\s+GENERAL(?:\s+\d+\s+AWARENESS|\s+AWARENESS)?$', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\s+(?:QUANTITATIVE\s+APTITUDE|QUANTITATIVE|BASIC\s+ARITHMETIC\s+SKILL|BASIC\s+ARITHMETIC).*$', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\s+(?:ENGLISH\s+LANGUAGE|ENGLISH|BASIC\s+KNOWLEDGE).*$', '', s, flags=re.IGNORECASE)
    return s.strip()

def clean_question_text(qt):
    if not isinstance(qt, str):
        return qt
    s = qt.strip()
    # Remove trailing page numbers like "something's off. 9"
    s = re.sub(r'(\.|\?|\!)\s+\d{1,2}$', r'\1', s)
    return s.strip()

# Specific known fixes dict: (base_name, qn) -> {field: new_val}
specific_fixes = {
    # 1 Oct S2
    ("ssc-cgl-2026-1-october-2026-shift-2", 47): {
        "option_a": "1", "option_b": "2", "option_c": "1/4", "option_d": "1/2"
    },
    # 1 Oct S3
    ("ssc-cgl-2026-1-october-2026-shift-3", 36): {
        "option_a": "Gendi - Chhattisgarh"
    },
    ("ssc-cgl-2026-1-october-2026-shift-3", 54): {
        "option_a": "0 - 20"
    },
    # 10 Oct S1
    ("ssc-cgl-2026-10-october-2026-shift-1", 3): {
        "option_a": "Maternal Great-Grandmother"
    },
    # 12 Oct S1
    ("ssc-cgl-2026-12-october-2026-shift-1", 39): {
        "option_c": "Kottapuram-Kollam stretch",
        "option_d": "Kottapuram-Dhubri stretch"
    },
    # 13 Oct S2
    ("ssc-cgl-2026-13-october-2026-shift-2", 62): {
        "option_a": "2/13", "option_b": "5/13", "option_c": "11/13", "option_d": "12/13"
    },
    # 13 Oct S3
    ("ssc-cgl-2026-13-october-2026-shift-3", 56): {
        "option_b": "y = -3x - 7",
        "option_d": "y = 3x - 4"
    },
    # 5 Oct S1
    ("ssc-cgl-2026-5-october-2026-shift-1", 73): {
        "option_a": "x8 - 1", "option_c": "x4 - 1", "option_d": "x7 - 1"
    },
    # 8 Oct S2
    ("ssc-cgl-2026-8-october-2026-shift-2", 60): {
        "option_b": "Becomes one-fourth",
        "option_c": "Becomes one-ninth"
    },
    # 9 Oct S3
    ("ssc-cgl-2026-9-october-2026-shift-3", 40): {
        "option_a": "Shrestha Kabita - Dogri",
        "option_b": "Bhattkhadaki - Gujarati"
    },
    # 6 Oct S2
    ("ssc-cgl-2026-6-october-2026-shift-2", 74): {
        "option_a": "5/12", "option_b": "5/18", "option_c": "41/100", "option_d": "41/90"
    },
    # 10 Oct S2
    ("ssc-cgl-2026-10-october-2026-shift-2", 61): {
        "option_b": "18/5", "option_d": "5/18"
    },
    ("ssc-cgl-2026-10-october-2026-shift-2", 62): {
        "option_b": "14/3", "option_d": "10/3"
    },
    # 10 Oct S3
    ("ssc-cgl-2026-10-october-2026-shift-3", 68): {
        "option_b": "1/7", "option_d": "1/5"
    },
    # 12 Oct S2
    ("ssc-cgl-2026-12-october-2026-shift-2", 65): {
        "option_b": "7/18", "option_d": "18/7"
    },
    # 30 Sep S3
    ("ssc-cgl-2026-30-september-2026-shift-3", 56): {
        "option_b": "53/49", "option_d": "47/49"
    },
    # 5 Oct S1
    ("ssc-cgl-2026-5-october-2026-shift-1", 9): {
        "option_b": "3 3/4", "option_d": "7 6/8"
    },
    # 5 Oct S2
    ("ssc-cgl-2026-5-october-2026-shift-2", 66): {
        "option_b": "3 1/2", "option_d": "8 3/5"
    },
    # 6 Oct S2
    ("ssc-cgl-2026-6-october-2026-shift-2", 57): {
        "option_b": "13/7", "option_d": "18/7"
    },
    ("ssc-cgl-2026-6-october-2026-shift-2", 66): {
        "option_d": "4 2/5"
    },
    # 6 Oct S3
    ("ssc-cgl-2026-6-october-2026-shift-3", 62): {
        "option_b": "5 1/2"
    },
    # 7 Oct S1
    ("ssc-cgl-2026-7-october-2026-shift-1", 69): {
        "option_d": "56/65"
    },
    # 8 Oct S1
    ("ssc-cgl-2026-8-october-2026-shift-1", 48): {
        "option_b": "1/3", "option_d": "2/3"
    },
    # 8 Oct S2
    ("ssc-cgl-2026-8-october-2026-shift-2", 65): {
        "option_b": "3 3/5"
    },
    # 9 Oct S1
    ("ssc-cgl-2026-9-october-2026-shift-1", 64): {
        "option_b": "5/12", "option_d": "8/3"
    },
    ("ssc-cgl-2026-9-october-2026-shift-1", 65): {
        "option_b": "4/3", "option_d": "1/3"
    },
    # 9 Oct S2
    ("ssc-cgl-2026-9-october-2026-shift-2", 62): {
        "option_b": "5/12", "option_d": "12/5"
    },
    ("ssc-cgl-2026-9-october-2026-shift-2", 70): {
        "option_b": "3/4", "option_d": "5/3"
    },
    # 30 Sep S2
    ("ssc-cgl-2026-30-september-2026-shift-2", 68): {
        "option_d": "16/25"
    },
}

total_repaired = 0

for pid, base in paper_mapping:
    local_json_path = os.path.join(backup_dir, f"{base}.json")
    with open(local_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    changes_in_paper = 0

    for q in data:
        qn = q['question_number']

        # 1. Clean question text
        old_qt = q['question_text']
        new_qt = clean_question_text(old_qt)
        if new_qt != old_qt:
            q['question_text'] = new_qt
            changes_in_paper += 1

        # 2. Clean options (remove stray headers)
        for opt in ['option_a', 'option_b', 'option_c', 'option_d']:
            old_opt = q[opt]
            new_opt = clean_option(old_opt)
            if new_opt != old_opt:
                q[opt] = new_opt
                changes_in_paper += 1

        # 3. Apply specific verified fixes
        if (base, qn) in specific_fixes:
            fixes = specific_fixes[(base, qn)]
            for field, val in fixes.items():
                if q[field] != val:
                    q[field] = val
                    changes_in_paper += 1

    # Save to Local JSON
    with open(local_json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Save to F: Drive JSON
    f_json_path = os.path.join(f_drive, f"{base}.json")
    with open(f_json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Generate and save TXTs
    txt_lines = []
    for q in sorted(data, key=lambda x: x['question_number']):
        txt_lines.append(f"Q.{q['question_number']}: {q['question_text']}")
        txt_lines.append(f"A: {q['option_a']}")
        txt_lines.append(f"B: {q['option_b']}")
        txt_lines.append(f"C: {q['option_c']}")
        txt_lines.append(f"D: {q['option_d']}")
        txt_lines.append(f"ANS: {q['correct_answer']}")
        txt_lines.append("")
    txt_content = "\n".join(txt_lines)

    local_txt_path = os.path.join(backup_dir, f"{base}.txt")
    with open(local_txt_path, 'w', encoding='utf-8') as f:
        f.write(txt_content)

    f_txt_path = os.path.join(f_drive, f"{base}.txt")
    with open(f_txt_path, 'w', encoding='utf-8') as f:
        f.write(txt_content)

    # Sync to Supabase `paper_questions`
    del_resp = requests.delete(
        f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}',
        headers=HEADERS
    )
    
    # Insert in 2 chunks of 50
    chunk_size = 50
    inserted_paper = 0
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i+chunk_size]
        rows = []
        for q in chunk:
            row = {
                'paper_id': pid,
                'question_number': q['question_number'],
                'question_text': q['question_text'],
                'option_a': q['option_a'],
                'option_b': q['option_b'],
                'option_c': q['option_c'],
                'option_d': q['option_d'],
                'correct_answer': q['correct_answer'],
            }
            if 'explanation' in q:
                row['explanation'] = q.get('explanation', '')
            if 'subject' in q:
                row['subject'] = q.get('subject', '')
            rows.append(row)
        ins_resp = requests.post(f'{SUPABASE_URL}/rest/v1/paper_questions', headers=HEADERS, json=rows)
        if ins_resp.status_code in [200, 201]:
            inserted_paper += len(rows)

    print(f"[{pid:02d}/53] {base}: {changes_in_paper} fixes applied | DB: {inserted_paper}/100 synced")
    total_repaired += changes_in_paper

print(f"\n==========================================")
print(f"MASTER REPAIR COMPLETE: {total_repaired} total fixes applied across all 29 papers!")
print(f"All 29 papers synced to Local JSON/TXT, F: Drive JSON/TXT, and Supabase DB!")
print(f"==========================================")
