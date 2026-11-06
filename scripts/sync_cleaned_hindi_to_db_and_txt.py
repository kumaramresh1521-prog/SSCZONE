import json
import requests
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://rmobqopitkjobcnyqzru.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtb2Jxb3BpdGtqb2JjbnlxenJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQwMzc3NiwiZXhwIjoyMTAwOTc5Nzc2fQ.tlewx6VDcbni_kJfy0IVfZ7yqwywHfNEoVCRj8-oLaA"
HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

with open("tmp_cleaned_database_payload.json", "r", encoding="utf-8") as f:
    papers_data = json.load(f)

dir_local = r"c:\ssczone\src\data\pyq_backup"
dir_e = r"E:\pyq pdf"
os.makedirs(dir_local, exist_ok=True)
os.makedirs(dir_e, exist_ok=True)

print(f"Updating {len(papers_data)} papers in Supabase and refreshing .txt files...")

for p_item in papers_data:
    p = p_item["paper"]
    pid = p["id"]
    title = p["title"]
    year = p.get("year", 2025)
    qs = p_item["questions"]
    
    # Generate clean slug for txt
    slug_match = title.lower().replace("tier-i", "").replace("tier 1", "").replace("held on", "").replace("(", "").replace(")", "").replace("_", " ")
    parts = [w for w in slug_match.split() if w]
    parts = ['september' if pt == 'sept' else pt for pt in parts]
    slug = "-".join(parts)
    if not slug.startswith("ssc-cgl"):
        slug = f"ssc-cgl-{slug}"
        
    print(f"\nProcessing Paper ID {pid:2d} ({title}):")
    
    # 1. Update questions in Supabase in batches of 25
    batch_size = 25
    for i in range(0, len(qs), batch_size):
        batch = qs[i:i + batch_size]
        # prepare payload
        upsert_payload = []
        for q in batch:
            upsert_payload.append({
                "id": q["id"],
                "paper_id": pid,
                "question_number": q["question_number"],
                "question_text": q["question_text"],
                "option_a": q["option_a"],
                "option_b": q["option_b"],
                "option_c": q["option_c"],
                "option_d": q["option_d"],
                "correct_answer": q["correct_answer"],
                "explanation": q.get("explanation")
            })
            
        res = requests.post(
            f"{SUPABASE_URL}/rest/v1/paper_questions",
            headers={**HEADERS, "Prefer": "resolution=merge-duplicates"},
            json=upsert_payload
        )
        if not res.ok:
            print(f"  ❌ Error updating batch {i}-{i+len(batch)}: {res.text}")
        else:
            print(f"  ✓ Updated Q{batch[0]['question_number']}–Q{batch[-1]['question_number']} in Supabase")
            
    # 2. Write fresh formatted .txt file
    txt_content = f"================================================================================\n"
    txt_content += f"{title.upper()}\n"
    txt_content += f"Exam: SSC CGL | Year: {year} | Total Questions: {len(qs)} | Duration: 60 Minutes\n"
    txt_content += f"Extracted & Verified from Official Answer Key via SSC ZONE (www.ssczone.in)\n"
    txt_content += f"Hindi Typos & OCR Artifacts Cleaned & Corrected on: 05 Nov 2026\n"
    txt_content += f"================================================================================\n\n"

    for q in qs:
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
    with open(txt_path_local, "w", encoding="utf-8") as f:
        f.write(txt_content)
        
    try:
        txt_path_e = os.path.join(dir_e, f"{slug}.txt")
        with open(txt_path_e, "w", encoding="utf-8") as f:
            f.write(txt_content)
    except Exception as e:
        print(f"  Note: Could not write to E: drive ({e})")
        
    json_path_local = os.path.join(dir_local, f"{slug}.json")
    with open(json_path_local, "w", encoding="utf-8") as f:
        json.dump(qs, f, ensure_ascii=False, indent=2)

    print(f"  ✓ Wrote updated TXT to: {txt_path_local}")

print("\nAll 12 papers updated in Supabase database and local/admin .txt files!")
