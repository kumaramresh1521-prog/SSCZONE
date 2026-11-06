import glob
import json
import os
import re
import sys
import unicodedata
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
pdf_dir = r"F:\startup  send mail\2026"

# Load Supabase credentials
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

session = requests.Session()
retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
session.mount('https://', HTTPAdapter(max_retries=retries))

def normalize_math_chars(text: str) -> str:
    res = []
    for ch in text:
        cp = ord(ch)
        if 0x1D400 <= cp <= 0x1D7FF:
            res.append(unicodedata.normalize('NFKC', ch))
        else:
            res.append(ch)
    return ''.join(res)

def clean_footers_and_headers(text: str) -> str:
    if not text:
        return ""
    # 1. Remove footers like '6 (BASIC ARITHMETIC SKILL)' or '8 (BASIC KNOWLEDGE)'
    text = re.sub(r'\s*\d+\s*\((?:BASIC ARITHMETIC SKILL|BASIC KNOWLEDGE)\)\s*', ' ', text)
    # 2. Remove stray section header QUANTITATIVE APTITUDE / GENERAL AWARENESS / etc.
    text = re.sub(r'\s*\b(QUANTITATIVE APTITUDE|GENERAL AWARENESS|GENERAL INTELLIGENCE|ENGLISH LANGUAGE)\b\s*', ' ', text)
    # 3. Remove stray (E) Not Answered
    text = re.sub(r'\s*\(E\)\s*Not Answered\s*', ' ', text)
    # 4. Special Q.86 page 10 number in 30 Sept Shift 3
    text = re.sub(r'parties\s+10\s*\n+\s*\(Q\)', 'parties\n\n(Q)', text)
    return text

def format_math_typography(text: str, is_math: bool = False) -> str:
    if not text:
        return ""
        
    # 1. Normalize Mathematical Alphanumeric block (U+1D400 to U+1D7FF)
    text = normalize_math_chars(text)
    
    # 2. Non-standard Greek theta & ring operator degree
    text = text.replace("𝞱", "θ").replace("𝜽", "θ").replace("𝛉", "θ")
    text = text.replace("∘", "°")
    
    # 3. Degree spacing: "30 °" -> "30°"
    text = re.sub(r'(\d+)\s+°', r'\1°', text)
    
    # 4. Units with powers: cm2 -> cm², cm3 -> cm³, m2 -> m², m3 -> m³, km2 -> km²
    text = re.sub(r'\b(cm|m|km|mm)2\b', r'\1²', text)
    text = re.sub(r'\b(cm|m|km|mm)3\b', r'\1³', text)
    
    # 5. Trigonometry formatting
    # Space between coefficient and trig name: e.g. 3cosec -> 3 cosec, 2tan -> 2 tan
    text = re.sub(r'(\d+)(sin|cos|tan|sec|cosec|cot|csc)\b', r'\1 \2', text)
    
    # Trig square/cube attached to angle: cosec260 -> cosec² 60, cos230 -> cos² 30, csc260 -> csc² 60
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot|csc)2(\d+)', r'\1² \2', text)
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot|csc)3(\d+)', r'\1³ \2', text)
    
    # Trig square/cube with spaces or followed by angle/theta: sin2 -> sin², cos2 -> cos²
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot|csc)2\s*', r'\1² ', text)
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot|csc)3\s*', r'\1³ ', text)
    
    # 6. Bracketed powers: )2 -> )², ]2 -> ]², }2 -> }²
    text = re.sub(r'([)\]}])2\b', r'\1²', text)
    text = re.sub(r'([)\]}])3\b', r'\1³', text)
    
    # 7. Math section specific algebra powers
    if is_math:
        # Algebraic powers with coefficients: 64x2 -> 64x², 81y2 -> 81y²
        text = re.sub(r'(\d+)([a-dxyzrp])2\b', r'\1\2²', text)
        text = re.sub(r'(\d+)([a-dxyzrp])3\b', r'\1\2³', text)
        
        # Standalone algebraic variables: a2 + b2, x2 - y2, p2 - 1, r2
        text = re.sub(r'\b([a-dxyzrp])2\b', r'\1²', text)
        text = re.sub(r'\b([a-dxyzrp])3\b', r'\1³', text)
        
        # In compact expressions like a2+b2 or x2/y2
        text = re.sub(r'([a-dxyzrp])2(?=[+\-=*/])', r'\1²', text)
        text = re.sub(r'([a-dxyzrp])3(?=[+\-=*/])', r'\1³', text)
        text = re.sub(r'(?<=[+\-=*/])([a-dxyzrp])2\b', r'\1²', text)
        text = re.sub(r'(?<=[+\-=*/])([a-dxyzrp])3\b', r'\1³', text)
        
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def clean_question_text(text: str, qn: int, fname: str) -> str:
    if not text:
        return ""
        
    # Special fix for 9 Oct Shift 3 Q21
    if "9-october-2026-shift-3" in fname and qn == 21:
        return "How many triangles are there in the given figure?"
        
    # Special fix for 13 Oct Shift 3 Q24
    if "13-october-2026-shift-3" in fname and qn == 24:
        return "![Figure](/images/pyq/2026/ssc-cgl-2026-13-october-2026-shift-3_q24_fig.png)"
        
    # Special fix for 13 Oct Shift 3 Q25
    if "13-october-2026-shift-3" in fname and qn == 25:
        return "![Figure](/images/pyq/2026/ssc-cgl-2026-13-october-2026-shift-3_p5_x828.jpeg)"
        
    # Special fix for 5 Oct Shift 3 Q73
    if "5-october-2026-shift-3" in fname and qn == 73:
        return "A projectile launch angle satisfies sine twice the angle is 0.8 and cosine twice the angle is 0.6. Calculate sum of fourth powers of sine and cosine of the launch angle to predict range stability."

    # Remove footers and headers
    text = clean_footers_and_headers(text)
    
    # Remove DIAGRAM_OR_GEOMETRIC placeholder
    text = re.sub(r'\s*DIAGRAM_OR_GEOMETRIC\s*', ' ', text)
    
    # Remove option grids in question text:
    # Handles:
    # 2\n(A) (B)\n(C) (D)
    # (A) (B) \n (C) (D)
    # (A) (B) \n (C) (D) 2
    text = re.sub(r'^\s*[1-5]\s*\n+', '', text)
    text = re.sub(r'\(A\)\s*(?:\(B\)\s*\d*|\d*)\s*(?:\n*\s*\(C\)\s*\d*\s*(?:\(D\))?\s*\d*)?(?:\s+[1-5]\b)?', '', text)
    text = re.sub(r'\(A\)\s*(?:\n*\s*\(B\))?\s*(?:\n*\s*\(C\))?\s*(?:\n*\s*\(D\))?', '', text)
    
    # Format math typography
    is_math = (51 <= qn <= 75)
    text = format_math_typography(text, is_math=is_math)
    
    # Clean redundant whitespace and empty lines
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    return text.strip()

