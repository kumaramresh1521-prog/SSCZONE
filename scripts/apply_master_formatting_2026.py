import fitz
import json
import glob
import os
import re
import sys
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
pdf_dir = r"F:\startup  send mail\2026"

# Load environment
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
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

session = requests.Session()
retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
session.mount('https://', HTTPAdapter(max_retries=retries))

# 6 cloze papers mapping
cloze_papers_map = {
    "ssc-cgl-2026-10-october-2026-shift-3.json": "SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 3).pdf",
    "ssc-cgl-2026-12-october-2026-shift-3.json": "SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf",
    "ssc-cgl-2026-13-october-2026-shift-2.json": "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 2).pdf",
    "ssc-cgl-2026-13-october-2026-shift-3.json": "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 3).pdf",
    "ssc-cgl-2026-30-september-2026-shift-3.json": "SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf",
    "ssc-cgl-2026-6-october-2026-shift-3.json": "SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 3).pdf"
}

def parse_q95_and_passage(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = ""
    for p in doc:
        full_text += p.get_text() + "\n"
        
    m95 = re.search(r'95\.\s+(.*?)(?=\bAns:\s*([A-D]))', full_text, re.S)
    if not m95:
        return None
    raw_q95 = m95.group(1).strip()
    ans95 = m95.group(2).strip()
    
    opt_match = re.search(r'\(A\)\s+(.*?)\s+\(B\)\s+(.*?)\s+\(C\)\s+(.*?)\s+\(D\)\s+(.*?)$', raw_q95, re.S)
    if opt_match:
        q95_text = raw_q95[:opt_match.start()].strip()
        oa = opt_match.group(1).strip()
        ob = opt_match.group(2).strip()
        oc = opt_match.group(3).strip()
        od = opt_match.group(4).strip()
    else:
        return None
        
    m_pass = re.search(r'95\..*?Ans:\s*[A-D]\s+(Comprehension\s*\(Q\.\s*96\s*[-–]\s*100\).*?)(?=96\.)', full_text, re.S)
    passage = m_pass.group(1).strip() if m_pass else None
    
    return {
        "text": q95_text,
        "option_a": oa,
        "option_b": ob,
        "option_c": oc,
        "option_d": od,
        "answer": ans95,
        "passage": passage
    }

def clean_option_text(val: str) -> str:
    if not val:
        return ""
    val = val.strip()
    
    # 1. Strip section names
    val = re.sub(r'\s*\b(QUANTITATIVE\s+APTITUDE|ENGLISH\s+LANGUAGE|GENERAL\s+AWARENESS|GENERAL\s+INTELLIGENCE(\s+(&|AND)\s+REASONING)?)\s*$', '', val, flags=re.I)
    val = re.sub(r'\s*\b\d{1,2}\s*\(\s*BASIC\s+KNOWLEDGE\s*\)\s*$', '', val, flags=re.I)
    val = re.sub(r'\s*\(\s*BASIC\s+KNOWLEDGE\s*\)\s*$', '', val, flags=re.I)
    
    # 2. Strip stray trailing page number (e.g. "Mango 2", "Weak 5", "Common 10", "wrack, wrack 9")
    protected_pattern = re.compile(r'^(Only|Both|Neither|Option|Rule|Article|Schedule|Clause|Section|Part|Table|Case|No|Figure|Fig|Step)\b|\b(and|or|,)\s+\d+$|^\d+$|^[\d\s,]+$', re.I)
    
    if not protected_pattern.search(val):
        m = re.search(r'\s+(\d{1,2})$', val)
        if m:
            page_num = int(m.group(1))
            if 1 <= page_num <= 25:
                val = val[:m.start()].strip()
                
    return val.strip()

def unwrap_text(text: str) -> str:
    if not text:
        return ""
        
    # Clean out page footers like "8\n(BASIC KNOWLEDGE)", "9 (BASIC KNOWLEDGE)", "\n1\nINTELLIGENCE"
    text = re.sub(r'\n*\s*\b\d{1,2}\s*\n*\s*\(\s*BASIC\s+KNOWLEDGE\s*\)\s*', ' ', text, flags=re.I)
    text = re.sub(r'\(\s*BASIC\s+KNOWLEDGE\s*\)', ' ', text, flags=re.I)
    text = re.sub(r'\n+\s*\d{1,2}\s*\n+\s*(INTELLIGENCE|AWARENESS|QUANTITATIVE|APTITUDE|LANGUAGE)\b', ' ', text, flags=re.I)
    text = re.sub(r'\n+\s*\d{1,2}\s*\n+(?=[a-z])', ' ', text)
    
    sections = text.split('\n---\n')
    processed_sections = []
    
    structure_re = re.compile(
        r'^\s*('
        r'(\d+[\.\)])|'
        r'([I|V|X]+[\.\)])|'
        r'(\([a-zA-Z0-9]+\))|'
        r'(Statement[s]?\s*:)|'
        r'(Conclusion[s]?\s*:)|'
        r'(Course\s+of\s+Action\s*:)|'
        r'(Direction[s]?\s*:)|'
        r'(Note\s*:)|'
        r'(Where\s*:)|'
        r'([-•\*]\s+)|'
        r'(!\[.*?\])|'
        r'(\*\*[^*]+\*\*)'
        r')',
        re.I
    )
    
    for sec in sections:
        lines = sec.split('\n')
        output_blocks = []
        current_block = ""
        for line in lines:
            line_str = line.strip()
            if not line_str:
                if current_block:
                    output_blocks.append(current_block)
                    current_block = ""
                continue
                
            if structure_re.match(line_str):
                if current_block:
                    output_blocks.append(current_block)
                current_block = line_str
            else:
                if current_block:
                    if current_block.endswith('-') and not current_block.endswith(' -'):
                        current_block = current_block[:-1] + line_str
                    else:
                        current_block += " " + line_str
                else:
                    current_block = line_str
                    
        if current_block:
            output_blocks.append(current_block)
            
        processed_sections.append("\n\n".join(output_blocks))
        
    return "\n\n---\n\n".join(processed_sections).strip()

def process_paper_data(questions, fname):
    passages_to_apply = []
    
    if fname in cloze_papers_map:
        pdf_name = cloze_papers_map[fname]
        pdf_path = os.path.join(pdf_dir, pdf_name)
        res = parse_q95_and_passage(pdf_path)
        if res:
            q95 = questions[94]
            q95["question_text"] = res["text"]
            q95["option_a"] = res["option_a"]
            q95["option_b"] = res["option_b"]
            q95["option_c"] = res["option_c"]
            q95["option_d"] = res["option_d"]
            q95["correct_answer"] = res["answer"]
            
            if res["passage"]:
                m_hdr = re.search(r'Comprehension\s*\(\s*Q\.?\s*(\d+)\s*[-–]\s*(\d+)\s*\)', res["passage"], re.I)
                if m_hdr:
                    q_start = int(m_hdr.group(1))
                    q_end = int(m_hdr.group(2))
                    body = res["passage"][m_hdr.end():].strip()
                    body = re.sub(r'^(?:Read the passage.*?:)?\s*', '', body, flags=re.I).strip()
                    passages_to_apply.append((q_start, q_end, f"Comprehension (Q. {q_start} - {q_end})", body))
    
    for q in questions:
        qn = q["question_number"]
        for opt_k in ['option_a', 'option_b', 'option_c', 'option_d']:
            val = q.get(opt_k, "")
            m = re.search(r'Comprehension\s*\(\s*Q\.?\s*(\d+)\s*[-–]\s*(\d+)\s*\)', val, re.I)
            if m:
                q_start = int(m.group(1))
                q_end = int(m.group(2))
                split_idx = val.find(m.group(0))
                before = val[:split_idx].strip()
                sec_m = re.search(r'\b(ENGLISH\s+LANGUAGE|GENERAL\s+AWARENESS|QUANTITATIVE\s+APTITUDE|GENERAL\s+INTELLIGENCE)\s*$', before, re.I)
                clean_opt = before[:sec_m.start()].strip() if sec_m else before
                passage_raw = val[split_idx:].strip()
                
                q[opt_k] = clean_opt
                
                m_body = re.search(r'Comprehension\s*\(\s*Q\.?\s*\d+\s*[-–]\s*\d+\s*\)\s*(?:Read the passage.*?:)?\s*(.*)', passage_raw, re.S | re.I)
                body = m_body.group(1).strip() if m_body else passage_raw
                passages_to_apply.append((q_start, q_end, f"Comprehension (Q. {q_start} - {q_end})", body))
                
    for q_start, q_end, hdr, body in passages_to_apply:
        unwrapped_body = unwrap_text(body)
        for qn in range(q_start, q_end + 1):
            if 1 <= qn <= len(questions):
                target_q = questions[qn - 1]
                cur_text = target_q.get("question_text", "")
                if "Comprehension (Q." not in cur_text:
                    new_text = f"**{hdr}:**\n{unwrapped_body}\n\n---\n\n{cur_text}"
                    target_q["question_text"] = new_text

    for q in questions:
        q["question_text"] = unwrap_text(q.get("question_text", ""))
        for opt_k in ['option_a', 'option_b', 'option_c', 'option_d']:
            q[opt_k] = clean_option_text(q.get(opt_k, ""))
            
    return questions

def generate_txt_content(paper_title, questions):
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

# 1. Fetch papers from Supabase
print("Fetching 2026 papers from Supabase...", flush=True)
res_p = session.get(f"{supabase_url}/rest/v1/previous_papers?year=eq.2026&select=id,title,year&order=id.asc", headers=headers)
db_papers = res_p.json() if res_p.ok else []
print(f"Found {len(db_papers)} papers in Supabase.\n", flush=True)

# Map paper title to db paper_id
paper_id_map = {p["title"].lower().strip(): p["id"] for p in db_papers}

# 2. Iterate and process each paper
files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))
print(f"Processing all {len(files)} 2026 backup files...\n", flush=True)

