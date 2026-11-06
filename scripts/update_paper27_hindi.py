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
HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf"
doc = fitz.open(pdf_path)
full_text = ""
for page in doc:
    full_text += page.get_text() + "\n"

# In this PDF, question numbers are 01., 02., ... 99., 100.
pattern = re.compile(
    r'(?:^|\n)(0[1-9]|[1-9]\d|100)\.\s+(.*?)\n\s*\(A\)\s*(.*?)\n\s*\(B\)\s*(.*?)\n\s*\(C\)\s*(.*?)\n\s*\(D\)\s*(.*?)\n\s*Ans:\s*([A-D])',
    re.DOTALL
)

matches = pattern.findall(full_text)
print(f"Total matched questions from PDF: {len(matches)}")

pdf_data = {}
for m in matches:
    qnum = int(m[0])
    qtext = ' '.join(m[1].strip().split())
    pdf_data[qnum] = {
        'num': qnum,
        'text': qtext,
        'a': ' '.join(m[2].strip().split()),
        'b': ' '.join(m[3].strip().split()),
        'c': ' '.join(m[4].strip().split()),
        'd': ' '.join(m[5].strip().split()),
        'ans': m[6].strip()
    }

# Also manually add Q.56 and Q.76
pdf_data[56] = {
    'num': 56,
    'text': 'दो शंकुओं की ऊंचाइयों का अनुपात 1:3 है और उनके आधारों की त्रिज्याओं का अनुपात 3:1 है। उनके आयतनों का अनुपात क्या है?',
    'a': '3:4', 'b': '4:3', 'c': '3:1', 'd': '2:3', 'ans': 'C'
}
pdf_data[76] = {
    'num': 76,
    'text': 'Identify the correct tense used in the sentence: "Medical interventions, such as pharmacotherapy and bariatric surgery, have offered relief for some, but they are not without risks."',
    'a': 'Past Perfect', 'b': 'Present perfect', 'c': 'Simple Past', 'd': 'Present Continuous', 'ans': 'B'
}

# Fetch DB questions for Paper 27
r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.27&order=question_number.asc', headers=HEADERS)
db_qs = r.json()
print(f"Found {len(db_qs)} DB questions for Paper 27")

updated_count = 0
for db_q in db_qs:
    qnum = db_q['question_number']
    if qnum > 75:
        # English Comprehension section: keep English
        continue
    pdf_q = pdf_data.get(qnum)
    if not pdf_q or not pdf_q['text']:
        continue
    
    # Merge DB English question with authentic PDF Hindi question
    db_text = db_q['question_text'].strip()
    hi_text = pdf_q['text'].strip()
    
    # Avoid duplicating if already merged
    if hi_text in db_text:
        merged_q = db_text
    else:
        merged_q = f"{db_text} {hi_text}"
        
    def merge_opt(db_opt, hi_opt):
        db_opt = (db_opt or "").strip()
        hi_opt = (hi_opt or "").strip()
        if not hi_opt or hi_opt.lower() == db_opt.lower() or hi_opt in db_opt:
            return db_opt
        # If option is letter code (e.g. LJQX or 142 or 3:1), keep as is
        if re.match(r'^[A-Z0-9\s:,\-\.\+/\(\)]+$', db_opt, re.IGNORECASE) and re.match(r'^[A-Z0-9\s:,\-\.\+/\(\)]+$', hi_opt, re.IGNORECASE):
            return db_opt
        return f"{db_opt} / {hi_opt}"

    payload = {
        'question_text': merged_q,
        'option_a': merge_opt(db_q['option_a'], pdf_q['a']),
        'option_b': merge_opt(db_q['option_b'], pdf_q['b']),
        'option_c': merge_opt(db_q['option_c'], pdf_q['c']),
        'option_d': merge_opt(db_q['option_d'], pdf_q['d']),
    }
    
    patch_r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/paper_questions?id=eq.{db_q['id']}",
        json=payload,
        headers=HEADERS
    )
    if patch_r.status_code in (200, 204):
        updated_count += 1
    else:
        print(f"Error updating Q.{qnum}: {patch_r.status_code} {patch_r.text}")

print(f"Successfully updated {updated_count} questions for Paper 27 with authentic PDF Hindi!")
