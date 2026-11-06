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


# Complete repair dictionary
# Key: (base_name, question_number)
# Value: dict of fields to update (option_a, option_b, option_c, option_d, optional question_text)
REPAIRS = {
    # 2026 Papers
    ("ssc-cgl-2026-1-october-2026-shift-1", 2): {
        "option_a": "1050 rupees",
        "option_b": "1020 rupees",
        "option_c": "1060 rupees",
        "option_d": "1080 rupees"
    },
    ("ssc-cgl-2026-1-october-2026-shift-1", 57): {
        "option_a": "₹32960",
        "option_b": "₹36960",
        "option_c": "₹26960",
        "option_d": "₹46520"
    },
    ("ssc-cgl-2026-1-october-2026-shift-2", 78): {
        "option_a": "had one witnessed, was",
        "option_b": "one had witnessed, was",
        "option_c": "had one witnessed, were",
        "option_d": "had witnessed one, were"
    },
    ("ssc-cgl-2026-1-october-2026-shift-3", 51): {
        "option_a": "5.5 cm",
        "option_b": "5.8 cm",
        "option_c": "6.5 cm",
        "option_d": "4.5 cm"
    },
    ("ssc-cgl-2026-1-october-2026-shift-3", 65): {
        "option_a": "20%",
        "option_b": "25%",
        "option_c": "35%",
        "option_d": "65%"
    },
    ("ssc-cgl-2026-10-october-2026-shift-1", 23): {
        "option_a": "ZEA",
        "option_b": "VDA",
        "option_c": "VEA",
        "option_d": "VCB"
    },
    ("ssc-cgl-2026-10-october-2026-shift-2", 40): {
        "option_a": "24",
        "option_b": "22",
        "option_c": "28",
        "option_d": "38"
    },
    ("ssc-cgl-2026-10-october-2026-shift-2", 73): {
        "option_a": "64 kg",
        "option_b": "68 kg",
        "option_c": "72 kg",
        "option_d": "92 kg"
    },
    ("ssc-cgl-2026-10-october-2026-shift-3", 80): {
        "option_a": "Poignat",
        "option_b": "Poinant",
        "option_c": "Poignnant",
        "option_d": "Poignant"
    },
    ("ssc-cgl-2026-12-october-2026-shift-1", 52): {
        "option_a": "39 cm",
        "option_b": "48 cm",
        "option_c": "42 cm",
        "option_d": "45 cm"
    },
    ("ssc-cgl-2026-12-october-2026-shift-1", 71): {
        "question_text": "In a right triangle XYZ with ∠Y = 90°, if ∠X = 2∠Z, find cos X.",
        "option_a": "1/2",
        "option_b": "√3/2",
        "option_c": "1/√2",
        "option_d": "√3"
    },
    ("ssc-cgl-2026-12-october-2026-shift-2", 10): {
        "option_a": "KM",
        "option_b": "KN",
        "option_c": "KQ",
        "option_d": "KP"
    },
    ("ssc-cgl-2026-12-october-2026-shift-2", 49): {
        "option_a": "10.7 (watt)",
        "option_b": "10 (watt)",
        "option_c": "12 (watt)",
        "option_d": "24 (watt)"
    },
    ("ssc-cgl-2026-12-october-2026-shift-2", 68): {
        "option_a": "10",
        "option_b": "12",
        "option_c": "7",
        "option_d": "8"
    },
    ("ssc-cgl-2026-12-october-2026-shift-2", 73): {
        "question_text": "If the minute hand of a clock rotates through an angle of 7π/6 radians, how many minutes does this represent?",
        "option_a": "30 minutes",
        "option_b": "35 minutes",
        "option_c": "40 minutes",
        "option_d": "45 minutes"
    },
    ("ssc-cgl-2026-13-october-2026-shift-2", 40): {
        "option_a": "22",
        "option_b": "24",
        "option_c": "26",
        "option_d": "30"
    },
    ("ssc-cgl-2026-13-october-2026-shift-2", 57): {
        "option_a": "$600",
        "option_b": "$500",
        "option_c": "$300",
        "option_d": "$200"
    },
    ("ssc-cgl-2026-13-october-2026-shift-2", 73): {
        "option_a": "70 units; January",
        "option_b": "60 units; January",
        "option_c": "60 units; February",
        "option_d": "70 units; February"
    },
    ("ssc-cgl-2026-13-october-2026-shift-3", 93): {
        "option_a": "Swati said to Kashvi, \"I learned to fly in order to come to terms with my fear of heights, and thought highly of humanity by meeting labourers at our local inn who led lives of destitution and worked on towers that were several feet tall.\"",
        "option_b": "Swati said to Kashvi, \"I learned to fly in order to come to terms with my fear of heights, and to think highly of humanity by having met labourers at our local inn who led lives of destitution and worked on towers that were several feet tall.\"",
        "option_c": "Swati said to Kashvi, \"I learned to fly in order to come to terms with my fear of heights, and to think highly of humanity by meeting labourers at our local inn who led lives of destitution and worked on towers that were several feet tall.\"",
        "option_d": "Swati said to Kashvi, \"I learned to fly in order to come to terms with my fear of heights, and to think highly of humanity by meeting labourers at their local inn who led lives of destitution and worked on towers that were several feet tall.\""
    },
    ("ssc-cgl-2026-30-september-2026-shift-2", 70): {
        "question_text": "If x + 1/x = 3√2, then find the value of x/(x² - 1).",
        "option_a": "1/√14",
        "option_b": "1/√12",
        "option_c": "1/√18",
        "option_d": "1/√19"
    },
    ("ssc-cgl-2026-30-september-2026-shift-3", 70): {
        "option_a": "1 : 3",
        "option_b": "9 : 1",
        "option_c": "3 : 1",
        "option_d": "1 : 9"
    },
    ("ssc-cgl-2026-5-october-2026-shift-1", 57): {
        "option_a": "6",
        "option_b": "7",
        "option_c": "8",
        "option_d": "9"
    },
    ("ssc-cgl-2026-5-october-2026-shift-2", 2): {
        "option_a": "5 days",
        "option_b": "2 days",
        "option_c": "3 days",
        "option_d": "4 days"
    },
    ("ssc-cgl-2026-5-october-2026-shift-2", 26): {
        "option_a": "1 to 5",
        "option_b": "0 to 100",
        "option_c": "0 to 10",
        "option_d": "1 to 20"
    },
    ("ssc-cgl-2026-5-october-2026-shift-2", 55): {
        "option_a": "32 cm³",
        "option_b": "48 cm³",
        "option_c": "40 cm³",
        "option_d": "24 cm³"
    },
    ("ssc-cgl-2026-5-october-2026-shift-3", 7): {
        "option_a": "26",
        "option_b": "22",
        "option_c": "24",
        "option_d": "25"
    },
    ("ssc-cgl-2026-5-october-2026-shift-3", 48): {
        "option_a": "58",
        "option_b": "60",
        "option_c": "61",
        "option_d": "62"
    },
    ("ssc-cgl-2026-5-october-2026-shift-3", 57): {
        "option_a": "29.6% decrease",
        "option_b": "29.6% increase",
        "option_c": "18% decrease",
        "option_d": "12% decrease"
    },
    ("ssc-cgl-2026-6-october-2026-shift-1", 52): {
        "option_a": "28.25",
        "option_b": "19.65",
        "option_c": "23.06",
        "option_d": "26.15"
    },
    ("ssc-cgl-2026-6-october-2026-shift-1", 59): {
        "option_a": "4 m",
        "option_b": "1 m",
        "option_c": "1/2 m",
        "option_d": "2 m"
    },
    ("ssc-cgl-2026-6-october-2026-shift-1", 66): {
        "option_a": "1",
        "option_b": "5/3",
        "option_c": "1/2",
        "option_d": "2"
    },
    ("ssc-cgl-2026-6-october-2026-shift-1", 85): {
        "option_a": "Bullion",
        "option_b": "Bullian",
        "option_c": "Bulleon",
        "option_d": "Bulyon"
    },
    ("ssc-cgl-2026-6-october-2026-shift-2", 32): {
        "option_a": "5",
        "option_b": "4",
        "option_c": "7",
        "option_d": "6"
    },
    ("ssc-cgl-2026-6-october-2026-shift-2", 55): {
        "option_a": "520 cm²",
        "option_b": "304 cm²",
        "option_c": "380 cm²",
        "option_d": "440 cm²"
    },
    ("ssc-cgl-2026-6-october-2026-shift-2", 65): {
        "option_a": "3(√3 - 1) m",
        "option_b": "2(√3 + 1) m",
        "option_c": "(√3 + 1) m",
        "option_d": "3(√3 + 1) m"
    },
    ("ssc-cgl-2026-6-october-2026-shift-2", 71): {
        "option_a": "2π/3 radians",
        "option_b": "π/3 radians",
        "option_c": "π/2 radians",
        "option_d": "π/4 radians"
    },
    ("ssc-cgl-2026-6-october-2026-shift-3", 23): {
        "option_a": "Columns I, II and IV",
        "option_b": "Columns I, III and IV",
        "option_c": "Columns I, II and III",
        "option_d": "Columns I, III and V"
    },
    ("ssc-cgl-2026-6-october-2026-shift-3", 44): {
        "option_a": "Population stagnation",
        "option_b": "Negative growth",
        "option_c": "Population explosion",
        "option_d": "Zero growth"
    },
    ("ssc-cgl-2026-7-october-2026-shift-1", 9): {
        "option_a": "K11",
        "option_b": "M11",
        "option_c": "L11",
        "option_d": "N11"
    },
    ("ssc-cgl-2026-7-october-2026-shift-1", 32): {
        "option_a": "26th",
        "option_b": "25th",
        "option_c": "24th",
        "option_d": "27th"
    },
    ("ssc-cgl-2026-7-october-2026-shift-1", 53): {
        "option_a": "8",
        "option_b": "4",
        "option_c": "6",
        "option_d": "10"
    },
    ("ssc-cgl-2026-7-october-2026-shift-1", 68): {
        "option_a": "55°",
        "option_b": "75°",
        "option_c": "65°",
        "option_d": "85°"
    },
    ("ssc-cgl-2026-7-october-2026-shift-1", 70): {
        "option_a": "1/2",
        "option_b": "1/√2",
        "option_c": "1",
        "option_d": "√3/2"
    },
    ("ssc-cgl-2026-7-october-2026-shift-1", 73): {
        "option_a": "13.33%",
        "option_b": "10.00%",
        "option_c": "12.50%",
        "option_d": "15.00%"
    },
    ("ssc-cgl-2026-7-october-2026-shift-2", 16): {
        "option_a": "1 & 2",
        "option_b": "2 & 3",
        "option_c": "1 & 3",
        "option_d": "3 & 4"
    },
    ("ssc-cgl-2026-7-october-2026-shift-2", 44): {
        "option_a": "National Waterway-2",
        "option_b": "National Waterway-3",
        "option_c": "National Waterway-4",
        "option_d": "National Waterway-5"
    },
    ("ssc-cgl-2026-7-october-2026-shift-3", 7): {
        "option_a": "5 1 19 20 8",
        "option_b": "6 2 1 7 2 1 9",
        "option_c": "5 1 18 20 8",
        "option_d": "3 3 20 18 6"
    },
    ("ssc-cgl-2026-7-october-2026-shift-3", 53): {
        "option_a": "3 : 1",
        "option_b": "3 : 4",
        "option_c": "2 : 3",
        "option_d": "3 : 2"
    },
    ("ssc-cgl-2026-7-october-2026-shift-3", 65): {
        "option_a": "2.4",
        "option_b": "1.3",
        "option_c": "4.4",
        "option_d": "3.2"
    },
    ("ssc-cgl-2026-8-october-2026-shift-1", 60): {
        "option_a": "₹60,000",
        "option_b": "₹70,000",
        "option_c": "₹50,000",
        "option_d": "₹80,000"
    },
    ("ssc-cgl-2026-8-october-2026-shift-1", 85): {
        "option_a": "Synesthesia",
        "option_b": "Synesthasia",
        "option_c": "Synaesthesia",
        "option_d": "Synesthesya"
    },
    ("ssc-cgl-2026-8-october-2026-shift-2", 19): {
        "option_a": "Statement (A) is the cause and statement (B) is its effect.",
        "option_b": "Statement (B) is the cause and statement (A) is its effect.",
        "option_c": "Both statements (A) and (B) are independent causes.",
        "option_d": "Both statements (A) and (B) are effects of independent causes."
    },
    ("ssc-cgl-2026-8-october-2026-shift-2", 40): {
        "option_a": "7.26 kg",
        "option_b": "8.26 kg",
        "option_c": "9.26 kg",
        "option_d": "6.26 kg"
    },
    ("ssc-cgl-2026-8-october-2026-shift-3", 57): {
        "option_a": "52%",
        "option_b": "58%",
        "option_c": "55%",
        "option_d": "60%"
    },
    ("ssc-cgl-2026-8-october-2026-shift-3", 63): {
        "option_a": "140",
        "option_b": "170",
        "option_c": "180",
        "option_d": "160"
    },
    ("ssc-cgl-2026-8-october-2026-shift-3", 70): {
        "option_a": "0",
        "option_b": "1",
        "option_c": "-1",
        "option_d": "2"
    },
    ("ssc-cgl-2026-9-october-2026-shift-1", 52): {
        "option_a": "m = 3, n = 4",
        "option_b": "m = 1, n = 2",
        "option_c": "m = 1, n = 4",
        "option_d": "m = 2, n = 8"
    },
    ("ssc-cgl-2026-9-october-2026-shift-2", 15): {
        "option_a": "1 & 2",
        "option_b": "2 & 3",
        "option_c": "1 & 3",
        "option_d": "3 & 4"
    },
    ("ssc-cgl-2026-9-october-2026-shift-3", 3): {
        "option_a": "Increasing by 1",
        "option_b": "Increasing by 2",
        "option_c": "Increasing by 3",
        "option_d": "Decreasing by 2"
    },
    ("ssc-cgl-2026-9-october-2026-shift-3", 48): {
        "option_a": "Four pollutants",
        "option_b": "Three pollutants",
        "option_c": "Five pollutants",
        "option_d": "Seven pollutants"
    },
    ("ssc-cgl-2026-9-october-2026-shift-3", 52): {
        "option_a": "30°",
        "option_b": "45°",
        "option_c": "60°",
        "option_d": "90°"
    },
    ("ssc-cgl-2026-9-october-2026-shift-3", 65): {
        "option_a": "18.35%",
        "option_b": "24.35%",
        "option_c": "12.35%",
        "option_d": "28.35%"
    },
    ("ssc-cgl-2026-9-october-2026-shift-3", 82): {
        "option_a": "plumped for",
        "option_b": "cleaned over",
        "option_c": "banked on",
        "option_d": "plunged out"
    },
    ("ssc-cgl-2026-9-october-2026-shift-3", 90): {
        "option_a": "anomolous",
        "option_b": "anamolous",
        "option_c": "anomalous",
        "option_d": "anomulous"
    },
    
    # 2025 Papers
    ("ssc-cgl-2025-13-september-2025-shift-1", 68): {
        "option_a": "67 1/21 cm² / 67 1/21 सेमी²",
        "option_b": "65 1/21 cm² / 65 1/21 सेमी²",
        "option_c": "48 cm² / 48 सेमी²",
        "option_d": "52 cm² / 52 सेमी²"
    },
    ("ssc-cgl-2025-13-september-2025-shift-2", 66): {
        "option_a": "8 days / 8 दिन",
        "option_b": "9 1/5 days / 9 1/5 दिन",
        "option_c": "9 3/5 days / 9 3/5 दिन",
        "option_d": "10 days / 10 दिन"
    },
    ("ssc-cgl-2025-17-september-2025-shift-2", 62): {
        "option_a": "64/3 π cm³ / 64/3 π सेमी³",
        "option_b": "128/3 π cm³ / 128/3 π सेमी³",
        "option_c": "216/3 π cm³ / 216/3 π सेमी³",
        "option_d": "256/3 π cm³ / 256/3 π सेमी³"
    }
}

