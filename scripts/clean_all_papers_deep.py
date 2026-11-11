import glob
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

def clean_hindi_artifacts(text):
    if not text:
        return text
    
    # Specific known Testbook ghost strings
    ghost_phrases = [
        "ि ि ल्पों मेंेीि ोि िखि मेंि ो ि ि",
        "ल्पों मेंेीि िखि मेंि",
        "ि ैी ेी ि रेंऔ",
        "र्केी ेी ि ी",
        "ि ी ी ी",
        "ीि ी ि ी ँे ी ेी ैी",
        "ेि ी ो ै",
        "ी ो ेि",
        "ि ैि",
        "ो ि",
        "ोि",
        "ो ि ि",
        "ेी ीि ि",
        "ेि ेि",
        "ि ि",
        "ीि",
        "ेी",
        "ोंों",
        "ेे",
        "ॉॉ",
        "ीी",
        "ांां",
        "िंं"
    ]
    
    for g in ghost_phrases:
        if g in text:
            # Replace double matra words
            if g == "ोंों":
                text = text.replace("ोंों", "ों")
            elif g == "ेे":
                text = text.replace("ेे", "े")
            elif g == "ॉॉ":
                text = text.replace("ॉॉ", "ॉ")
            elif g == "ीी":
                text = text.replace("ीी", "ी")
            elif g == "ांां":
                text = text.replace("ांां", "ां")
            elif g == "िंं":
                text = text.replace("िंं", "िंग")
            else:
                text = text.replace(g, "")

    # Clean isolated tokens made entirely of matras / modifier characters
    text = re.sub(r'(?:^|\s)[\u093E-\u094C\u0901-\u0903]+(?:\s+[\u093E-\u094C\u0901-\u0903]+)*(?=\s|$)', ' ', text)
    
    # Clean repeated Devanagari vowel signs (e.g. 2+ matras on the same character)
    text = re.sub(r'([\u093E-\u094C\u0901-\u0903])\1+', r'\1', text)
    
    # Fix common words
    text = text.replace("उन्होंोनेने", "उन्होंने")
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
    text = text.replace("सिद्धांांत", "सिद्धांत")
    text = text.replace("बास्केेटबॉल", "बास्केटबॉल")
    text = text.replace("सहीहै।", "सही है।")

    # Clean multiple spaces
    text = re.sub(r' +', ' ', text)
    return text.strip()

# Now let's fetch each paper from Supabase, clean all 100 questions, update Supabase, and re-export .txt and .json files
res = requests.get(f"{SUPABASE_URL}/rest/v1/previous_papers?order=id.asc", headers=HEADERS)
papers = res.json()

print(f"=== DEEP CLEANING & RE-EXPORTING {len(papers)} PAPERS ===")

dir_local = r"c:\ssczone\src\data\pyq_backup"
dir_e = r"E:\pyq pdf"

total_updated_questions = 0

for p in papers:
    pid = p['id']
    title = p['title']
    year = p.get('year', 2025)

    slug_match = title.lower().replace("tier-i", "").replace("tier 1", "").replace("held on", "").replace("(", "").replace(")", "").replace("_", " ")
    parts = [w for w in slug_match.split() if w]
    parts = ['september' if pt == 'sept' else pt for pt in parts]
    slug = "-".join(parts)
    if not slug.startswith("ssc-cgl"):
        slug = f"ssc-cgl-{slug}"

    res_q = requests.get(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}&order=question_number.asc", headers=HEADERS)
    questions = res_q.json()

    changed = False
    for q in questions:
        old_txt = q['question_text']
        new_txt = clean_hindi_artifacts(old_txt)
        if new_txt != old_txt:
            q['question_text'] = new_txt
            changed = True
            total_updated_questions += 1

        for lbl in ['a', 'b', 'c', 'd']:
            old_opt = q[f'option_{lbl}']
            new_opt = clean_hindi_artifacts(old_opt)
            if new_opt != old_opt:
                q[f'option_{lbl}'] = new_opt
                changed = True

    if changed:
        print(f"• Updating Paper ID {pid:2d} in Supabase ({title})...")
        requests.delete(f"{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.{pid}", headers=HEADERS)
        valid_cols = {"paper_id", "question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer", "question_number"}
        rows = [{k: v for k, v in {**q, "paper_id": pid}.items() if k in valid_cols} for q in questions]
        requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=rows[:50])
        requests.post(f"{SUPABASE_URL}/rest/v1/paper_questions", headers=HEADERS, json=rows[50:])

    # Re-export clean TXT
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

    print(f"✓ Cleaned & exported: {slug}.txt")

print(f"\nDEEP CLEAN FINISHED! Updated questions with ghost Hindi artifacts: {total_updated_questions}")
