import os
import sys
import re
import json
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

    # Specific corrupted sequences
    text = text.replace("ि ैी ेी ि रेंऔ", "")
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
    text = text.replace("सहीहै।", "सही है।")

    # Generic duplicate Devanagari vowel signs
    devanagari_matras = r'([\u093E-\u094C\u0901-\u0903])\1+'
    text = re.sub(devanagari_matras, r'\1', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()

def patch_shift_3():
    print("--- PATCHING SSC CGL 2025 SHIFT 3 (Paper ID: 5) ---")
    json_path = r"C:\Users\Admin\Downloads\ssc-cgl-2025-12-september-2025-shift-3_bulk_import.json"
    with open(json_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    for q in questions:
        q_num = q["question_number"]

        # General text cleaning
        q["question_text"] = clean_hindi_text(q["question_text"])
        q["option_a"] = clean_hindi_text(q["option_a"])
        q["option_b"] = clean_hindi_text(q["option_b"])
        q["option_c"] = clean_hindi_text(q["option_c"])
        q["option_d"] = clean_hindi_text(q["option_d"])

        # Q50: Article 370 abrogation mechanism
        if q_num == 50:
            q["explanation"] = "Article 370 was abrogated through Constitution (Application to Jammu and Kashmir) Order, 2019 (C.O. 272) and subsequent Presidential declaration under Clause (3) of Article 370."

        # Q51: Ratio 60% A = 0.3 B = 1/6 C
        if q_num == 51:
            q["question_text"] = "If 60% of A = 0.3 of B = 1/6 of C, find A : B : C. यदि A का 60% = B का 0.3 = C का 1/6 है, तो A : B : C ज्ञात कीजिए।"
            q["option_a"] = "5 : 10 : 18"
            q["option_b"] = "18 : 10 : 5"
            q["option_c"] = "6 : 3 : 10"
            q["option_d"] = "10 : 5 : 18"
            q["correct_answer"] = "A"
            q["explanation"] = "Let 0.6A = 0.3B = C/6 = k. Then A = k/0.6 = 5k/3, B = k/0.3 = 10k/3, C = 6k = 18k/3. Multiplying throughout by 3/k gives A : B : C = 5 : 10 : 18."

        # Q53: Simplification with surds
        if q_num == 53:
            q["question_text"] = "Simplify: [1 / (√2 + 1)] + [1 / (√3 + √2)] – (√3 – 1) को सरल कीजिए।"
            q["option_a"] = "0"
            q["option_b"] = "1"
            q["option_c"] = "2"
            q["option_d"] = "√2"
            q["correct_answer"] = "A"
            q["explanation"] = "Rationalizing the denominators: 1/(√2 + 1) = √2 - 1, and 1/(√3 + √2) = √3 - √2. Adding both expressions: (√2 - 1) + (√3 - √2) = √3 - 1. Subtracting (√3 - 1) gives (√3 - 1) - (√3 - 1) = 0."

        # Q56: Partnership pasture rent (Horses, cows, sheep)
        if q_num == 56:
            q["option_a"] = "8/17"
            q["option_b"] = "9/17"
            q["option_c"] = "7/17"
            q["option_d"] = "10/17"
            q["correct_answer"] = "A"
            q["explanation"] = "Food consumption equivalence: 3 horses = 5 cows => 1 horse = 5/3 cows. 6 cows = 10 sheep => 1 sheep = 3/5 cows. A's grazing consumption = 21 * 6 * (5/3) + 15 * 2 = 210 + 30 = 240 cow-months. B's grazing consumption = 15 * 6 + 40 * 7.5 * (3/5) = 90 + 180 = 270 cow-months. Total consumption = 240 + 270 = 510 cow-months. A's portion of rent = 240 / 510 = 8/17."

        # Q57: Pasture rent portion (Cows and sheep)
        if q_num == 57:
            q["option_a"] = "44/89"
            q["option_b"] = "45/89"
            q["option_c"] = "42/89"
            q["option_d"] = "46/89"
            q["correct_answer"] = "A"
            q["explanation"] = "Equivalence: 4 cows = 8 sheep => 1 cow = 2 sheep. A's grazing units = (16 cows * 3 months * 2) + (20 sheep * 4 months) = 96 + 80 = 176 sheep-months. B's grazing units = 30 sheep * 6 months = 180 sheep-months. Total grazing units = 176 + 180 = 356 sheep-months. A's share of rent = 176 / 356 = 44/89."

        # Q75: Circle sector radians
        if q_num == 75:
            q["question_text"] = "A sector of a circle has a central angle of 120° and a radius of 7 cm. Another sector of the same circle has a central angle of 2π/3 radians. What is the ratio of the area of the first sector to the area of the second sector? एक वृत्त के एक त्रिज्यखंड का केंद्रीय कोण 120° और त्रिज्या 7 सेमी है। उसी वृत्त के एक अन्य त्रिज्यखंड का केंद्रीय कोण 2π/3 रेडियन है। पहले त्रिज्यखंड के क्षेत्रफल और दूसरे त्रिज्यखंड के क्षेत्रफल का अनुपात क्या है?"
            q["option_a"] = "3:5"
            q["option_b"] = "2:3"
            q["option_c"] = "1:1"
            q["option_d"] = "4:5"
            q["correct_answer"] = "C"
            q["explanation"] = "Converting 120° to radians: 120° × (π / 180°) = 2π/3 radians. Both sectors have the exact same radius (7 cm) and identical central angle (2π/3 radians = 120°), so their areas are identical. Hence, the ratio is 1:1."

    # Save to Downloads and local backup directory
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    backup_dir = r"c:\ssczone\src\data\pyq_backup"
    os.makedirs(backup_dir, exist_ok=True)
    backup_file = os.path.join(backup_dir, "ssc-cgl-2025-12-september-2025-shift-3.json")
    with open(backup_file, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"   ✓ Shift 3 JSON saved to: {json_path}")
    print(f"   ✓ Backup JSON saved to: {backup_file}")

    # Push to Supabase Paper ID: 5
    print("\n   • Syncing cleaned questions to Supabase Paper ID: 5...")
    requests.delete(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.5", headers=HEADERS)
    valid_cols = {"paper_id", "question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer", "question_number"}
    rows = [{k: v for k, v in {**q, "paper_id": 5}.items() if k in valid_cols} for q in questions]
    r1 = requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=rows[:50])
    r2 = requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=rows[50:])
    print(f"   ✓ Supabase Paper 5 updated: Chunk 1={r1.status_code}, Chunk 2={r2.status_code}")

    # Verify count in Supabase
    chk = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.5&select=count", headers={**HEADERS, 'Prefer': 'count=exact'})
    print(f"   ✓ Verification: {chk.headers.get('content-range', '')} questions in DB.")

if __name__ == "__main__":
    patch_shift_3()
    print("\n🎉 SHIFT 3 FULLY PATCHED, BEAUTIFIED & SYNCED!")
