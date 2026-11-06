import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf"
doc = fitz.open(pdf_path)
full_text = ""
for page in doc:
    full_text += page.get_text() + "\n"

# Split by question numbers (\n01. , \n02. , ... \n100. )
parts = re.split(r'\n(?=\d{1,3}\.\s+)', full_text)

questions = {}
for p in parts:
    m = re.match(r'(\d{1,3})\.\s+(.*)', p, re.DOTALL)
    if not m:
        continue
    qnum = int(m.group(1))
    content = m.group(2).strip()
    
    # Extract options and answer
    # Ans: [A-D]
    ans_m = re.search(r'Ans:\s*([A-D])', content)
    ans = ans_m.group(1) if ans_m else ""
    
    # Options
    # (A) ... (B) ... (C) ... (D) ...
    opt_m = re.search(r'\(A\)\s*(.*?)\s*\(B\)\s*(.*?)\s*\(C\)\s*(.*?)\s*\(D\)\s*(.*?)(?=\s*Ans:|$)', content, re.DOTALL)
    if opt_m:
        qtext = content[:opt_m.start()].strip()
        opta = ' '.join(opt_m.group(1).split())
        optb = ' '.join(opt_m.group(2).split())
        optc = ' '.join(opt_m.group(3).split())
        optd = ' '.join(opt_m.group(4).split())
    else:
        qtext = content
        opta, optb, optc, optd = "", "", "", ""
        
    questions[qnum] = {
        'num': qnum,
        'text': ' '.join(qtext.split()),
        'a': opta,
        'b': optb,
        'c': optc,
        'd': optd,
        'ans': ans
    }

print(f"Total extracted: {len(questions)} / 100")
for qnum in range(1, 101):
    if qnum not in questions:
        print(f"Missing Q.{qnum}")
    elif not questions[qnum]['a']:
        print(f"Missing options for Q.{qnum}")
