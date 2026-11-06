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

# 1. Parse PDF for 1 Oct 2026 Shift 1
pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf"
doc = fitz.open(pdf_path)
full_text = ""
for page in doc:
    full_text += page.get_text() + "\n"

# Split by question numbers
blocks = re.split(r'\n(?=\d{2}\.\s+)', full_text)
print(f"Total blocks extracted: {len(blocks)}")

pdf_questions = {}
for b in blocks:
    m = re.match(r'(\d{2})\.\s+(.*?)(?=\n\s*\(A\)|\n\s*Ans:|$)', b, re.DOTALL)
    if m:
        q_num = int(m.group(1))
        q_text = ' '.join(m.group(2).strip().split())
        pdf_questions[q_num] = q_text

print(f"Extracted {len(pdf_questions)} Hindi questions from PDF for 1 Oct Shift 1")
print("Sample Q.1:", pdf_questions.get(1))
print("Sample Q.2:", pdf_questions.get(2))
print("Sample Q.4:", pdf_questions.get(4))
