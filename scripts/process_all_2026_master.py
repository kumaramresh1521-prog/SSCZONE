import fitz
import re
import os
import glob
import json
import sys
import time
import urllib.request
import urllib.parse
import requests
import time

sys.path.append(os.path.abspath("."))
sys.stdout.reconfigure(encoding='utf-8')

# 1. Supabase Initialization via Resilient REST Session
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
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if "NEXT_PUBLIC_SUPABASE_ANON_KEY" in line and "=" in line:
                supabase_key = line.split("=", 1)[1].strip().strip('\"\'')

print(f"Supabase URL: {supabase_url}", flush=True)
HEADERS = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

session = requests.Session()

def safe_request(method, url, **kwargs):
    for attempt in range(5):
        try:
            res = session.request(method, url, timeout=40, **kwargs)
            if res.ok:
                return res
            # If not ok, retry if server error
            if res.status_code >= 500 or res.status_code == 429:
                time.sleep(1.5 * (attempt + 1))
                continue
            return res
        except Exception as e:
            if attempt == 4:
                raise e
            time.sleep(1.5 * (attempt + 1))
    return session.request(method, url, timeout=40, **kwargs)

# 2. Directory setup
pdf_dir = r"F:\startup  send mail\2026"
img_out_dir = r"c:\ssczone\public\images\pyq\2026"
backup_dir = r"c:\ssczone\src\data\pyq_backup"
os.makedirs(img_out_dir, exist_ok=True)
os.makedirs(backup_dir, exist_ok=True)

# 3. Google Translate Batch POST Helper
def batch_translate_texts(text_list):
    to_translate = []
    index_map = []
    for idx, t in enumerate(text_list):
        if t and any('\u0900' <= c <= '\u097F' for c in t):
            to_translate.append(t)
            index_map.append(idx)
            
    if not to_translate:
        return text_list
        
    print(f"    * Batch translating {len(to_translate)} Hindi text strings via POST...", flush=True)
    results = list(text_list)
    batch_size = 25
    for b_i in range(0, len(to_translate), batch_size):
        chunk = to_translate[b_i:b_i+batch_size]
        joined = "\n__DELIM__\n".join(chunk)
        for attempt in range(3):
            try:
                data = urllib.parse.urlencode({
                    'client': 'gtx',
                    'sl': 'hi',
                    'tl': 'en',
                    'dt': 't',
                    'q': joined
                }).encode('utf-8')
                url = "https://translate.googleapis.com/translate_a/single"
                req = urllib.request.Request(url, data=data, headers={'User-Agent': 'Mozilla/5.0'})
                res = urllib.request.urlopen(req, timeout=20)
                parsed = json.loads(res.read().decode('utf-8'))
                full_trans = "".join(part[0] for part in parsed[0] if part[0])
                split_res = [s.strip() for s in full_trans.split("__DELIM__")]
                for c_idx, trans_text in enumerate(split_res):
                    if c_idx < len(chunk):
                        orig_pos = index_map[b_i + c_idx]
                        results[orig_pos] = trans_text.strip()
                print(f"      Batch {b_i//batch_size + 1}/{(len(to_translate)+batch_size-1)//batch_size} done.", flush=True)
                break
            except Exception as e:
                if attempt == 2:
                    print(f"      Batch trans note: {e}", flush=True)
                time.sleep(1.0)
            
    return results

# 4. Word-Grouping Text Extraction
def group_words_to_lines(col_words):
    if not col_words:
        return ""
    col_words = sorted(col_words, key=lambda w: (w[1], w[0]))
    lines = []
    for w in col_words:
        placed = False
        for line in lines:
            line_y0 = min(item[1] for item in line)
            line_y1 = max(item[3] for item in line)
            line_mid = (line_y0 + line_y1) / 2
            w_mid = (w[1] + w[3]) / 2
            if abs(w_mid - line_mid) < 5 or abs(w[1] - line_y0) < 5:
                line.append(w)
                placed = True
                break
        if not placed:
            lines.append([w])
            
    lines.sort(key=lambda l: min(item[1] for item in l))
    res = []
    for l in lines:
        l.sort(key=lambda item: item[0])
        line_str = " ".join(item[4] for item in l)
        res.append(line_str)
    return "\n".join(res)

