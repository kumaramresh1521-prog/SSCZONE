import requests
import json
import re
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

r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.25&question_number=gte.51&question_number=lte.70&order=question_number.asc', headers=HEADERS)
qs = r.json()

# Test translator logic from translator.ts
def maskProtectedTokens(text):
    tokens = []
    placeholder = lambda idx: f"___PROTECT_{idx}___"
    current = text

    def replaceWithToken(regex):
        nonlocal current
        def repl(match):
            tokens.append(match.group(0))
            return placeholder(len(tokens) - 1)
        current = re.sub(regex, repl, current)

    # 1. Protect Markdown Images & HTML Tags
    replaceWithToken(r'!\[[^\]]*\]\([^\s)]+\)')
    replaceWithToken(r'<img\b[^>]*>')
    replaceWithToken(r'<[^>]+>')

    # 2. Protect LaTeX Math Delimiters
    replaceWithToken(r'(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$\n]+\$)')

    # 3. Protect Quoted words/codes
    replaceWithToken(r'(["\'])(?:(?=(\\?))\2.)*?\1')

    # 4. Protect Mixed-Case Coding Words
    replaceWithToken(r'\b(?:[A-Z]+[a-z]+[A-Z][A-Za-z]*|[a-z]+[A-Z]+[a-z]*)\b')

    # 5. Protect Letter Analogies and Series
    replaceWithToken(r'\b[A-Z]{2,}\s*:\s*[A-Z]{2,}\b')
    replaceWithToken(r'\b[A-Z]{2,}(?:\s*,\s*[A-Z]{2,})+\b')
    replaceWithToken(r'\b[A-Z](?:\s*,\s*[A-Z])+\b')
    replaceWithToken(r'\b[A-Z]{1,4}(?:-[A-Z]{1,4})+\b')

    # 6. Protect Operator Substitution Codes
    replaceWithToken(r'\b\d+\s+[A-Z]\s+\d+(?:\s+[A-Z]\s+\d+)*\b')
    replaceWithToken(r'\b[A-Z]\s+(?:denotes|means|stands for|represents)\b')

    return current, tokens

def unmaskTokens(translated, tokens):
    result = translated
    for idx, token in enumerate(tokens):
        p = f"___PROTECT_{idx}___"
        result = result.replace(p, token)
        result = result.replace(f"___ PROTECT_{idx} ___", token)
        result = result.replace(f"___ PROTECT_ {idx} ___", token)
        result = result.replace(f"___सुरक्षित_{idx}___", token)
        result = result.replace(f"___ सुरक्षित_{idx} ___", token)
    return result

import urllib.parse

for q in qs[:10]:
    txt = q['question_text']
    masked, tokens = maskProtectedTokens(txt)
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q={urllib.parse.quote(masked)}"
    try:
        res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}).json()
        raw_trans = ''.join([item[0] for item in res[0] if item[0]])
        final_trans = unmaskTokens(raw_trans, tokens)
        print(f"\n[Q.{q['question_number']}]")
        print("  RAW:    ", txt)
        print("  MASKED: ", masked)
        print("  FINAL:  ", final_trans)
    except Exception as e:
        print(f"Error on Q.{q['question_number']}: {e}")
