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

# Split questions
# Regex matching question numbers like "01. ", "02. ", ..., "99. ", "100. "
pattern = re.compile(
    r'\n(\d{1,3})\.\s+(.*?)\n\s*\(A\)\s+(.*?)\n\s*\(B\)\s+(.*?)\n\s*\(C\)\s+(.*?)\n\s*\(D\)\s+(.*?)\n\s*Ans:\s*([A-D])',
    re.DOTALL
)

matches = pattern.findall(full_text)
print(f"Extracted {len(matches)} questions from PDF")

pdf_data = {}
for m in matches:
    q_num = int(m[0])
    q_text = ' '.join(m[1].strip().split())
    pdf_data[q_num] = {
        'num': q_num,
        'text': q_text,
        'a': ' '.join(m[2].strip().split()),
        'b': ' '.join(m[3].strip().split()),
        'c': ' '.join(m[4].strip().split()),
        'd': ' '.join(m[5].strip().split()),
        'ans': m[6].strip()
    }

# Fetch DB questions for Paper 27
r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.27&order=question_number.asc', headers=HEADERS)
db_qs = r.json()
print(f"DB has {len(db_qs)} questions for Paper 27")

match_count = 0
for db_q in db_qs:
    qnum = db_q['question_number']
    if qnum in pdf_data:
        match_count += 1

print(f"Matches found: {match_count} / {len(db_qs)}")
