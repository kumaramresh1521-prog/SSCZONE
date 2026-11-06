import fitz
import json
import glob
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r"c:\ssczone\src\data\pyq_backup"
pdf_dir = r"F:\startup  send mail\2026"

# 6 cloze papers mapping: json_pattern -> pdf_name
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
    # Do NOT strip if it's "Only 1", "Both 1 and 2", "Article 368", "1, 2, 3, 4", "Rule 14", "Option 2"
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
    text = re.sub(r'\n+\s*\d{1,2}\s*\n+(?=[a-z])', ' ', text) # standalone page number on its own line followed by lowercase word
    
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
    passages_to_apply = [] # list of (q_start, q_end, passage_header, passage_text)
    
    # Check if this paper is one of the 6 cloze papers
    if fname in cloze_papers_map:
        pdf_name = cloze_papers_map[fname]
        pdf_path = os.path.join(pdf_dir, pdf_name)
        res = parse_q95_and_passage(pdf_path)
        if res:
            q95 = questions[94] # index 94 is Q.95
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
    
    # Scan for Comprehension in options
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
                
                # Update option to clean text
                q[opt_k] = clean_opt
                
                # Parse passage body
                m_body = re.search(r'Comprehension\s*\(\s*Q\.?\s*\d+\s*[-–]\s*\d+\s*\)\s*(?:Read the passage.*?:)?\s*(.*)', passage_raw, re.S | re.I)
                body = m_body.group(1).strip() if m_body else passage_raw
                passages_to_apply.append((q_start, q_end, f"Comprehension (Q. {q_start} - {q_end})", body))
                
    # Apply passages to target questions
    for q_start, q_end, hdr, body in passages_to_apply:
        unwrapped_body = unwrap_text(body)
        for qn in range(q_start, q_end + 1):
            if 1 <= qn <= len(questions):
                target_q = questions[qn - 1]
                cur_text = target_q.get("question_text", "")
                if "Comprehension (Q." not in cur_text:
                    new_text = f"**{hdr}:**\n{unwrapped_body}\n\n---\n\n{cur_text}"
                    target_q["question_text"] = new_text

    # Now unwrap all question_texts and clean all options
    for q in questions:
        q["question_text"] = unwrap_text(q.get("question_text", ""))
        for opt_k in ['option_a', 'option_b', 'option_c', 'option_d']:
            q[opt_k] = clean_option_text(q.get(opt_k, ""))
            
    return questions, len(passages_to_apply)

# Test run on all 29 papers
files = glob.glob(os.path.join(backup_dir, "*2026*.json"))
print(f"Testing dry run on all {len(files)} 2026 papers...\n")

total_passages_applied = 0
for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        qs = json.load(f)
    cleaned_qs, num_p = process_paper_data(qs, fname)
    total_passages_applied += num_p
    # Quick sanity check on every question
    for q in cleaned_qs:
        assert len(q["option_a"]) > 0, f"{fname} Q.{q['question_number']} Opt A is empty"
        assert len(q["option_b"]) > 0, f"{fname} Q.{q['question_number']} Opt B is empty"
        assert len(q["option_c"]) > 0, f"{fname} Q.{q['question_number']} Opt C is empty"
        assert len(q["option_d"]) > 0, f"{fname} Q.{q['question_number']} Opt D is empty"
        assert q["correct_answer"] in ['A', 'B', 'C', 'D'], f"{fname} Q.{q['question_number']} Invalid ans"

print(f"All {len(files)} papers passed dry-run verification perfectly!")
print(f"Total Comprehension passages linked: {total_passages_applied}")
