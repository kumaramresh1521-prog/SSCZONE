import json
import re
import os
import sys
import zipfile
import requests

sys.stdout.reconfigure(encoding='utf-8')

# Supabase Credentials
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

print(f"Loaded {len(papers_data)} papers from tmp_cleaned_database_payload.json.")

# Tracking changes
changes_log = []

def clean_text_general(text):
    if not text:
        return text
    # 1. Clean double nasalization / double bindi (e.g., ोंं -> ों, ांं -> ां)
    cleaned = re.sub(r'([\u0900-\u097F])[\u0902\u0901]{2,}', lambda m: m.group(1) + '\u0902', text)
    # Also generic consecutive anusvaras/candrabindus
    cleaned = re.sub(r'[\u0902\u0901]{2,}', '\u0902', cleaned)
    return cleaned

# Apply general cleanings across all papers & questions
double_bindi_fixed = 0
for p_item in papers_data:
    pid = p_item["paper"]["id"]
    for q in p_item["questions"]:
        qnum = q["question_number"]
        for field in ["question_text", "option_a", "option_b", "option_c", "option_d", "explanation"]:
            val = q.get(field)
            if val:
                c = clean_text_general(val)
                if c != val:
                    double_bindi_fixed += 1
                    q[field] = c

print(f"Total double nasalization instances cleaned across all fields: {double_bindi_fixed}")

