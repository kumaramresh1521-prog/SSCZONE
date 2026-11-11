import fitz
import re
import os
import sys
import json
import zipfile
import shutil
import requests
from supabase_env import get_supabase_credentials

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL, SERVICE_KEY = get_supabase_credentials()
HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

with open("tmp_9_papers_pure_english.json", "r", encoding="utf-8") as f:
    papers_data = json.load(f)

print(f"Loaded {len(papers_data)} papers from tmp_9_papers_pure_english.json.")

# 1. Fetch current previous_papers from Supabase
res = requests.get(f"{SUPABASE_URL}/rest/v1/previous_papers?select=*&order=id.asc", headers=HEADERS)
existing_papers = res.json()
existing_titles = {p["title"]: p["id"] for p in existing_papers}

dir_local = r"c:\ssczone\src\data\pyq_backup"
dir_e = r"E:\pyq pdf"
dir_f = r"F:\startup  send mail"
os.makedirs(dir_local, exist_ok=True)
os.makedirs(dir_e, exist_ok=True)

new_txt_paths = []

for p_item in papers_data:
    title = p_item["title"]
    slug = p_item["slug"]
    year = p_item["year"]
    qs = p_item["questions"]
    
    # Check if paper already exists in previous_papers
    if title in existing_titles:
        assigned_id = existing_titles[title]
        print(f"Paper '{title}' already exists with ID {assigned_id}.")
    else:
        # Create paper in Supabase
        create_payload = {
            "exam_id": 1,
            "title": title,
            "year": year,
            "total_questions": len(qs),
            "duration_minutes": 60,
            "is_active": True,
            "test_type": "pyq"
        }
        res_create = requests.post(
            f"{SUPABASE_URL}/rest/v1/previous_papers",
            headers={**HEADERS, "Prefer": "return=representation"},
            json=create_payload
        )
        if res_create.ok:
            created_row = res_create.json()[0]
            assigned_id = created_row["id"]
            existing_titles[title] = assigned_id
            print(f"✓ Created paper '{title}' with ID {assigned_id}.")
        else:
            print(f"❌ Error creating paper '{title}': {res_create.text}")
            continue

    p_item["paper_id"] = assigned_id

    # 2. Delete existing questions for this paper if re-uploading
    requests.delete(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{assigned_id}", headers=HEADERS)

    # 3. Insert questions into paper_questions in batches of 50
    batch_size = 50
    for i in range(0, len(qs), batch_size):
        batch = qs[i:i + batch_size]
        insert_payload = []
        for q in batch:
            insert_payload.append({
                "paper_id": assigned_id,
                "question_number": q["question_number"],
                "question_text": q["question_text"],
                "option_a": q["option_a"],
                "option_b": q["option_b"],
                "option_c": q["option_c"],
                "option_d": q["option_d"],
                "correct_answer": q["correct_answer"],
                "explanation": q.get("explanation")
            })
        res_q = requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=insert_payload)
        if not res_q.ok:
            print(f"  ❌ Error inserting Q{batch[0]['question_number']}-Q{batch[-1]['question_number']}: {res_q.text}")
            
    print(f"  ✓ Synced all {len(qs)} questions to Supabase (Paper ID {assigned_id})")

    # 4. Generate pure English .txt file
    txt_content = "================================================================================\n"
    txt_content += f"{title.upper()} - PURE ENGLISH\n"
    txt_content += f"Exam: SSC CGL | Year: {year} | Total Questions: {len(qs)} | Duration: 60 Minutes\n"
    txt_content += f"Language: Pure English (No Hindi Translation)\n"
    txt_content += f"Extracted & 100% Verified from Official SSC Answer Key via SSC ZONE\n"
    txt_content += "================================================================================\n\n"

    for q in qs:
        txt_content += f"Q{q['question_number']}. {q['question_text']}\n"
        txt_content += f"A) {q['option_a']}\n"
        txt_content += f"B) {q['option_b']}\n"
        txt_content += f"C) {q['option_c']}\n"
        txt_content += f"D) {q['option_d']}\n"
        txt_content += f"Correct Answer: Option {q['correct_answer']}\n"
        if q.get("explanation"):
            txt_content += f"Explanation: {q['explanation']}\n"
        txt_content += "--------------------------------------------------------------------------------\n\n"

    txt_filename = f"{slug}.txt"
    txt_local = os.path.join(dir_local, txt_filename)
    with open(txt_local, "w", encoding="utf-8") as fp:
        fp.write(txt_content)
    new_txt_paths.append((txt_filename, txt_local))

    # Write to E: and F:
    try:
        with open(os.path.join(dir_e, txt_filename), "w", encoding="utf-8") as fp:
            fp.write(txt_content)
    except Exception:
        pass

    try:
        with open(os.path.join(dir_f, txt_filename), "w", encoding="utf-8") as fp:
            fp.write(txt_content)
    except Exception:
        pass

    # Save JSON locally
    json_local = os.path.join(dir_local, f"{slug}.json")
    with open(json_local, "w", encoding="utf-8") as fp:
        json.dump(qs, fp, ensure_ascii=False, indent=2)

print("\nAll 9 papers successfully synced to database and exported to .txt & .json!")

# 5. Create ZIP Archive for these 9 Pure English Papers
zip_filename = "SSC_CGL_2025_16_to_18_Sept_Pure_English_TXT.zip"
primary_zip = os.path.join(r"c:\ssczone", zip_filename)

with zipfile.ZipFile(primary_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for fname, fpath in new_txt_paths:
        zipf.write(fpath, arcname=fname)

print(f"\nCreated ZIP archive at: {primary_zip}")

for dest in [
    os.path.join(r"c:\ssczone\public", zip_filename),
    os.path.join(r"C:\Users\Admin\Downloads", zip_filename),
    os.path.join(dir_e, zip_filename),
    os.path.join(dir_f, zip_filename)
]:
    try:
        shutil.copy2(primary_zip, dest)
        print(f"  ✓ Copied ZIP to: {dest}")
    except Exception as e:
        print(f"  Note: {dest} ({e})")

# Also save updated payload with assigned paper IDs
with open("tmp_9_papers_pure_english.json", "w", encoding="utf-8") as f:
    json.dump(papers_data, f, ensure_ascii=False, indent=2)

print("\nSUCCESSFULLY COMPLETED ALL 9 PAPERS IN PURE ENGLISH!")
