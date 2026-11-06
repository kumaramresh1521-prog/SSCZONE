import requests
import json
import os
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

backup_dir = r"c:\ssczone\src\data\pyq_backup"
pdf_dir = r"F:\startup  send mail\2026"

# 1. 8 Oct Shift 2 (Paper 40) Q.6
payload1 = {
    "option_d": "I"
}
requests.patch(f"{supabase_url}/rest/v1/paper_questions?paper_id=eq.40&question_number=eq.6", headers=headers, json=payload1)
print("Updated Paper 40 Q.6 in Supabase.")

# 2. 10 Oct Shift 2 (Paper 46) Q.7
payload2 = {
    "question_text": "Which of the following is the unit digit in the product of {(241)491 x (435)317 x (3364)1793}?",
    "option_a": "8",
    "option_b": "7",
    "option_c": "0",
    "option_d": "5",
    "correct_answer": "C"
}
requests.patch(f"{supabase_url}/rest/v1/paper_questions?paper_id=eq.46&question_number=eq.7", headers=headers, json=payload2)
print("Updated Paper 46 Q.7 in Supabase.")

# 3. 10 Oct Shift 3 (Paper 47) Q.13
slug3 = "ssc-cgl-2026-10-october-2026-shift-3"
payload3 = {
    "question_text": f"Refer to the given figure / pattern:\n\n![Figure](/images/pyq/2026/{slug3}_q13_fig.png)",
    "option_a": f"![Option A](/images/pyq/2026/{slug3}_q13_opt_A.png)",
    "option_b": f"![Option B](/images/pyq/2026/{slug3}_q13_opt_B.png)",
    "option_c": f"![Option C](/images/pyq/2026/{slug3}_q13_opt_C.png)",
    "option_d": f"![Option D](/images/pyq/2026/{slug3}_q13_opt_D.png)",
    "correct_answer": "C"
}
requests.patch(f"{supabase_url}/rest/v1/paper_questions?paper_id=eq.47&question_number=eq.13", headers=headers, json=payload3)
print("Updated Paper 47 Q.13 in Supabase.")

# Now update the TXT and JSON backups for these 3 papers
for p_id, slug, title in [
    (40, "ssc-cgl-2026-8-october-2026-shift-2", "SSC CGL 2026 Tier-I (Held On 8 October 2026 Shift 2)"),
    (46, "ssc-cgl-2026-10-october-2026-shift-2", "SSC CGL 2026 Tier-I (Held On 10 October 2026 Shift 2)"),
    (47, "ssc-cgl-2026-10-october-2026-shift-3", "SSC CGL 2026 Tier-I (Held On 10 October 2026 Shift 3)")
]:
    res_q = requests.get(f"{supabase_url}/rest/v1/paper_questions?paper_id=eq.{p_id}&select=*&order=question_number.asc", headers=headers)
    questions = res_q.json() if res_q.ok else []
    
    txt_content = f"================================================================================\n"
    txt_content += f"{title.upper()}\n"
    txt_content += f"Exam: SSC CGL | Year: 2026 | Tier: Tier-I\n"
    txt_content += f"Total Questions: 100 | Duration: 60 Minutes\n"
    txt_content += f"Extracted from Official Answer Key via SSC ZONE (www.ssczone.in)\n"
    txt_content += f"Language: 100% Pure English\n"
    txt_content += f"================================================================================\n\n"
    
    for q_item in questions:
        txt_content += f"Q{q_item['question_number']}. {q_item['question_text']}\n"
        txt_content += f"A) {q_item['option_a']}\n"
        txt_content += f"B) {q_item['option_b']}\n"
        txt_content += f"C) {q_item['option_c']}\n"
        txt_content += f"D) {q_item['option_d']}\n"
        txt_content += f"Correct Answer: Option {q_item['correct_answer']}\n"
        txt_content += f"--------------------------------------------------------------------------------\n\n"
        
    txt_path_local = os.path.join(backup_dir, f"{slug}.txt")
    json_path_local = os.path.join(backup_dir, f"{slug}.json")
    txt_path_f = os.path.join(pdf_dir, f"{slug}.txt")
    json_path_f = os.path.join(pdf_dir, f"{slug}.json")
    
    with open(txt_path_local, "w", encoding="utf-8") as fp: fp.write(txt_content)
    with open(json_path_local, "w", encoding="utf-8") as fp: json.dump(questions, fp, indent=2, ensure_ascii=False)
    with open(txt_path_f, "w", encoding="utf-8") as fp: fp.write(txt_content)
    with open(json_path_f, "w", encoding="utf-8") as fp: json.dump(questions, fp, indent=2, ensure_ascii=False)
    print(f"Updated backups for {slug}.")

print("\nFinal 3 questions patched and backups updated!")
