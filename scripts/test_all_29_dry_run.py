import fitz
import re
import os
import glob
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_dir = r"F:\startup  send mail\2026"

def get_sort_key(filename):
    m = re.search(r"Held On_?\s*(\d{1,2})\s*([A-Za-z]+)\s*2026\s*Shift\s*(\d)", filename, re.I)
    if m:
        day = int(m.group(1))
        month_str = m.group(2).lower()
        shift = int(m.group(3))
        month = 9 if "sep" in month_str else 10
        return (month, day, shift)
    return (99, 99, 99)

def extract_page_blocks(doc, p_idx):
    page = doc[p_idx]
    blocks = page.get_text("blocks")
    valid_blocks = [b for b in blocks if b[4].strip()]
    
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
        
    return "\n".join(b[4] for b in ordered)

def extract_full_paper(doc):
    full_text = ""
    for p_idx in range(1, len(doc)):
        full_text += "\n" + extract_page_blocks(doc, p_idx)
    return full_text

def test_paper(doc):
    full_text = extract_full_paper(doc)
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
                
    missing = []
    if len(q_spans) < 100:
        found_nums = set(q[0] for q in q_spans)
        missing = [i for i in range(1, 101) if i not in found_nums]
        
    return len(q_spans), missing

files = sorted(glob.glob(os.path.join(pdf_dir, "*.pdf")), key=get_sort_key)
print(f"Testing {len(files)} PDFs:")

all_pass = True
for f in files:
    fname = os.path.basename(f)
    doc = fitz.open(f)
    count, missing = test_paper(doc)
    status = "OK" if count == 100 else "FAIL"
    if count != 100:
        all_pass = False
        print(f"❌ {fname}: {count}/100 (Missing: {missing})")
    else:
        print(f"✅ {fname}: 100/100")

print(f"\nAll 29 PDFs passed 100/100 test: {all_pass}")