print(f"Total repairs registered: {len(REPAIRS)}")

# Group repairs by base paper
papers = {}
for (base, qn), rep in REPAIRS.items():
    if base not in papers:
        papers[base] = {}
    papers[base][qn] = rep

print(f"Total papers affected: {len(papers)}")

total_applied = 0

BASE_TO_PAPER_ID = {
    # 2025
    "ssc-cgl-2025-13-september-2025-shift-1": 6,
    "ssc-cgl-2025-13-september-2025-shift-2": 7,
    "ssc-cgl-2025-17-september-2025-shift-2": 19,
    # 2026
    "ssc-cgl-2026-30-september-2026-shift-2": 25,
    "ssc-cgl-2026-30-september-2026-shift-3": 26,
    "ssc-cgl-2026-1-october-2026-shift-1": 27,
    "ssc-cgl-2026-1-october-2026-shift-2": 28,
    "ssc-cgl-2026-1-october-2026-shift-3": 29,
    "ssc-cgl-2026-5-october-2026-shift-1": 30,
    "ssc-cgl-2026-5-october-2026-shift-2": 31,
    "ssc-cgl-2026-5-october-2026-shift-3": 32,
    "ssc-cgl-2026-6-october-2026-shift-1": 33,
    "ssc-cgl-2026-6-october-2026-shift-2": 34,
    "ssc-cgl-2026-6-october-2026-shift-3": 35,
    "ssc-cgl-2026-7-october-2026-shift-1": 36,
    "ssc-cgl-2026-7-october-2026-shift-2": 37,
    "ssc-cgl-2026-7-october-2026-shift-3": 38,
    "ssc-cgl-2026-8-october-2026-shift-1": 39,
    "ssc-cgl-2026-8-october-2026-shift-2": 40,
    "ssc-cgl-2026-8-october-2026-shift-3": 41,
    "ssc-cgl-2026-9-october-2026-shift-1": 42,
    "ssc-cgl-2026-9-october-2026-shift-2": 43,
    "ssc-cgl-2026-9-october-2026-shift-3": 44,
    "ssc-cgl-2026-10-october-2026-shift-1": 45,
    "ssc-cgl-2026-10-october-2026-shift-2": 46,
    "ssc-cgl-2026-10-october-2026-shift-3": 47,
    "ssc-cgl-2026-12-october-2026-shift-1": 48,
    "ssc-cgl-2026-12-october-2026-shift-2": 49,
    "ssc-cgl-2026-12-october-2026-shift-3": 50,
    "ssc-cgl-2026-13-october-2026-shift-1": 51,
    "ssc-cgl-2026-13-october-2026-shift-2": 52,
    "ssc-cgl-2026-13-october-2026-shift-3": 53,
}

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
            
            # Update single question in Supabase
            update_payload = {k: v for k, v in rep.items()}
            url = f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{paper_id}&question_number=eq.{qn}"
            r = requests.patch(url, headers=HEADERS, json=update_payload)
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

        # Save to F Drive if 2026 paper
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
        
        print(f"  [Files Synced] {base} (Local JSON/TXT + F: Drive)")

print(f"\nALL DONE! Applied {total_applied} question repairs across {len(papers)} papers.")