def extract_page_text(page):
    blocks = page.get_text("blocks")
    valid_blocks = [b for b in blocks if b[4].strip()]
    
    y_split = None
    for b in valid_blocks:
        txt = b[4].strip().upper()
        if any(h in txt for h in ["GENERAL INTELLIGENCE", "GENERAL AWARENESS", "QUANTITATIVE APTITUDE", "ENGLISH LANGUAGE"]):
            if b[1] > 140:
                y_split = b[1]
                break
                
    words = page.get_text("words")
    content_words = [w for w in words if w[1] > 55 and w[3] < 785]
    
    if y_split:
        top_words = [w for w in content_words if w[3] <= y_split]
        bot_words = [w for w in content_words if w[1] >= y_split]
        
        t_l = group_words_to_lines([w for w in top_words if (w[0]+w[2])/2 < 305])
        t_r = group_words_to_lines([w for w in top_words if (w[0]+w[2])/2 >= 305])
        b_l = group_words_to_lines([w for w in bot_words if (w[0]+w[2])/2 < 305])
        b_r = group_words_to_lines([w for w in bot_words if (w[0]+w[2])/2 >= 305])
        return f"{t_l}\n{t_r}\n{b_l}\n{b_r}"
    else:
        l = group_words_to_lines([w for w in content_words if (w[0]+w[2])/2 < 305])
        r = group_words_to_lines([w for w in content_words if (w[0]+w[2])/2 >= 305])
        return f"{l}\n{r}"

def extract_full_paper_text(doc):
    full_text = ""
    for p in range(1, len(doc)):
        full_text += "\n" + extract_page_text(doc[p])
    return full_text

# 5. Image Extraction and Mapping
def extract_and_map_images(doc, slug):
    # Map questions to page and column segments
    q_segments = []
    last_q = 0
    for p_idx in range(1, len(doc)):
        page = doc[p_idx]
        words = [w for w in page.get_text("words") if w[1] > 55 and w[3] < 785]
        
        q_starts = []
        for w in words:
            m = re.match(r"^0?([1-9]\d?|100)\.$", w[4])
            if m:
                q_num = int(m.group(1))
                col = 0 if (w[0]+w[2])/2 < 305 else 1
                q_starts.append((q_num, col, w[1]))
                
        for col in [0, 1]:
            col_qs = [q for q in q_starts if q[1] == col]
            col_qs.sort(key=lambda item: item[2])
            
            # If column begins before first question, it belongs to last_q
            if col_qs:
                if col_qs[0][2] > 80 and last_q > 0:
                    q_segments.append((last_q, p_idx, col, 55.0, col_qs[0][2]))
                for idx_q, q in enumerate(col_qs):
                    q_num = q[0]
                    y0 = q[2]
                    y1 = col_qs[idx_q + 1][2] if idx_q + 1 < len(col_qs) else 785.0
                    q_segments.append((q_num, p_idx, col, y0, y1))
                    last_q = q_num
            else:
                if last_q > 0:
                    q_segments.append((last_q, p_idx, col, 55.0, 785.0))

    # Extract images and map
    image_mapping = {}
    for p_idx in range(1, len(doc)):
        page = doc[p_idx]
        images = page.get_images()
        for img in images:
            xref = img[0]
            rects = page.get_image_rects(xref)
            for r in rects:
                if r.y0 > 55 and r.y1 < 780 and (r.x1 - r.x0) > 30 and (r.y1 - r.y0) > 30:
                    if (r.x1 - r.x0) > 400 and (r.y1 - r.y0) > 400:
                        continue # skip watermark
                    base = doc.extract_image(xref)
                    ext = base["ext"]
                    img_name = f"{slug}_p{p_idx+1}_x{xref}.{ext}"
                    img_path = os.path.join(img_out_dir, img_name)
                    if not os.path.exists(img_path):
                        with open(img_path, "wb") as f:
                            f.write(base["image"])
                            
                    col = 0 if (r.x0 + r.x1)/2 < 305 else 1
                    mid_y = (r.y0 + r.y1)/2
                    
                    matched_q = None
                    for seg in q_segments:
                        s_q, s_p, s_col, s_y0, s_y1 = seg
                        if s_p == p_idx and s_col == col and (s_y0 - 20) <= mid_y <= (s_y1 + 20):
                            matched_q = s_q
                            break
                            
                    if matched_q is not None:
                        if matched_q not in image_mapping:
                            image_mapping[matched_q] = []
                        image_mapping[matched_q].append({
                            "xref": xref,
                            "rect": r,
                            "w": r.x1 - r.x0,
                            "h": r.y1 - r.y0,
                            "url": f"/images/pyq/2026/{img_name}"
                        })

    return image_mapping