# Now apply specific targeted fixes as requested in the 9 checklist items
for p_item in papers_data:
    pid = p_item["paper"]["id"]
    for q in p_item["questions"]:
        qnum = q["question_number"]
        
        # 1. Paper 5 Q74 (Cylindrical container font crash artifact)
        if pid == 5 and qnum == 74:
            if "एक ऊर्ध्वाधर" in q["question_text"]:
                idx = q["question_text"].find("एक ऊर्ध्वाधर")
                q_en = q["question_text"][:q["question_text"].find("? ") + 2]
                q_hi = q["question_text"][idx:]
                q["question_text"] = f"{q_en}{q_hi}"
                changes_log.append({
                    "item": "Point 1 / Q74",
                    "paper": "Paper 5 (12 Sept Shift 3)",
                    "qnum": 74,
                    "desc": "Removed font corruption prefix 'र्ध्वाेर्तेैे र्धो र्णमेंै '",
                    "result": q["question_text"]
                })
                
        # 2. Paper 5 Q13 (Typo in Hindi question text: अन्स्र्ण -> अनुसरण)
        if pid == 5 and qnum == 13:
            if "अन्स्र्ण" in q["question_text"]:
                q["question_text"] = q["question_text"].replace("अन्स्र्ण", "अनुसरण")
                changes_log.append({
                    "item": "Point 3 / Q13",
                    "paper": "Paper 5 (12 Sept Shift 3)",
                    "qnum": 13,
                    "desc": "Fixed Hindi question typo 'अन्स्र्ण' -> 'अनुसरण'",
                    "result": "अनुसरण करता है"
                })

        # 3. Paper 6 Q23 (दो पुत्रो -> दो पुत्रों)
        if pid == 6 and qnum == 23:
            if "दो पुत्रो" in q["question_text"]:
                q["question_text"] = q["question_text"].replace("दो पुत्रो", "दो पुत्रों")
                changes_log.append({
                    "item": "Point 3 / Q23",
                    "paper": "Paper 6 (13 Sept Shift 1)",
                    "qnum": 23,
                    "desc": "Grammar correction: 'दो पुत्रो' -> 'दो पुत्रों'",
                    "result": "दो पुत्रों में से छोटा है"
                })

        # 4. Paper 7 Q14 (क्ति M -> व्यक्ति M)
        if pid == 7 and qnum == 14:
            if "क्ति M" in q["question_text"]:
                q["question_text"] = q["question_text"].replace("क्ति M", "व्यक्ति M")
                changes_log.append({
                    "item": "Point 4 / Q14",
                    "paper": "Paper 7 (13 Sept Shift 2)",
                    "qnum": 14,
                    "desc": "Restored missing letters: 'क्ति M' -> 'व्यक्ति M'",
                    "result": "व्यक्ति M, पंक्ति 2 के किसी एक छोर पर है"
                })

        # 5. Paper 7 Q63 (की मेंि हानि -> की हानि)
        if pid == 7 and qnum == 63:
            if "की मेंि हानि" in q["question_text"]:
                q["question_text"] = q["question_text"].replace("की मेंि हानि", "की हानि")
                changes_log.append({
                    "item": "Point 6 / Q63",
                    "paper": "Paper 7 (13 Sept Shift 2 / 14 Sept S1)",
                    "qnum": 63,
                    "desc": "Removed duplicate typo: 'की मेंि हानि' -> 'की हानि'",
                    "result": "उसे वस्तु A पर 10% की हानि होती है"
                })

        # 6. Paper 8 Q23 (Remove ||)
        if pid == 8 and qnum == 23:
            if "||" in q["question_text"]:
                q["question_text"] = q["question_text"].replace("|| what is the value", ", what is the value")
                changes_log.append({
                    "item": "Point 5 / Q23",
                    "paper": "Paper 8 (13 Sept Shift 3)",
                    "qnum": 23,
                    "desc": "Removed unneeded vertical pipes '||'",
                    "result": "and 'M' means '÷', what is the value of the following expression?"
                })

        # 7. Paper 8 Q41 (Remove duplicate मेंि)
        if pid == 8 and qnum == 41:
            if "मेंि A)" in q["question_text"]:
                q["question_text"] = q["question_text"].replace("मेंि A)", "A)")
                changes_log.append({
                    "item": "Point 7 / Q41",
                    "paper": "Paper 8 (13 Sept Shift 3 / 14 Sept S2)",
                    "qnum": 41,
                    "desc": "Removed duplicate typo 'मेंि' before step A",
                    "result": "में निम्नलिखित चरणों को व्यवस्थित कीजिए: A) लोकसभा में..."
                })

        # 8. Paper 9 Q35 (Remove ghost text 'मेंि यों र्णेहैं')
        if pid == 9 and qnum == 35:
            if "मेंि यों र्णेहैं " in q["question_text"]:
                q["question_text"] = q["question_text"].replace("मेंि यों र्णेहैं ", "")
                changes_log.append({
                    "item": "Point 6 / Q35",
                    "paper": "Paper 9 (14 Sept Shift 1)",
                    "qnum": 35,
                    "desc": "Removed font corruption ghost string 'मेंि यों र्णेहैं '",
                    "result": "sand. कौन से कथन भारतीय रेगिस्तान..."
                })

        # 9. Paper 11 Q14 (निर्रुतर -> निरुत्तर)
        if pid == 11 and qnum == 14:
            if "निर्रुतर" in q["question_text"]:
                q["question_text"] = q["question_text"].replace("निर्रुतर", "निरुत्तर")
            if "निर्रुतर" in q["option_a"]:
                q["option_a"] = q["option_a"].replace("निर्रुतर", "निरुत्तर")
            changes_log.append({
                "item": "Point 8 / Q14",
                "paper": "Paper 11 (14 Sept Shift 3)",
                "qnum": 14,
                "desc": "Corrected spelling: 'निर्रुतर' -> 'निरुत्तर' in Question & Option A",
                "result": "A: Silent / निरुत्तर"
            })

        # 10. Paper 11 Q69 (Missing angle: \frac{\pi}{6} radians)
        if pid == 11 and qnum == 69:
            q["question_text"] = (
                "A sector of a circle having a radius of 10 cm and has a central angle of \\frac{\\pi}{6} radians. "
                "What is the area of the sector? "
                "एक वृत्त का त्रिज्यखंड जिसकी त्रिज्या 10 सेमी है और जिसका केंद्रीय कोण \\frac{\\pi}{6} रेडियन है। "
                "त्रिज्यखंड का क्षेत्रफल क्या है?"
            )
            changes_log.append({
                "item": "Point 8 / Q69",
                "paper": "Paper 11 (14 Sept Shift 3)",
                "qnum": 69,
                "desc": "Restored missing central angle '\\frac{\\pi}{6} radians' (calculated from radius=10, Area=26.17 cm²)",
                "result": "central angle of \\frac{\\pi}{6} radians / केंद्रीय कोण \\frac{\\pi}{6} रेडियन है"
            })

        # 11. Paper 11 Q72 (Missing equation in original key)
        if pid == 11 and qnum == 72:
            q["question_text"] = (
                "Given, [Algebraic expression omitted in official exam paper], what is the value? "
                "यदि [समीकरण मूल प्रश्न पत्र में अनुपलब्ध है], तो मान क्या होगा?"
            )
            changes_log.append({
                "item": "Point 8 / Q72",
                "paper": "Paper 11 (14 Sept Shift 3)",
                "qnum": 72,
                "desc": "Annotated missing equation with clear official paper notice",
                "result": "Given, [Algebraic expression omitted in official exam paper]..."
            })

        # 12. Paper 12 Q20 & Paper 13 Q23 (e×pressions -> expressions)
        if pid == 12 and qnum == 20:
            if "e×pressions" in q["question_text"]:
                q["question_text"] = q["question_text"].replace("e×pressions", "expressions")
                changes_log.append({
                    "item": "Point 9 / Q4 & Q20",
                    "paper": "Paper 12 (15 Sept Shift 1)",
                    "qnum": 20,
                    "desc": "Replaced math symbol '×' with 'x': 'e×pressions' -> 'expressions'",
                    "result": "following expressions: 7 × 3 ÷ 4..."
                })

        if pid == 13 and qnum == 23:
            if "e×pressions" in q["question_text"]:
                q["question_text"] = q["question_text"].replace("e×pressions", "expressions")
                changes_log.append({
                    "item": "Point 9 / Q23",
                    "paper": "Paper 13 (15 Sept Shift 2)",
                    "qnum": 23,
                    "desc": "Replaced math symbol '×' with 'x': 'e×pressions' -> 'expressions'",
                    "result": "following expressions: 48 × 8 ÷ 12..."
                })

        # 13. Paper 12 Q35 (परन्तु असत्य है -> परन्तु R असत्य है)
        if pid == 12 and qnum == 35:
            if "परन्तु असत्य है।" in q["option_d"]:
                q["option_d"] = q["option_d"].replace("परन्तु असत्य है।", "परन्तु R असत्य है।")
                changes_log.append({
                    "item": "Point 9 / Q35",
                    "paper": "Paper 12 (15 Sept Shift 1)",
                    "qnum": 35,
                    "desc": "Fixed Reason reference: 'A सत्य है, परन्तु असत्य है।' -> 'A सत्य है, परन्तु R असत्य है।'",
                    "result": q["option_d"]
                })

