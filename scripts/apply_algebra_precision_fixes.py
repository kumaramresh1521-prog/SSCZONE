import json
import os
import sys
import requests

sys.stdout.reconfigure(encoding='utf-8')

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

LOCAL_BACKUP_DIR = r"c:\ssczone\src\data\pyq_backup"
F_DRIVE_DIR = r"F:\startup  send mail\2026"

BASE_TO_PAPER_ID = {
    "ssc-cgl-2026-30-september-2026-shift-2": 25,
    "ssc-cgl-2026-1-october-2026-shift-1": 27,
    "ssc-cgl-2026-1-october-2026-shift-2": 28,
    "ssc-cgl-2026-5-october-2026-shift-1": 30,
    "ssc-cgl-2026-6-october-2026-shift-3": 35,
    "ssc-cgl-2026-7-october-2026-shift-1": 36,
    "ssc-cgl-2026-7-october-2026-shift-2": 37,
    "ssc-cgl-2026-9-october-2026-shift-3": 44,
    "ssc-cgl-2026-10-october-2026-shift-2": 46,
    "ssc-cgl-2026-13-october-2026-shift-2": 52,
    "ssc-cgl-2026-13-october-2026-shift-3": 53,
}

TARGET_FIXES = {
    ("ssc-cgl-2026-1-october-2026-shift-1", 75): {
        "option_a": "1 : 1",
        "option_b": "r : d",
        "option_c": "√(d² - 4r²) : d",
        "option_d": "2d : r"
    },
    ("ssc-cgl-2026-1-october-2026-shift-2", 52): {
        "option_a": "5 : 7",
        "option_b": "6 : 7",
        "option_c": "5 : 8",
        "option_d": "8 : 5"
    },
    ("ssc-cgl-2026-1-october-2026-shift-2", 57): {
        "option_a": "4 : 8 : 3",
        "option_b": "4 : 5 : 3",
        "option_c": "16 : 10 : 3",
        "option_d": "10 : 12 : 7"
    },
    ("ssc-cgl-2026-30-september-2026-shift-2", 53): {
        "option_a": "8x",
        "option_b": "2x + 4",
        "option_c": "10x",
        "option_d": "x²"
    },
    ("ssc-cgl-2026-5-october-2026-shift-1", 73): {
        "option_a": "x⁸ - 1",
        "option_b": "x⁸ + 1",
        "option_c": "x⁴ - 1",
        "option_d": "x⁷ - 1"
    },
    ("ssc-cgl-2026-5-october-2026-shift-1", 74): {
        "question_text": "A container has 160 litres of a mixture of milk and water in the ratio 5:3. First, 32 litres of the mixture are removed and replaced with an equal volume of pure water. Then, 24 litres of the resulting mixture are removed and replaced with an equal volume of pure milk. Find the final ratio of milk to water in the container.",
        "option_a": "63 : 17",
        "option_b": "24 : 13",
        "option_c": "15 : 11",
        "option_d": "23 : 17"
    },
    ("ssc-cgl-2026-6-october-2026-shift-3", 57): {
        "option_a": "Horizontal line at y = 5",
        "option_b": "Vertical line at x = 5",
        "option_c": "Line passing through the origin",
        "option_d": "Oblique line"
    },
    ("ssc-cgl-2026-7-october-2026-shift-1", 75): {
        "question_text": "Simplify the following nested radical expression completely: √(4 + 2√3)",
        "option_a": "√3 + 1",
        "option_b": "√3 - 1",
        "option_c": "2 + √3",
        "option_d": "1 - √3"
    },
    ("ssc-cgl-2026-7-october-2026-shift-2", 74): {
        "question_text": "A vessel contains 240 litres of a mixture of milk and water in the ratio 7:5. First, 40 litres of the mixture are removed and replaced with an equal volume of pure water. Then, 60 litres of the resulting mixture are removed and replaced with an equal volume of pure milk. Find the final ratio of milk to water in the vessel.",
        "option_a": "62 : 41",
        "option_b": "21 : 17",
        "option_c": "97 : 83",
        "option_d": "59 : 37"
    },
    ("ssc-cgl-2026-9-october-2026-shift-3", 40): {
        "option_c": "Padapurana - Telugu",
        "option_d": "Animesha - Odia"
    },
    ("ssc-cgl-2026-9-october-2026-shift-3", 61): {
        "question_text": "The value of [(2.4)³ − (0.4)³] / [(2.4)² + 0.96 + (0.4)²] expressed as a fraction in simplest form is:",
        "option_a": "1",
        "option_b": "5/2",
        "option_c": "3",
        "option_d": "2"
    },
    ("ssc-cgl-2026-10-october-2026-shift-2", 54): {
        "question_text": "A, B, and C start a business with investments in the ratio 3 : 2 : 4. After one year, A withdraws half of his capital and B doubles his capital. After one more year, C withdraws 1/4 of his capital. At the end of 3 years, what is the ratio of their profits?",
        "option_a": "6 : 10 : 11",
        "option_b": "10 : 18 : 15",
        "option_c": "9 : 14 : 22",
        "option_d": "14 : 11 : 19"
    },
    ("ssc-cgl-2026-10-october-2026-shift-2", 63): {
        "question_text": "If (√(7 + x) + √(7 − x)) / (√(7 + x) − √(7 − x)) = 5, then what is the value of x?",
        "option_a": "1",
        "option_b": "35/13",
        "option_c": "3",
        "option_d": "14/19"
    },
    ("ssc-cgl-2026-13-october-2026-shift-2", 53): {
        "option_a": "4 : 12 : 3",
        "option_b": "10 : 9 : 12",
        "option_c": "20 : 12 : 15",
        "option_d": "9 : 12 : 15"
    },
    ("ssc-cgl-2026-13-october-2026-shift-3", 56): {
        "option_a": "y = 3x + 4",
        "option_b": "y = -3x - 7",
        "option_c": "3y = x + 2",
        "option_d": "y = 3x - 4"
    }
}