# 6. Parse Questions & Attach Diagrams
def parse_paper(full_text, image_mapping, is_hindi=False):
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
        
        lines = [l.strip() for l in body.split("\n") if l.strip() and not re.match(r"^SSC CGL \d{4}", l.strip(), re.I)]
        clean_body = "\n".join(lines)
        
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
                
        # Clean options
        for k in ['A', 'B', 'C', 'D']:
            opts[k] = opts[k].replace("\n", " ").strip()
            
        # Attach mapped images if available
        if q_num in image_mapping:
            imgs = image_mapping[q_num]
            opt_imgs = [im for im in imgs if im["w"] < 130]
            fig_imgs = [im for im in imgs if im["w"] >= 130]
            
            # If 4 option images exist:
            if len(opt_imgs) == 4:
                # Sort option images: top-left (A), top-right (B), bot-left (C), bot-right (D)
                # Group by y then x
                opt_imgs.sort(key=lambda item: (round(item["rect"].y0 / 25.0), item["rect"].x0))
                letters = ['A', 'B', 'C', 'D']
                for idx_opt, let in enumerate(letters):
                    tag = f"![Option {let}]({opt_imgs[idx_opt]['url']})"
                    if opts[let]:
                        opts[let] = f"{opts[let]} {tag}".strip()
                    else:
                        opts[let] = tag
            elif len(opt_imgs) > 0 and not any(opts.values()):
                # Distribute if options are purely empty
                for idx_opt, im in enumerate(opt_imgs[:4]):
                    let = ['A', 'B', 'C', 'D'][idx_opt]
                    opts[let] = f"![Option {let}]({im['url']})"
            else:
                # Any unused small images add to fig_imgs
                fig_imgs.extend(opt_imgs)
                
            for fig in fig_imgs:
                q_text += f"\n\n![Figure]({fig['url']})"
                
        # Fallback empty option text
        for k in ['A', 'B', 'C', 'D']:
            if not opts[k]:
                opts[k] = f"Option {k}"
                
        if not q_text.strip():
            q_text = "Refer to the given figure / diagram and select the correct option:"
            
        questions.append({
            "question_number": q_num,
            "question_text": q_text.strip(),
            "option_a": opts['A'],
            "option_b": opts['B'],
            "option_c": opts['C'],
            "option_d": opts['D'],
            "correct_answer": ans
        })
        
    if is_hindi:
        all_texts = []
        for q in questions:
            if q["question_number"] <= 75:
                all_texts.extend([q["question_text"], q["option_a"], q["option_b"], q["option_c"], q["option_d"]])
        translated_texts = batch_translate_texts(all_texts)
        t_idx = 0
        for q in questions:
            if q["question_number"] <= 75:
                q["question_text"] = translated_texts[t_idx]
                q["option_a"] = translated_texts[t_idx+1]
                q["option_b"] = translated_texts[t_idx+2]
                q["option_c"] = translated_texts[t_idx+3]
                q["option_d"] = translated_texts[t_idx+4]
                t_idx += 5
        print("    * Translation of Q.1-75 completed successfully!", flush=True)
        
    return questions

# 7. Sort Key Helper
def get_sort_key(filename):
    m = re.search(r"Held On_?\s*(\d{1,2})\s*([A-Za-z]+)\s*2026\s*Shift\s*(\d)", filename, re.I)
    if m:
        day = int(m.group(1))
        month_str = m.group(2).lower()
        shift = int(m.group(3))
        month = 9 if "sep" in month_str else 10
        return (month, day, shift)
    return (99, 99, 99)

# 8. Clean up old test paper (id: 24)
try:
    print("Cleaning up old test paper id 24 if present...", flush=True)
    safe_request("DELETE", f"{supabase_url}/rest/v1/paper_questions?paper_id=eq.24", headers=HEADERS)
    safe_request("DELETE", f"{supabase_url}/rest/v1/previous_papers?id=eq.24", headers=HEADERS)
    print("Old test paper 24 cleaned up.", flush=True)
