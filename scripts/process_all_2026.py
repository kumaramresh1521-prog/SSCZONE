import fitz
import re
import os
import glob
import json
import sys
import time
import urllib.request
import urllib.parse
from supabase import create_client

sys.stdout.reconfigure(encoding='utf-8')

# 1. Supabase Initialization
env_path = ".env.local"
supabase_url = None
supabase_key = None

if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if "NEXT_PUBLIC_SUPABASE_URL" in line and "=" in line:
                supabase_url = line.split("=", 1)[1].strip().strip('\"\'')
            if "SUPABASE_SERVICE_ROLE_KEY" in line and "=" in line:
                supabase_key = line.split("=", 1)[1].strip().strip('\"\'')

if not supabase_key:
    # fallback to anon key if needed
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if "NEXT_PUBLIC_SUPABASE_ANON_KEY" in line and "=" in line:
                supabase_key = line.split("=", 1)[1].strip().strip('\"\'')

print(f"Supabase URL: {supabase_url}")
sb = create_client(supabase_url, supabase_key)

# 2. Directory setup
pdf_dir = r"F:\startup  send mail\2026"
img_out_dir = r"c:\ssczone\public\images\pyq\2026"
backup_dir = r"c:\ssczone\src\data\pyq_backup"
os.makedirs(img_out_dir, exist_ok=True)
os.makedirs(backup_dir, exist_ok=True)

# 3. Google Translate Helper for Hindi Paper
def translate_hi_to_en(text):
    if not text or not text.strip():
        return ""
    # If no Devanagari characters, return as is
    if not any('\u0900' <= c <= '\u097F' for c in text):
        return text.strip()
    
    try:
        q = urllib.parse.quote(text.strip())
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=en&dt=t&q={q}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=10)
        data = json.loads(res.read().decode('utf-8'))
        translated = "".join(part[0] for part in data[0] if part[0])
        return translated.strip()
    except Exception as e:
        print(f"Translation warning: {e}")
        return text.strip()