print(f"Applying {len(TARGET_FIXES)} precision algebraic & formatting fixes...")

# Group by paper
papers = {}
for (base, qn), rep in TARGET_FIXES.items():
    if base not in papers:
        papers[base] = {}
    papers[base][qn] = rep

total_applied = 0

for base, q_map in sorted(papers.items()):
    local_json = os.path.join(LOCAL_BACKUP_DIR, f"{base}.json")
    if not os.path.exists(local_json):
        print(f"WARNING: {local_json} not found!")
        continue
    
    with open(local_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    paper_id = BASE_TO_PAPER_ID[base]
    paper_modified = False
    
    for q in data:
        qn = q['question_number']
        if qn in q_map:
            rep = q_map[qn]
            for k, v in rep.items():
                q[k] = v
            total_applied += 1
            paper_modified = True
            
            # DB update
            url = f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{paper_id}&question_number=eq.{qn}"
            r = requests.patch(url, headers=HEADERS, json=rep)
            if r.status_code not in (200, 204):
                print(f"  [DB ERROR] {base} Q.{qn}: {r.status_code} {r.text}")
            else:
                print(f"  [DB Updated] {base} Q.{qn}")

    if paper_modified:
        # Save local JSON
        with open(local_json, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        # Save local TXT
        local_txt = os.path.join(LOCAL_BACKUP_DIR, f"{base}.txt")
        with open(local_txt, 'w', encoding='utf-8') as f:
            for q in data:
                f.write(f"Q.{q['question_number']}: {q['question_text']}\n")
                f.write(f"A. {q['option_a']}\n")
                f.write(f"B. {q['option_b']}\n")
                f.write(f"C. {q['option_c']}\n")
                f.write(f"D. {q['option_d']}\n")
                f.write(f"Answer: {q['correct_answer']}\n\n")

        # Save F: Drive
        f_json = os.path.join(F_DRIVE_DIR, f"{base}.json")
        f_txt = os.path.join(F_DRIVE_DIR, f"{base}.txt")
        if os.path.exists(F_DRIVE_DIR):
            with open(f_json, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            with open(f_txt, 'w', encoding='utf-8') as f:
                for q in data:
                    f.write(f"Q.{q['question_number']}: {q['question_text']}\n")
                    f.write(f"A. {q['option_a']}\n")
                    f.write(f"B. {q['option_b']}\n")
                    f.write(f"C. {q['option_c']}\n")
                    f.write(f"D. {q['option_d']}\n")
                    f.write(f"Answer: {q['correct_answer']}\n\n")
        
        print(f"  [Files Synced] {base}")

print(f"\nSUCCESS! Applied {total_applied} precision fixes across {len(papers)} papers.")
