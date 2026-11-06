import fitz
import sys
import re
import requests

sys.stdout.reconfigure(encoding='utf-8')

env = {}
with open(r'c:\ssczone\.env.local', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('"\'')

SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
HEADERS = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf"
doc = fitz.open(pdf_path)
full_text = ""
for page in doc:
    full_text += page.get_text() + "\n"

# Split by question numbers
blocks = re.split(r'\n(?=\d{1,3}\.\s+)', full_text)

pdf_questions = {}
for b in blocks:
    m = re.match(r'(\d{1,3})\.\s+(.*)', b, re.DOTALL)
    if not m:
        continue
    qnum = int(m.group(1))
    content = m.group(2).strip()
    
    ans_m = re.search(r'Ans:\s*([A-D])', content)
    ans = ans_m.group(1) if ans_m else ""
    
    # Try regex for options: (A)... (B)... (C)... (D)...
    opt_m = re.search(r'\(A\)\s*(.*?)\s*\(B\)\s*(.*?)\s*\(C\)\s*(.*?)\s*\(D\)\s*(.*?)(?=\s*Ans:|$)', content, re.DOTALL)
    if opt_m:
        qtext = content[:opt_m.start()].strip()
        opta = ' '.join(opt_m.group(1).split())
        optb = ' '.join(opt_m.group(2).split())
        optc = ' '.join(opt_m.group(3).split())
        optd = ' '.join(opt_m.group(4).split())
    else:
        # Fallback if options format differs
        qtext = content
        opta, optb, optc, optd = "", "", "", ""
        
    pdf_questions[qnum] = {
        'num': qnum,
        'text': ' '.join(qtext.split()),
        'a': opta,
        'b': optb,
        'c': optc,
        'd': optd,
        'ans': ans
    }

print(f"Extracted {len(pdf_questions)} questions from PDF")

# Fetch DB questions for Paper 27
r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.27&order=question_number.asc', headers=HEADERS)
db_qs = r.json()

print(f"Total DB questions: {len(db_qs)}")
for q in db_qs[:5]:
    qnum = q['question_number']
    pdf_q = pdf_questions.get(qnum)
    print(f"\n--- Q.{qnum} ---")
    print("DB Text: ", q['question_text'])
    print("PDF Hindi:", pdf_q['text'] if pdf_q else "None")
    print("DB OptA: ", q['option_a'], " | PDF OptA:", pdf_q['a'] if pdf_q else "None")
