import json
import re
import requests
import sys

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

# Get Paper 6 details
r = requests.get(f'{SUPABASE_URL}/rest/v1/previous_papers?id=eq.6', headers=HEADERS)
paper = r.json()[0]
print('Paper 6:', paper['title'], paper.get('exam_date'), paper.get('shift'))

# Get Paper 6 Q53 options and details
r_q = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.6&question_number=eq.53', headers=HEADERS)
q53 = r_q.json()[0]
print('Paper 6 Q53:')
print('  question_text:', q53['question_text'])
print('  question_text_hi:', q53.get('question_text_hi'))
print('  option_a:', q53['option_a'])
print('  option_b:', q53['option_b'])
print('  option_c:', q53['option_c'])
print('  option_d:', q53['option_d'])
print('  correct_answer:', q53['correct_answer'])
print('  explanation:', q53.get('explanation'))