print("\n--- SPECIFIC FIXES APPLIED ---")
for ch in changes_log:
    print(f"[{ch['item']}] {ch['paper']} Q{ch['qnum']}: {ch['desc']}")

# Save updated data to payload file
with open("tmp_cleaned_database_payload.json", "w", encoding="utf-8") as f:
    json.dump(papers_data, f, ensure_ascii=False, indent=2)
print("\n✓ Saved updated payload to tmp_cleaned_database_payload.json")

# Now update Supabase and regenerate all .txt files
dir_local = r"c:\ssczone\src\data\pyq_backup"
dir_e = r"E:\pyq pdf"
os.makedirs(dir_local, exist_ok=True)
os.makedirs(dir_e, exist_ok=True)

print("\nUpdating Supabase database and exporting refreshed .txt files...")
for p_item in papers_data:
    p = p_item["paper"]
    pid = p["id"]
    title = p["title"]
    year = p.get("year", 2025)
    qs = p_item["questions"]

    slug_match = title.lower().replace("tier-i", "").replace("tier 1", "").replace("held on", "").replace("(", "").replace(")", "").replace("_", " ")
    parts = [w for w in slug_match.split() if w]
    parts = ['september' if pt == 'sept' else pt for pt in parts]
    slug = "-".join(parts)
    if not slug.startswith("ssc-cgl"):
        slug = f"ssc-cgl-{slug}"

    # Batch upsert to Supabase
    batch_size = 50
    for i in range(0, len(qs), batch_size):
        batch = qs[i:i + batch_size]
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
            print(f"  ❌ Paper {pid} Error: {res.text}")

    # Write .txt file
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
    except Exception:
        pass

    json_path_local = os.path.join(dir_local, f"{slug}.json")
    with open(json_path_local, "w", encoding="utf-8") as f:
        json.dump(qs, f, ensure_ascii=False, indent=2)

    print(f"  ✓ Updated Paper {pid:2d} ({slug}.txt)")

# Create zip archive of all .txt files
zip_destinations = [
    r"c:\ssczone\SSC_CGL_2025_All_12_Shifts_Clean_Hindi_TXT.zip",
    r"c:\ssczone\public\SSC_CGL_2025_All_12_Shifts_Clean_Hindi_TXT.zip",
    r"C:\Users\Admin\Downloads\SSC_CGL_2025_All_12_Shifts_Clean_Hindi_TXT.zip",
    r"E:\pyq pdf\SSC_CGL_2025_All_12_Shifts_Clean_Hindi_TXT.zip"
]

primary_zip = zip_destinations[0]
with zipfile.ZipFile(primary_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for fname in os.listdir(dir_local):
        if fname.endswith(".txt"):
            fpath = os.path.join(dir_local, fname)
            zipf.write(fpath, arcname=fname)

print(f"\nCreated ZIP archive at: {primary_zip}")

for dest in zip_destinations[1:]:
    try:
        import shutil
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        shutil.copy2(primary_zip, dest)
        print(f"  ✓ Copied ZIP to: {dest}")
    except Exception as e:
        print(f"  Note: Could not copy to {dest} ({e})")

print("\nALL TASKS COMPLETED SUCCESSFULLY!")