def clean_option_text(text: str, qn: int, opt_letter: str, fname: str) -> str:
    if not text:
        return ""
        
    # Special fix for 9 Oct Shift 3 Q21
    if "9-october-2026-shift-3" in fname and qn == 21:
        opts_map = {"a": "32", "b": "34", "c": "36", "d": "42"}
        return opts_map.get(opt_letter.lower(), text)
        
    # Special fix for 5 Oct Shift 3 Q73
    if "5-october-2026-shift-3" in fname and qn == 73:
        if opt_letter.lower() == "a":
            return "1"
        elif opt_letter.lower() == "b":
            return "0.6"
        elif opt_letter.lower() == "c":
            return "0.68"
        elif opt_letter.lower() == "d":
            return "0.72"
            
    # Clean footers
    text = clean_footers_and_headers(text)
    
    # Remove DIAGRAM_OR_GEOMETRIC placeholder if any in options
    text = re.sub(r'\s*DIAGRAM_OR_GEOMETRIC\s*', ' ', text)
    
    # Format math typography
    is_math = (51 <= qn <= 75)
    text = format_math_typography(text, is_math=is_math)
    
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def generate_txt_content(paper_title: str, questions: list) -> str:
    out = [f"Paper: {paper_title}", f"Total Questions: {len(questions)}", "=" * 60, ""]
    for q in questions:
        qn = q["question_number"]
        out.append(f"Q.{qn} {q['question_text']}")
        out.append(f"A) {q['option_a']}")
        out.append(f"B) {q['option_b']}")
        out.append(f"C) {q['option_c']}")
        out.append(f"D) {q['option_d']}")
        out.append(f"Answer: {q['correct_answer']}")
        out.append("-" * 40)
    return "\n".join(out)

