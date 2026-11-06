import requests
import json
import os
import glob
import re
import sys

sys.path.append(os.path.abspath("."))
sys.stdout.reconfigure(encoding='utf-8')

env_path = ".env.local"
supabase_url = None
supabase_key = None

with open(env_path, "r", encoding="utf-8") as f:
    for line in f:
        if "NEXT_PUBLIC_SUPABASE_URL" in line and "=" in line:
            supabase_url = line.split("=", 1)[1].strip().strip('\"\'')
        if "SUPABASE_SERVICE_ROLE_KEY" in line and "=" in line:
            supabase_key = line.split("=", 1)[1].strip().strip('\"\'')

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

print("================================================================================")
print("VERIFYING 2026 PYQ PAPERS & QUESTIONS")
print("================================================================================")

# 1. Fetch 2026 papers from Supabase
res_p = requests.get(f"{supabase_url}/rest/v1/previous_papers?year=eq.2026&select=id,title,year,total_questions&order=id.asc", headers=headers)
papers = res_p.json() if res_p.ok else []
print(f"1. Total 2026 Papers in Supabase: {len(papers)} (Expected: 29)")

all_papers_100 = True
total_db_questions = 0
hindi_detected = 0

for p in papers:
    p_id = p["id"]
    p_title = p["title"]
    # Fetch questions count
    q_res = requests.get(f"{supabase_url}/rest/v1/paper_questions?paper_id=eq.{p_id}&select=id,question_number,question_text,option_a,option_b,option_c,option_d,correct_answer", headers=headers)
    q_data = q_res.json() if q_res.ok else []
    count = len(q_data)
    total_db_questions += count
    
    if count != 100:
        all_papers_100 = False
        print(f"  ❌ Paper ID {p_id} ('{p_title}'): {count} questions (Expected 100)!")
    else:
        # Check for any lingering Hindi
        for q in q_data:
            text_comb = f"{q['question_text']} {q['option_a']} {q['option_b']} {q['option_c']} {q['option_d']}"
            if any('\u0900' <= c <= '\u097F' for c in text_comb):
                hindi_detected += 1
                
print(f"   * Total 2026 Questions in Database: {total_db_questions} / 2900")
print(f"   * All 29 papers have exactly 100 questions: {all_papers_100}")
print(f"   * Hindi characters detected across all 2,900 questions: {hindi_detected} (Expected: 0)")

# 2. Check local and F: backups
txt_local = glob.glob(r"c:\ssczone\src\data\pyq_backup\ssc-cgl-2026-*.txt")
json_local = glob.glob(r"c:\ssczone\src\data\pyq_backup\ssc-cgl-2026-*.json")
txt_f = glob.glob(r"F:\startup  send mail\2026\ssc-cgl-2026-*.txt")
json_f = glob.glob(r"F:\startup  send mail\2026\ssc-cgl-2026-*.json")

print("\n2. File Backups:")
print(f"   * src/data/pyq_backup/: {len(txt_local)} TXT files, {len(json_local)} JSON files")
print(f"   * F:\\startup  send mail\\2026\\: {len(txt_f)} TXT files, {len(json_f)} JSON files")

# 3. Check public images
images = glob.glob(r"c:\ssczone\public\images\pyq\2026\*.*")
print(f"\n3. Extracted Figures & Diagrams in public/images/pyq/2026/: {len(images)} images")

print("\n================================================================================")
if len(papers) == 29 and all_papers_100 and total_db_questions == 2900 and hindi_detected == 0:
    print("✅ 100% VERIFICATION PASSED: ALL 29 PAPERS (2,900 QUESTIONS) LIVE IN SUPABASE!")
else:
    print("⚠️ VERIFICATION FOUND DISCREPANCIES!")
print("================================================================================")
