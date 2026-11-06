import fitz
import re
import os
import sys
import glob
import json
import urllib.parse
import requests

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

pdf_dir = r"F:\startup  send mail\2026"
img_dir = r"c:\ssczone\public\images\pyq\2026"
backup_dir = r"c:\ssczone\src\data\pyq_backup"
os.makedirs(img_dir, exist_ok=True)
os.makedirs(backup_dir, exist_ok=True)

# 1. Fetch all 2026 papers from Supabase
res_p = requests.get(f"{supabase_url}/rest/v1/previous_papers?year=eq.2026&select=id,title&order=id.asc", headers=headers)
papers = res_p.json() if res_p.ok else []

# Map title to PDF path
pdf_files = glob.glob(os.path.join(pdf_dir, "*.pdf"))
title_to_pdf = {}
for pf in pdf_files:
    fname = os.path.basename(pf)
    m = re.search(r"Held On_?\s*(\d{1,2})\s*([A-Za-z]+)\s*2026\s*Shift\s*(\d)", fname, re.I)
    if m:
        day = m.group(1)
        month_raw = m.group(2)
        month = "September" if "sep" in month_raw.lower() else "October"
        shift_num = m.group(3)
        shift_title = f"{day} {month} 2026 Shift {shift_num}"
    else:
        shift_title = fname.replace(".pdf", "").replace("SSC CGL 2026 (Held On_ ", "").replace(")", "")
    paper_title = f"SSC CGL 2026 Tier-I (Held On {shift_title})"
    title_to_pdf[paper_title] = pf

def crop_options_for_question(doc, slug, target_qn):
    for p_idx in range(1, len(doc)):
        page = doc[p_idx]
        words = page.get_text("words")
        
        q_start = None
        for w in words:
            if re.match(r"^0?" + str(target_qn) + r"\.$", w[4]):
                q_start = w
                break
        if not q_start:
            continue
            
        col = 0 if (q_start[0]+q_start[2])/2 < 305 else 1
        x_min = 60 if col == 0 else 300
        x_max = 298 if col == 0 else 535
        
        col_words = [w for w in words if x_min <= (w[0]+w[2])/2 <= x_max and w[1] >= q_start[1] - 5]
        
        opt_words = {}
        ans_word = None
        for w in col_words:
            m = re.match(r"^\(([A-D])\)$", w[4])
            if m:
                let = m.group(1)
                if let not in opt_words:
                    opt_words[let] = w
            elif w[4] == "Ans:":
                ans_word = w
                break
                
        if len(opt_words) >= 4 and ans_word:
            a_w = opt_words['A']
            b_w = opt_words['B']
            c_w = opt_words['C']
            d_w = opt_words['D']
            
            side_by_side = abs(a_w[1] - b_w[1]) < 8
            rects = {}
            if side_by_side:
                mid_x = (x_min + x_max) / 2
                y0_row1 = a_w[1] - 4
                y1_row1 = c_w[1] - 4
                y0_row2 = c_w[1] - 4
                y1_row2 = ans_word[1] - 4
                
                rects['A'] = fitz.Rect(a_w[2] + 2, y0_row1, mid_x, y1_row1)
                rects['B'] = fitz.Rect(b_w[2] + 2, y0_row1, x_max, y1_row1)
                rects['C'] = fitz.Rect(c_w[2] + 2, y0_row2, mid_x, y1_row2)
                rects['D'] = fitz.Rect(d_w[2] + 2, y0_row2, x_max, y1_row2)
            else:
                rects['A'] = fitz.Rect(a_w[2] + 2, a_w[1] - 4, x_max, b_w[1] - 4)
                rects['B'] = fitz.Rect(b_w[2] + 2, b_w[1] - 4, x_max, c_w[1] - 4)
                rects['C'] = fitz.Rect(c_w[2] + 2, c_w[1] - 4, x_max, d_w[1] - 4)
                rects['D'] = fitz.Rect(d_w[2] + 2, d_w[1] - 4, x_max, ans_word[1] - 4)
                
            res_urls = {}
            for let, r in rects.items():
                if r.y1 > r.y0 + 5 and r.x1 > r.x0 + 10:
                    pix = page.get_pixmap(clip=r, dpi=150)
                    out_name = f"{slug}_q{target_qn}_opt_{let}.png"
                    out_path = os.path.join(img_dir, out_name)
                    pix.save(out_path)
                    res_urls[let] = f"/images/pyq/2026/{out_name}"
            return res_urls
    return None

print("Scanning and patching questions...")
total_patched = 0

for p in papers:
    p_id = p["id"]
    p_title = p["title"]
    
    if p_title not in title_to_pdf:
        continue
    pdf_path = title_to_pdf[p_title]
    
    # Get paper questions
    res_q = requests.get(f"{supabase_url}/rest/v1/paper_questions?paper_id=eq.{p_id}&select=*&order=question_number.asc", headers=headers)
    questions = res_q.json() if res_q.ok else []
    
    # Check which questions need option patching
    flagged = []
    for q in questions:
        qn = q["question_number"]
        needs_patch = False
        for let in ['a', 'b', 'c', 'd']:
            val = q[f"option_{let}"].strip()
            if val == f"Option {let.upper()}" or not val:
                needs_patch = True
        if needs_patch:
            flagged.append(q)
            
    if not flagged:
        continue
        
    print(f"\n--- {p_title} ({len(flagged)} questions to patch) ---")
    doc = fitz.open(pdf_path)
    
    m = re.search(r"Held On_?\s*(\d{1,2})\s*([A-Za-z]+)\s*2026\s*Shift\s*(\d)", os.path.basename(pdf_path), re.I)
    if m:
        day = m.group(1)
        month_raw = m.group(2)
        month = "September" if "sep" in month_raw.lower() else "October"
        shift_num = m.group(3)
        shift_title = f"{day} {month} 2026 Shift {shift_num}"
    else:
        shift_title = os.path.basename(pdf_path).replace(".pdf", "")
    slug = f"ssc-cgl-2026-{shift_title.lower().replace(' ', '-')}"
    
    for q in flagged:
        qn = q["question_number"]
        q_db_id = q["id"]
        
        opt_urls = crop_options_for_question(doc, slug, qn)
        if opt_urls and len(opt_urls) >= 4:
            update_payload = {}
            for let in ['A', 'B', 'C', 'D']:
                url = opt_urls[let]
                current_val = q[f"option_{let.lower()}"].strip()
                if current_val == f"Option {let}" or not current_val:
                    update_payload[f"option_{let.lower()}"] = f"![Option {let}]({url})"
                elif not current_val.endswith(")"):
                    update_payload[f"option_{let.lower()}"] = f"{current_val} ![Option {let}]({url})"
                    
            # Update Supabase
            res_up = requests.patch(f"{supabase_url}/rest/v1/paper_questions?id=eq.{q_db_id}", headers=headers, json=update_payload)
            if res_up.ok:
                print(f"  ✓ Successfully patched Q.{qn} in Supabase!")
                total_patched += 1
                # Update in memory
                for k, v in update_payload.items():
                    q[k] = v
            else:
                print(f"  ❌ Error updating Q.{qn}: {res_up.text}")
                
    # Update local and F: TXT and JSON backups
    txt_content = f"================================================================================\n"
    txt_content += f"{p_title.upper()}\n"
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

print(f"\n================================================================================")
print(f"ALL PATCHING COMPLETED: Patched {total_patched} questions!")
print(f"================================================================================")
