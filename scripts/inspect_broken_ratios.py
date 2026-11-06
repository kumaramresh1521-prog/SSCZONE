import json
import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

targets = [
    ("ssc-cgl-2026-1-october-2026-shift-1", 75, r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf"),
    ("ssc-cgl-2026-1-october-2026-shift-2", 52, r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 2).pdf"),
    ("ssc-cgl-2026-5-october-2026-shift-1", 74, r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 5 Oct 2026 Shift 1).pdf"),
    ("ssc-cgl-2026-7-october-2026-shift-2", 74, r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 7 Oct 2026 Shift 2).pdf"),
]

for base, qn, pdf_path in targets:
    print(f"\n==================== {base} Q.{qn} ====================")
    # Check current JSON
    json_path = f"src/data/pyq_backup/{base}.json"
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    q = next(item for item in data if item['question_number'] == qn)
    print("Question:", q['question_text'])
    print(f"Current JSON: A='{q['option_a']}' | B='{q['option_b']}' | C='{q['option_c']}' | D='{q['option_d']}' [Ans: {q['correct_answer']}]")
    
    # Check PDF
    doc = fitz.open(pdf_path)
    for pno, page in enumerate(doc):
        t = page.get_text()
        lines = t.split('\n')
        for i, l in enumerate(lines):
            if l.strip().startswith(f"{qn}.") or l.strip().startswith(f"{qn:02d}."):
                print(f"PDF Page {pno+1}:")
                for j in range(max(0, i), min(len(lines), i+20)):
                    print("   " + lines[j].strip())
                break
