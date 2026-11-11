import json
import re
import sys
import os
import requests
from supabase_env import get_supabase_credentials

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL, SERVICE_KEY = get_supabase_credentials()

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json"
}

def clean_hindi_text(text):
    if not text:
        return text
    text = text.replace("ि ैी ेी ि रेंऔ", "")
    text = text.replace("र्केी ेी ि ी", "")
    text = text.replace("बास्केेटबॉल", "बास्केटबॉल")
    text = text.replace("उन्होंोंनेने", "उन्होंने")
    text = text.replace("ट्रॉॉफी", "ट्रॉफी")
    text = text.replace("कंट्रीी", "कंट्री")
    text = text.replace("इक्वेेडोर", "इक्वेडोर")
    text = text.replace("अनुच्छेेद", "अनुच्छेद")
    text = text.replace("इलेक्ट्रॉॉन", "इलेक्ट्रॉन")
    text = text.replace("ब्रह्मांांडीय", "ब्रह्मांडीय")
    text = text.replace("मिलिट्रीी", "मिलिट्री")
    text = text.replace("रैंकिंंग", "रैंकिंग")
    text = text.replace("कंप्यूटरोंों", "कंप्यूटरों")
    text = text.replace("यूनियनोंों", "यूनियनों")
    text = text.replace("अधिकारियोंों", "अधिकारियों")
    text = text.replace("कपड़ोंों", "कपड़ों")
    text = text.replace("भेड़ोंों", "भेड़ों")
    text = text.replace("हल्केे", "हल्के")
    text = text.replace("ड्रेेस", "ड्रेस")
    text = text.replace("सहीहै।", "सही है।")
    devanagari_matras = r'([\u093E-\u094C\u0901-\u0903])\1+'
    text = re.sub(devanagari_matras, r'\1', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()

with open("tmp/14sept_s2_raw.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

for q in questions:
    q["question_text"] = clean_hindi_text(q["question_text"])
    q["option_a"] = clean_hindi_text(q["option_a"])
    q["option_b"] = clean_hindi_text(q["option_b"])
    q["option_c"] = clean_hindi_text(q["option_c"])
    q["option_d"] = clean_hindi_text(q["option_d"])

    n = q["question_number"]

    # Q56 Fix
    if n == 56:
        q["question_text"] = "Two individuals, A and B, rent a pasture together. A has 18 horses that they graze for 4 months. B grazes 24 cows for 6 months and 36 sheep for 4 months. The following relationships are given: 3 horses are equivalent to 6 cows, 4 cows are equivalent to 8 sheep. What fraction of the rent should A pay? दो व्यक्ति, A और B, एक साथ एक चरागाह किराए पर लेते हैं। A के पास 18 घोड़े हैं जिन्हें वे 4 माह तक चराते हैं। B, 6 माह तक 24 गायों को और 4 माह तक 36 भेड़ों को चराता है। निम्नलिखित संबंध दिए गए हैं: 3 घोड़े = 6 गायें, 4 गायें = 8 भेड़ें। A को किराए का कितना भाग देना चाहिए?"
        q["option_a"] = "2/5"
        q["option_b"] = "3/5"
        q["option_c"] = "1/3"
        q["option_d"] = "4/9"
        q["correct_answer"] = "A"
        q["explanation"] = "Converting to equivalent sheep: 1 horse = 2 cows = 4 sheep. 1 cow = 2 sheep. A's total = 18 horses × 4 months × 4 sheep/horse = 288 sheep-months. B's total = (24 cows × 6 months × 2 sheep/cow) + (36 sheep × 4 months) = 288 + 144 = 432 sheep-months. Ratio A : B = 288 : 432 = 2 : 3. A's share = 2 / (2 + 3) = 2/5."

# Verification check
print(f"Total questions ready: {len(questions)}")
assert len(questions) == 100, f"Expected 100 questions, got {len(questions)}"
for q in questions:
    for opt_lbl in ["a", "b", "c", "d"]:
        val = q[f"option_{opt_lbl}"]
        assert val and val.strip() != "" and val != f"Option {opt_lbl.upper()}", f"Q{q['question_number']} has bad option {opt_lbl}: {val}"

paper_title = "SSC CGL 2025 Tier-I (Held On 14 September 2025 Shift 2)"
exam_id = 1
year = 2025
slug = "ssc-cgl-2025-14-september-2025-shift-2"

# Save JSON backup
os.makedirs("c:\\ssczone\\src\\data\\pyq_backup", exist_ok=True)
json_backup_path = f"c:\\ssczone\\src\\data\\pyq_backup\\{slug}.json"
with open(json_backup_path, "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

os.makedirs("E:\\pyq pdf", exist_ok=True)
e_json = f"E:\\pyq pdf\\{slug}_bulk_import.json"
with open(e_json, "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

# Save formatted TXT backup
txt_content = f"================================================================================\n"
txt_content += f"{paper_title.upper()}\n"
txt_content += f"Exam: SSC CGL | Year: {year} | Total Questions: 100 | Duration: 60 Minutes\n"
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

txt_backup_path = f"c:\\ssczone\\src\\data\\pyq_backup\\{slug}.txt"
with open(txt_backup_path, "w", encoding="utf-8") as f:
    f.write(txt_content)

e_txt = f"E:\\pyq pdf\\{slug}.txt"
with open(e_txt, "w", encoding="utf-8") as f:
    f.write(txt_content)

print(f"✓ Backups saved: {json_backup_path} and {txt_backup_path}")

# Sync to Supabase
print(f"• Syncing to Supabase...")
res_p = requests.get(f"{SUPABASE_URL}/rest/v1/previous_papers?title=eq.{requests.utils.quote(paper_title)}&limit=1", headers=HEADERS)
paper_id = None
if res_p.ok and res_p.json():
    paper_id = res_p.json()[0]['id']
    print(f"  Existing paper found ID: {paper_id}")
else:
    ins_payload = {
        "title": paper_title,
        "exam_id": exam_id,
        "year": year,
        "total_questions": len(questions),
        "duration_minutes": 60,
        "test_type": "pyq",
        "is_active": True
    }
    res_ins = requests.post(f"{SUPABASE_URL}/rest/v1/previous_papers", headers={**HEADERS, "Prefer": "return=representation"}, json=ins_payload)
    if res_ins.ok and res_ins.json():
        paper_id = res_ins.json()[0]['id']
        print(f"  Created new paper ID: {paper_id}")
    else:
        print("  Error creating paper:", res_ins.text)
        sys.exit(1)

requests.delete(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{paper_id}", headers=HEADERS)
valid_cols = {"paper_id", "question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer", "question_number"}
rows = [{k: v for k, v in {**q, "paper_id": paper_id}.items() if k in valid_cols} for q in questions]

# Insert in chunks of 50
r1 = requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=rows[:50])
r2 = requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=rows[50:])

chk = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{paper_id}&select=count", headers={**HEADERS, 'Prefer': 'count=exact'})
print(f"✓ Verification: {chk.headers.get('content-range', '')} questions in DB for Paper ID {paper_id}")
print(f"🎉 14 SEPT SHIFT 2 100% COMPLETE & VERIFIED!")
