import requests
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://rmobqopitkjobcnyqzru.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA"

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

dir_local = r"c:\ssczone\src\data\pyq_backup"
dir_e = r"E:\pyq pdf"
os.makedirs(dir_local, exist_ok=True)
os.makedirs(dir_e, exist_ok=True)

res = requests.get(f"{SUPABASE_URL}/rest/v1/previous_papers?order=id.asc", headers=HEADERS)
if not res.ok:
    print("Failed to fetch papers:", res.text)
    sys.exit(1)

papers = res.json()
print(f"Exporting {len(papers)} papers as .txt and .json files...")

exported_files = []

for p in papers:
    pid = p['id']
    title = p['title']
    year = p.get('year', 2025)
    
    # generate a clean slug
    # e.g., "SSC CGL 2025 Tier-I (Held On 12 Sept 2025 Shift 1)" -> "ssc-cgl-2025-12-september-2025-shift-1"
    slug_match = title.lower().replace("tier-i", "").replace("tier 1", "").replace("held on", "").replace("(", "").replace(")", "").replace("_", " ")
    parts = [w for w in slug_match.split() if w]
    # Standardize 'sept' to 'september'
    parts = ['september' if p == 'sept' else p for p in parts]
    slug = "-".join(parts)
    if not slug.startswith("ssc-cgl"):
        slug = f"ssc-cgl-{slug}"
    
    # fetch questions
    res_q = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}&order=question_number.asc", headers=HEADERS)
    if not res_q.ok:
        print(f"Error fetching questions for {pid}")
        continue
    
    questions = res_q.json()
    
    # Save formatted TXT
    txt_content = f"================================================================================\n"
    txt_content += f"{title.upper()}\n"
    txt_content += f"Exam: SSC CGL | Year: {year} | Total Questions: {len(questions)} | Duration: 60 Minutes\n"
    txt_content += f"Extracted & Verified from Official Answer Key via SSC ZONE (www.ssczone.in)\n"
    txt_content += f"================================================================================\n\n"

    for q in questions:
        txt_content += f"Q{q['question_number']}. {q['question_text']}\n"
        txt_content += f"A) {q['option_a']}\n"
        txt_content += f"B) {q['option_b']}\n"
        txt_content += f"C) {q['option_c']}\n"
        txt_content += f"D) {q['option_d']}\n"
        txt_content += f"Correct Answer: Option {q['correct_answer']}\n"
        if q.get("explanation"):
            txt_content += f"Explanation: {q['explanation']}\n"
        txt_content += f"--------------------------------------------------------------------------------\n\n"

    txt_path_local = os.path.join(dir_local, f"{slug}.txt")
    txt_path_e = os.path.join(dir_e, f"{slug}.txt")
    
    with open(txt_path_local, "w", encoding="utf-8") as f:
        f.write(txt_content)
    with open(txt_path_e, "w", encoding="utf-8") as f:
        f.write(txt_content)
        
    json_path_local = os.path.join(dir_local, f"{slug}.json")
    with open(json_path_local, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    exported_files.append({
        "id": pid,
        "title": title,
        "questions": len(questions),
        "txt_filename": f"{slug}.txt",
        "txt_path_local": txt_path_local,
        "txt_path_e": txt_path_e
    })
    print(f"✓ Paper ID {pid:2d}: {slug}.txt ({len(questions)} Qs)")

with open("tmp/exported_summary.json", "w", encoding="utf-8") as f:
    json.dump(exported_files, f, ensure_ascii=False, indent=2)

print("\nAll papers exported successfully!")
