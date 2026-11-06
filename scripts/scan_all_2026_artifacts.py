import requests
import json
import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('.env.local') as f:
    env = dict(line.strip().split('=', 1) for line in f if '=' in line and not line.startswith('#'))

url = env['NEXT_PUBLIC_SUPABASE_URL'].strip('\"\'')
key = env['SUPABASE_SERVICE_ROLE_KEY'].strip('\"\'')
headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

# Get all 2026 papers
papers = requests.get(f'{url}/rest/v1/previous_papers?year=eq.2026&order=id.asc', headers=headers).json()
print(f"Total 2026 papers: {len(papers)}")

section_pattern = re.compile(r'\b(GENERAL\s+INTELLIGENCE(\s+(&|AND)\s+REASONING)?|GENERAL\s+AWARENESS|QUANTITATIVE\s+APTITUDE|ENGLISH\s+LANGUAGE|ENGLISH\s+COMPREHENSION)\b', re.I)
page_num_pattern = re.compile(r'(?:\b\d+\s+)?\b(INTELLIGENCE|AWARENESS|QUANTITATIVE|APTITUDE|ENGLISH)\b|\b\d+\s+(AWARENESS|INTELLIGENCE|APTITUDE|LANGUAGE)\b', re.I)

total_option_artifacts = 0
papers_with_opt_artifacts = set()
questions_with_newlines = 0
total_questions = 0

sample_artifacts = []

for p in papers:
    pid = p['id']
    title = p['title']
    qs = requests.get(f'{url}/rest/v1/paper_questions?paper_id=eq.{pid}&order=question_number.asc', headers=headers).json()
    total_questions += len(qs)
    
    for q in qs:
        qn = q['question_number']
        qt = q['question_text'] or ""
        if '\n' in qt:
            questions_with_newlines += 1
            
        opts = {'A': q['option_a'] or "", 'B': q['option_b'] or "", 'C': q['option_c'] or "", 'D': q['option_d'] or ""}
        for opt_k, opt_v in opts.items():
            # Check for section names or page numbers at the end
            if section_pattern.search(opt_v):
                total_option_artifacts += 1
                papers_with_opt_artifacts.add(pid)
                sample_artifacts.append((title, qn, opt_k, opt_v))
            # Check trailing page number like "word 4" where 4 is standalone page num
            elif re.search(r'[a-zA-Z\.\,\)\]]\s+\d{1,2}$', opt_v.strip()) and not re.search(r'(Article|Rule|Schedule|Clause|Section|Shift|Tier|Option|Case|No|Group|Table|Fig|Figure|Part)\s+\d+$', opt_v.strip(), re.I):
                # Check if it looks like a page number (1-30)
                m = re.search(r'\s+(\d{1,2})$', opt_v.strip())
                if m:
                    val = int(m.group(1))
                    if 1 <= val <= 25:
                        total_option_artifacts += 1
                        papers_with_opt_artifacts.add(pid)
                        sample_artifacts.append((title, qn, opt_k, opt_v))

print(f"Total questions checked: {total_questions}")
print(f"Questions with newlines: {questions_with_newlines} ({questions_with_newlines/total_questions*100:.1f}%)")
print(f"Total option header/footer/page artifacts detected: {total_option_artifacts}")
print(f"Papers affected by option artifacts: {len(papers_with_opt_artifacts)} / {len(papers)}")
print("\nSample option artifacts (first 25):")
for item in sample_artifacts[:25]:
    print(f"  {item[0]} | Q.{item[1]} Opt {item[2]}: {repr(item[3])}")