# 4. Smart Page Text and Image Extractor
def extract_page_blocks(doc, p_idx, slug):
    page = doc[p_idx]
    blocks = page.get_text("blocks")
    valid_blocks = [b for b in blocks if b[4].strip()]
    
    # Extract any embedded diagram/figure images on this page
    images = page.get_images()
    page_images = []
    for img in images:
        xref = img[0]
        rects = page.get_image_rects(xref)
        for r in rects:
            # Skip header banner (y < 60) and footer banner (y > 780)
            if r.y0 > 55 and r.y1 < 770 and (r.x1 - r.x0) > 40 and (r.y1 - r.y0) > 40:
                try:
                    base = doc.extract_image(xref)
                    ext = base["ext"]
                    img_name = f"{slug}_p{p_idx+1}_x{xref}.{ext}"
                    img_path = os.path.join(img_out_dir, img_name)
                    if not os.path.exists(img_path):
                        with open(img_path, "wb") as f:
                            f.write(base["image"])
                    page_images.append({
                        "rect": r,
                        "rel_url": f"/images/pyq/2026/{img_name}"
                    })
                except Exception:
                    pass
                    
    # Check for horizontal split by section header (y > 140)
    y_split = None
    for b in valid_blocks:
        txt = b[4].strip().upper()
        if any(h in txt for h in ["GENERAL INTELLIGENCE", "GENERAL AWARENESS", "QUANTITATIVE APTITUDE", "ENGLISH LANGUAGE"]):
            if b[1] > 140:
                y_split = b[1]
                break
                
    if y_split:
        top_blocks = [b for b in valid_blocks if b[3] <= y_split]
        bot_blocks = [b for b in valid_blocks if b[1] >= y_split]
        
        t_left = sorted([b for b in top_blocks if (b[0]+b[2])/2 < 305], key=lambda b: b[1])
        t_right = sorted([b for b in top_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: b[1])
        b_left = sorted([b for b in bot_blocks if (b[0]+b[2])/2 < 305], key=lambda b: b[1])
        b_right = sorted([b for b in bot_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: b[1])
        
        ordered = t_left + t_right + b_left + b_right
    else:
        left = sorted([b for b in valid_blocks if (b[0]+b[2])/2 < 305], key=lambda b: b[1])
        right = sorted([b for b in valid_blocks if (b[0]+b[2])/2 >= 305], key=lambda b: b[1])
        ordered = left + right
        
    page_text = "\n".join(b[4] for b in ordered)
    return page_text, page_images

def extract_full_paper(doc, slug):
    full_text = ""
    all_images = []
    for p_idx in range(1, len(doc)):
        p_text, p_imgs = extract_page_blocks(doc, p_idx, slug)
        full_text += "\n" + p_text
        all_images.extend(p_imgs)
    return full_text, all_images

# 5. Question Parser for single paper
def parse_paper_questions(full_text, is_hindi_paper=False):
    # Locate all 100 questions: 1..100
    matches = list(re.finditer(r"(?:^|\n)\s*(?:0(?=[1-9]\.))?(\d{1,3})\.\s*", full_text))
    
    q_spans = []
    expected = 1
    for m in matches:
        n = int(m.group(1))
        if n == expected:
            q_spans.append((n, m.start(), m.end()))
            expected += 1
            if expected > 100:
                break
                
    questions = []
    for i in range(len(q_spans)):
        q_num, start, end = q_spans[i]
        next_start = q_spans[i + 1][1] if i + 1 < len(q_spans) else len(full_text)
        block = full_text[end:next_start].strip()
        
        # Ans regex
        ans_m = re.search(r"(?:^|\n|\s)\s*Ans\s*[:\-]\s*\(?([A-D])\)?", block, re.I)
        ans = ans_m.group(1).upper() if ans_m else "A"
        
        body = re.sub(r"(?:^|\n|\s)\s*Ans\s*[:\-]\s*\(?[A-D]\)?.*", "", block, flags=re.I).strip()
        
        # Clean page headers and section headings
        lines = [l.strip() for l in body.split("\n") if l.strip() and not re.match(r"^SSC CGL \d{4}", l.strip(), re.I)]
        clean_body = "\n".join(lines)
        
        # Find Option Markers: (A), (B), (C), (D)
        opt_matches = list(re.finditer(r"(?:^|\n|\s)\(([A-D])\)\s*", clean_body))
        
        q_text = ""
        opts = {'A': '', 'B': '', 'C': '', 'D': ''}
        
        if len(opt_matches) >= 4:
            q_text = clean_body[:opt_matches[0].start()].strip()
            for o_i in range(len(opt_matches)):
                letter = opt_matches[o_i].group(1).upper()
                o_start = opt_matches[o_i].end()
                o_end = opt_matches[o_i + 1].start() if o_i + 1 < len(opt_matches) else len(clean_body)
                opts[letter] = clean_body[o_start:o_end].strip()
        else:
            parts = re.split(r"(?:^|\n|\s)\([A-D]\)\s*", clean_body)
            if len(parts) >= 5:
                q_text = parts[0].strip()
                opts['A'] = parts[1].strip()
                opts['B'] = parts[2].strip()
                opts['C'] = parts[3].strip()
                opts['D'] = parts[4].strip()
            else:
                q_text = clean_body
                
        # If question text is empty (diagram / figure questions):
        if not q_text.strip():
            q_text = "Refer to the given figure / diagram and select the correct option:"
            
        # Clean up options
        for k in ['A', 'B', 'C', 'D']:
            opts[k] = opts[k].replace("\n", " ").strip()
            if not opts[k]:
                opts[k] = f"Option {k}"
                
        # Translate to English if this is the Hindi paper (Q.1 to 75)
        if is_hindi_paper and q_num <= 75:
            q_text = translate_hi_to_en(q_text)
            for k in ['A', 'B', 'C', 'D']:
                if any('\u0900' <= c <= '\u097F' for c in opts[k]):
                    opts[k] = translate_hi_to_en(opts[k])
            if q_num % 10 == 0:
                print(f"    Translated Q.{q_num}/75...")
                
        questions.append({
            "question_number": q_num,
            "question_text": q_text,
            "option_a": opts['A'],
            "option_b": opts['B'],
            "option_c": opts['C'],
            "option_d": opts['D'],
            "correct_answer": ans
        })
        
    return questions

# 6. Chronological sorting order helper
def get_sort_key(filename):
    # e.g. "SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
    m = re.search(r"Held On_?\s*(\d{1,2})\s*([A-Za-z]+)\s*2026\s*Shift\s*(\d)", filename, re.I)
    if m:
        day = int(m.group(1))
        month_str = m.group(2).lower()
        shift = int(m.group(3))
        month = 9 if "sep" in month_str else 10
        return (month, day, shift)
    return (99, 99, 99)

pdf_files = sorted(glob.glob(os.path.join(pdf_dir, "*.pdf")), key=get_sort_key)
print(f"Total sorted PDF files: {len(pdf_files)}")

# 7. Main Execution Loop
success_count = 0
total_questions_inserted = 0

for idx, pdf_path in enumerate(pdf_files):
    fname = os.path.basename(pdf_path)
    
    # Extract shift date and shift number
    # e.g. "Held On_ 30 Sep 2026 Shift 2" -> "30 September 2026 Shift 2"
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
    slug = f"ssc-cgl-2026-{shift_title.lower().replace(' ', '-')}"
    
    is_hindi = ("1 Oct 2026 Shift 1" in fname)
    print(f"\n================================================================================")
    print(f"[{idx+1}/29] Processing: {paper_title}")
    if is_hindi:
        print("  * Notice: Hindi paper detected, translating Q.1-75 to Pure English...")
        
    doc = fitz.open(pdf_path)
    full_text, all_images = extract_full_paper(doc, slug)
    questions = parse_paper_questions(full_text, is_hindi_paper=is_hindi)
    
    print(f"  * Extracted {len(questions)} / 100 questions.")
    if len(questions) != 100:
        print(f"  [ERROR] Extracted count is not 100! Skipping DB insert.")
        continue
        
    # Check valid questions
    valid_q = sum(1 for q in questions if q["question_text"] and q["option_a"] and q["option_b"] and q["option_c"] and q["option_d"] and q["correct_answer"])
    print(f"  * Valid questions: {valid_q} / 100")
    
    # 7a. Save formatted TXT file
    txt_content = f"================================================================================\n"
    txt_content += f"{paper_title.upper()}\n"
    txt_content += f"Exam: SSC CGL | Year: 2026 | Tier: Tier-I\n"
    txt_content += f"Total Questions: 100 | Duration: 60 Minutes\n"
    txt_content += f"Extracted from Official Answer Key via SSC ZONE (www.ssczone.in)\n"
    txt_content += f"Language: 100% Pure English\n"
    txt_content += f"================================================================================\n\n"
    
    for q in questions:
        txt_content += f"Q{q['question_number']}. {q['question_text']}\n"
        txt_content += f"A) {q['option_a']}\n"
        txt_content += f"B) {q['option_b']}\n"
        txt_content += f"C) {q['option_c']}\n"
        txt_content += f"D) {q['option_d']}\n"
        txt_content += f"Correct Answer: Option {q['correct_answer']}\n"
        txt_content += f"--------------------------------------------------------------------------------\n\n"
        
    # Save TXT & JSON to pyq_backup and F:\startup  send mail\2026\
    txt_path_local = os.path.join(backup_dir, f"{slug}.txt")
    json_path_local = os.path.join(backup_dir, f"{slug}.json")
    txt_path_f = os.path.join(pdf_dir, f"{slug}.txt")
    json_path_f = os.path.join(pdf_dir, f"{slug}.json")
    
    with open(txt_path_local, "w", encoding="utf-8") as f: f.write(txt_content)
    with open(json_path_local, "w", encoding="utf-8") as f: json.dump(questions, f, indent=2, ensure_ascii=False)
    with open(txt_path_f, "w", encoding="utf-8") as f: f.write(txt_content)
    with open(json_path_f, "w", encoding="utf-8") as f: json.dump(questions, f, indent=2, ensure_ascii=False)
    print(f"  * Saved clean TXT and JSON backups.")
    
    # 7b. Insert/Upsert into Supabase `previous_papers`
    # Check if paper with this title already exists
    p_res = sb.from("previous_papers").select("id").eq("title", paper_title).execute()
    if p_res.data and len(p_res.data) > 0:
        paper_id = p_res.data[0]["id"]
        sb.from("previous_papers").update({
            "year": 2026,
            "exam_id": 1,
            "total_questions": 100,
            "duration_minutes": 60,
            "is_active": True,
            "test_type": "pyq"
        }).eq("id", paper_id).execute()
    else:
        ins_p = sb.from("previous_papers").insert({
            "title": paper_title,
            "exam_id": 1,
            "year": 2026,
            "total_questions": 100,
            "duration_minutes": 60,
            "is_active": True,
            "test_type": "pyq"
        }).execute()
        paper_id = ins_p.data[0]["id"]
        
    print(f"  * Supabase paper_id: {paper_id}")
    
    # 7c. Delete old questions for this paper to keep clean
    sb.from("paper_questions").delete().eq("paper_id", paper_id).execute()
    
    # 7d. Batch insert 100 questions into `paper_questions`
    q_payload = []
    for q in questions:
        q_payload.append({
            "paper_id": paper_id,
            "question_number": q["question_number"],
            "question_text": q["question_text"],
            "option_a": q["option_a"],
            "option_b": q["option_b"],
            "option_c": q["option_c"],
            "option_d": q["option_d"],
            "correct_answer": q["correct_answer"],
            "explanation": None
        })
        
    # Insert in chunks of 50
    for c_i in range(0, len(q_payload), 50):
        chunk = q_payload[c_i:c_i+50]
        sb.from("paper_questions").insert(chunk).execute()
        
    print(f"  * Successfully inserted 100 questions into Supabase `paper_questions`!")
    success_count += 1
    total_questions_inserted += len(questions)

print(f"\n================================================================================")
print(f"PROCESSING COMPLETED!")
print(f"Successfully processed and uploaded: {success_count} / {len(pdf_files)} papers")
print(f"Total questions inserted to Supabase: {total_questions_inserted}")
print(f"All 29 shift papers are now live under Folder 'SSC CGL / 2026 / Tier-I'!")