total_updated_in_db = 0

for idx, fpath in enumerate(files):
    fname = os.path.basename(fpath)
    base_name = os.path.splitext(fname)[0]
    
    with open(fpath, "r", encoding="utf-8") as f:
        questions = json.load(f)
        
    cleaned_questions = process_paper_data(questions, fname)
    
    # Save back to local JSON backup
    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(cleaned_questions, f, ensure_ascii=False, indent=2)
        
    # Also save to F:\startup  send mail\2026/
    f_json_path = os.path.join(pdf_dir, fname)
    with open(f_json_path, "w", encoding="utf-8") as f:
        json.dump(cleaned_questions, f, ensure_ascii=False, indent=2)
        
    # Get paper title from DB or from filename
    # E.g. "ssc-cgl-2026-30-september-2026-shift-2" -> match db_papers
    paper_id = None
    matched_title = None
    for p in db_papers:
        # Check title similarity
        date_shift = base_name.replace("ssc-cgl-2026-", "").replace("-", " ")
        if date_shift.lower() in p["title"].lower():
            paper_id = p["id"]
            matched_title = p["title"]
            break
            
    if not paper_id and idx < len(db_papers):
        paper_id = db_papers[idx]["id"]
        matched_title = db_papers[idx]["title"]
        
    # Generate TXT content and save
    txt_content = generate_txt_content(matched_title or base_name, cleaned_questions)
    
    local_txt_path = os.path.join(backup_dir, f"{base_name}.txt")
    with open(local_txt_path, "w", encoding="utf-8") as f:
        f.write(txt_content)
        
    f_txt_path = os.path.join(pdf_dir, f"{base_name}.txt")
    with open(f_txt_path, "w", encoding="utf-8") as f:
        f.write(txt_content)
        
    # Update Supabase database
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
print(f"MASTER UPDATE COMPLETE!")
print(f"Total Papers Processed: {len(files)}")
print(f"Total Questions Updated in DB: {total_updated_in_db}")
print("=" * 60)
