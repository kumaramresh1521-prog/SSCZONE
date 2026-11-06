import glob
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def smart_split(text):
    if not text:
        return "", "", False
    devanagari = re.search(r'[\u0900-\u097F]', text)
    if not devanagari:
        return text.strip(), "", False
        
    first_hi = devanagari.start()
    prefix = text[:first_hi]
    
    # 1. First check if there is an explicit newline or pipe or slash divider before Hindi
    # e.g. "English text\n\nHindi text" or "English / Hindi"
    slash_match = re.search(r'\s+[\/\|]\s+', prefix)
    
    # 2. Check for sentence-ending punctuation right before first_hi:
    # Sentence ending punctuation is '?' or '.' followed by whitespace.
    # NEVER split on colon ':' because colons introduce statements, ratios (3:4), or definitions!
    m = re.search(r'(\?|\.\s|\.\n)\s*(["\w\s\d\+\-\=\/\^\{\}\(\)\[\]]{0,60})$', prefix)
    if m:
        punct_pos = m.start() + len(m.group(1))
        # Ensure we don't cut in the middle of a decimal number like 3.5 cm
        if not (m.group(1).startswith('.') and m.start() > 0 and prefix[m.start()-1].isdigit()):
            en = text[:punct_pos].strip()
            hi = text[punct_pos:].strip()
            return en, hi, True
            
    en = text[:first_hi].strip()
    hi = text[first_hi:].strip()
    return en, hi, True

json_files = glob.glob(r'src/data/pyq_backup/*.json')
print(f"Auditing {len(json_files)} local JSON backup files...")

issues = []
colon_ends = []
short_en = []

for jf in json_files:
    fname = jf.split('\\')[-1]
    with open(jf, 'r', encoding='utf-8') as f:
        try:
            qs = json.load(f)
        except Exception:
            continue
            
    for q in qs:
        raw = q.get('question_text') or ""
        en, hi, is_bi = smart_split(raw)
        if is_bi:
            if en.endswith(':'):
                colon_ends.append((fname, q.get('question_number'), en, hi[:40]))
            elif len(en) < 20 and len(raw) > 30:
                short_en.append((fname, q.get('question_number'), en, hi[:40]))

print(f"Results across all files:")
print(f"  English ending with colon: {len(colon_ends)}")
for c in colon_ends[:10]:
    print(f"    [{c[0]}] Q{c[1]}: EN='{c[2]}' | HI='{c[3]}'")

print(f"  Suspiciously short English (<20 chars): {len(short_en)}")
for s in short_en[:10]:
    print(f"    [{s[0]}] Q{s[1]}: EN='{s[2]}' | HI='{s[3]}'")
