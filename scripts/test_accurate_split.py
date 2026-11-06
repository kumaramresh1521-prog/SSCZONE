import requests
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

devanagari = re.compile(r'[\u0900-\u097F]')

def split_bilingual_accurate(text):
    if not text:
        return "", "", False
    
    # If no Devanagari at all, it's 100% English
    if not devanagari.search(text):
        return text.strip(), "", False
        
    # Check if there is an explicit option slash: "Apple / सेब"
    if " / " in text:
        parts = text.split(" / ")
        if len(parts) >= 2:
            en = parts[0].strip()
            hi = " / ".join(parts[1:]).strip()
            if devanagari.search(hi):
                return en, hi, True

    # Find the position where Hindi starts.
    # In official SSC bilingual papers:
    # 1. The first Devanagari character appears at index `first_hi`.
    # 2. Before `first_hi`, there might be a quoted word or token that belongs to the Hindi sentence
    #    (e.g., 'consonant? "SIGNATURE" में...' -> "SIGNATURE" belongs to Hindi).
    #    This happens ONLY if there is a sentence ending punctuation (? or .) before that word!
    first_hi = devanagari.search(text).start()
    
    prefix = text[:first_hi]
    suffix = text[first_hi:]
    
    # Check if there is sentence terminator (? or . or :) in prefix
    # Look from right to left in prefix:
    # If immediately before first_hi (within last ~30 chars) there is '? ' or '.\n' or ': '
    # that separates English question from Hindi question
    # e.g., '...consonant? "SIGNATURE" ' -> English is '...consonant?', Hindi is '"SIGNATURE" ...'
    # e.g., '...formed? GARDEN ' -> English is '...formed?', Hindi is 'GARDEN ...'
    # e.g., '...word? "ELEVATE" ' -> English is '...word?', Hindi is '"ELEVATE" ...'
    
    # Let's check regex for '? ' followed by an optional token before first_hi
    m = re.search(r'(\?|\.\s|\.\n|:\s)\s*(["\w\s\d\+\-\=]{1,35})$', prefix)
    if m:
        # Punctuation was found shortly before first_hi!
        punct_pos = m.start(1) + len(m.group(1))
        en_part = text[:punct_pos].strip()
        hi_part = text[punct_pos:].strip()
        return en_part, hi_part, True
        
    # Otherwise, the English part ends exactly where the first Devanagari character begins!
    en_part = text[:first_hi].strip()
    hi_part = text[first_hi:].strip()
    return en_part, hi_part, True

# Test on Paper 6
r = requests.get(f'{SUPABASE_URL}/rest/v1/paper_questions?paper_id=eq.6&order=question_number.asc', headers=HEADERS)
qs = r.json()

print("Testing split on Paper 6:")
for q in qs[:25]:
    en, hi, is_bi = split_bilingual_accurate(q['question_text'])
    print(f"\n[Q.{q['question_number']}] (is_bi={is_bi})")
    print(f"  EN: {en}")
    print(f"  HI: {hi}")