# 1. Fetch DB papers
res = session.get(f"{supabase_url}/rest/v1/previous_papers?year=eq.2026&select=id,title,year&order=id.asc", headers=headers)
db_papers = res.json() if res.ok else []
print(f"Loaded {len(db_papers)} papers from DB (year 2026)")

files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))
print(f"Loaded {len(files)} local JSON files from {backup_dir}")

total_updated_in_db = 0

for idx, fpath in enumerate(files):
    fname = os.path.basename(fpath)
    base_name = fname.replace(".json", "")
    
    with open(fpath, "r", encoding="utf-8") as f:
        questions = json.load(f)
        
    cleaned_questions = []
    for q in questions:
        qn = q["question_number"]
        new_q = dict(q)
        new_q["question_text"] = clean_question_text(q.get("question_text", ""), qn, fname)
        new_q["option_a"] = clean_option_text(q.get("option_a", ""), qn, "a", fname)
        new_q["option_b"] = clean_option_text(q.get("option_b", ""), qn, "b", fname)
        new_q["option_c"] = clean_option_text(q.get("option_c", ""), qn, "c", fname)
        new_q["option_d"] = clean_option_text(q.get("option_d", ""), qn, "d", fname)
        cleaned_questions.append(new_q)
        
    # 1. Save local backup JSON
    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(cleaned_questions, f, ensure_ascii=False, indent=2)
        
    # 2. Save F:\startup  send mail\2026/ JSON
    f_json_path = os.path.join(pdf_dir, fname)
    with open(f_json_path, "w", encoding="utf-8") as f:
        json.dump(cleaned_questions, f, ensure_ascii=False, indent=2)
        
    # Find matching DB paper ID
    paper_id = None
    matched_title = None
    for p in db_papers:
        date_shift = base_name.replace("ssc-cgl-2026-", "").replace("-", " ")
        if date_shift.lower() in p["title"].lower():
            paper_id = p["id"]
            matched_title = p["title"]
            break
            
    if not paper_id and idx < len(db_papers):
        paper_id = db_papers[idx]["id"]
        matched_title = db_papers[idx]["title"]
        
    # 3. Generate & Save TXT files
    txt_content = generate_txt_content(matched_title or base_name, cleaned_questions)
    
    local_txt_path = os.path.join(backup_dir, f"{base_name}.txt")
    with open(local_txt_path, "w", encoding="utf-8") as f:
        f.write(txt_content)
        
    f_txt_path = os.path.join(pdf_dir, f"{base_name}.txt")
    with open(f_txt_path, "w", encoding="utf-8") as f:
        f.write(txt_content)
        
    # 4. Sync to Supabase
    if paper_id:
        rows_to_insert = []
        for q in cleaned_questions:
            rows_to_insert.append({
                "paper_id": paper_id,
                "question_number": q["question_number"],
                "question_text": q["question_text"],
                "option_a": q["option_a"],
                "option_b": q["option_b"],
                "option_c": q["option_c"],
                "option_d": q["option_d"],
                "correct_answer": q["correct_answer"]
            })
            
        # Clean delete old questions for this paper, then insert fresh cleaned rows
        del_res = session.delete(f"{supabase_url}/rest/v1/paper_questions?paper_id=eq.{paper_id}", headers=headers)
        
        batch_size = 50
        all_ok = True
        for c_i in range(0, len(rows_to_insert), batch_size):
            chunk = rows_to_insert[c_i:c_i+batch_size]
            ins_res = session.post(f"{supabase_url}/rest/v1/paper_questions", headers=headers, json=chunk)
            if not ins_res.ok:
                all_ok = False
                print(f"  [ERROR] Chunk {c_i} insert failed: {ins_res.status_code} {ins_res.text[:100]}", flush=True)
                
        if all_ok:
            total_updated_in_db += len(rows_to_insert)
            print(f"[{idx+1}/29] ✅ {fname} -> DB Paper ID {paper_id} ({matched_title}) [100 Qs Updated]", flush=True)
        else:
            print(f"[{idx+1}/29] ❌ DB Insert had errors for {fname} (ID {paper_id})", flush=True)
    else:
        print(f"[{idx+1}/29] ⚠️ No DB paper_id found for {fname}", flush=True)

print("\n" + "=" * 60)
print(f"MASTER PATCH COMPLETE!")
print(f"Total Papers Processed: {len(files)}")
print(f"Total Questions Updated in DB: {total_updated_in_db}")
print("=" * 60)