except Exception as e:
    print(f"Cleanup note: {e}", flush=True)

# 9. Main Processing Loop
pdf_files = sorted(glob.glob(os.path.join(pdf_dir, "*.pdf")), key=get_sort_key)
print(f"Total sorted PDF files to process: {len(pdf_files)}")

success_count = 0
total_questions_inserted = 0

for idx, pdf_path in enumerate(pdf_files):
    fname = os.path.basename(pdf_path)
    
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
    print(f"\n================================================================================", flush=True)
    print(f"[{idx+1}/{len(pdf_files)}] Processing: {paper_title}", flush=True)
    if is_hindi:
        print("  * Translating Hindi Q.1-75 to Pure English in fast batches...", flush=True)
        
    doc = fitz.open(pdf_path)
    full_text = extract_full_paper_text(doc)
    image_mapping = extract_and_map_images(doc, slug)
    print(f"  * Mapped images for {len(image_mapping)} questions.", flush=True)
    
    questions = parse_paper(full_text, image_mapping, is_hindi=is_hindi)
    print(f"  * Extracted {len(questions)} / 100 questions.", flush=True)
    
    if len(questions) != 100:
        print(f"  [ERROR] Question count is {len(questions)} != 100! Skipping DB insert.", flush=True)
        continue
        
    # Check valid questions
    valid_q = sum(1 for q in questions if q["question_text"] and q["option_a"] and q["option_b"] and q["option_c"] and q["option_d"] and q["correct_answer"])
    print(f"  * Valid questions: {valid_q} / 100", flush=True)
    
    # 9a. Save formatted TXT file
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
    
    # 9b. Insert/Upsert into Supabase `previous_papers`
    encoded_title = urllib.parse.quote(paper_title)
    p_check = safe_request("GET", f"{supabase_url}/rest/v1/previous_papers?title=eq.{encoded_title}&select=id", headers=HEADERS)
    paper_rows = p_check.json() if p_check.ok else []
    
    if paper_rows and len(paper_rows) > 0:
        paper_id = paper_rows[0]["id"]
        safe_request(
            "PATCH",
            f"{supabase_url}/rest/v1/previous_papers?id=eq.{paper_id}",
            headers=HEADERS,
            json={
                "year": 2026,
                "exam_id": 1,
                "total_questions": 100,
                "duration_minutes": 60,
                "is_active": True,
                "test_type": "pyq"
            }
        )
    else:
        ins_res = safe_request(
            "POST",
            f"{supabase_url}/rest/v1/previous_papers",
            headers={**HEADERS, "Prefer": "return=representation"},
            json={
                "title": paper_title,
                "exam_id": 1,
                "year": 2026,
                "total_questions": 100,
                "duration_minutes": 60,
                "is_active": True,
                "test_type": "pyq"
            }
        )
        if ins_res.ok:
            paper_id = ins_res.json()[0]["id"]
        else:
            print(f"  [ERROR] Failed to insert paper: {ins_res.text}", flush=True)
            continue
        
    # 9c. Delete old questions for this paper to ensure clean state
    safe_request("DELETE", f"{supabase_url}/rest/v1/paper_questions?paper_id=eq.{paper_id}", headers=HEADERS)
    
    # 9d. Batch insert 100 questions into `paper_questions`
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
        
    batch_size = 50
    for c_i in range(0, len(q_payload), batch_size):
        chunk = q_payload[c_i:c_i+batch_size]
        q_ins_res = safe_request("POST", f"{supabase_url}/rest/v1/paper_questions", headers=HEADERS, json=chunk)
        if not q_ins_res.ok:
            print(f"  [ERROR] Inserting questions chunk {c_i}: {q_ins_res.text}", flush=True)
        
    print(f"  * Successfully inserted 100 questions into Supabase (Paper ID: {paper_id})!", flush=True)
    success_count += 1
    total_questions_inserted += len(questions)

print(f"\n================================================================================", flush=True)
print(f"PROCESSING COMPLETED!", flush=True)
print(f"Successfully processed and uploaded: {success_count} / {len(pdf_files)} papers", flush=True)
print(f"Total questions inserted to Supabase: {total_questions_inserted}", flush=True)
