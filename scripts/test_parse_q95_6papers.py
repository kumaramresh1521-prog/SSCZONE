import fitz
import sys
import os
import re

sys.stdout.reconfigure(encoding='utf-8')

missing_files = [
    ("ssc-cgl-2026-10-october-2026-shift-3.json", "SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 3).pdf"),
    ("ssc-cgl-2026-12-october-2026-shift-3.json", "SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf"),
    ("ssc-cgl-2026-13-october-2026-shift-2.json", "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 2).pdf"),
    ("ssc-cgl-2026-13-october-2026-shift-3.json", "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 3).pdf"),
    ("ssc-cgl-2026-30-september-2026-shift-3.json", "SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"),
    ("ssc-cgl-2026-6-october-2026-shift-3.json", "SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 3).pdf")
]

pdf_dir = r"F:\startup  send mail\2026"

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
    
    # Extract options A, B, C, D from raw_q95
    opt_match = re.search(r'\(A\)\s+(.*?)\s+\(B\)\s+(.*?)\s+\(C\)\s+(.*?)\s+\(D\)\s+(.*?)$', raw_q95, re.S)
    if opt_match:
        q95_text = raw_q95[:opt_match.start()].strip()
        oa = opt_match.group(1).strip()
        ob = opt_match.group(2).strip()
        oc = opt_match.group(3).strip()
        od = opt_match.group(4).strip()
    else:
        return None
        
    # Extract passage between Ans: X and 96.
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

for jname, pname in missing_files:
    pdf_path = os.path.join(pdf_dir, pname)
    res = parse_q95_and_passage(pdf_path)
    print(f"=== {pname} ===")
    if res:
        print("Q95 Text:", repr(res["text"][:80]))
        print("Opt A:", repr(res["option_a"][:40]))
        print("Opt B:", repr(res["option_b"][:40]))
        print("Opt C:", repr(res["option_c"][:40]))
        print("Opt D:", repr(res["option_d"][:40]))
        print("Ans:", res["answer"])
        print("Passage Header:", repr(res["passage"][:60]) if res["passage"] else "NO PASSAGE")
    else:
        print("FAILED TO PARSE")
    print("-" * 50)
