import json, re, sys
sys.path.insert(0, 'scripts')
import solve_t4_254_v3 as v3

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

manually_verified_exams = {1, 65, 121, 154, 155, 184, 185, 186, 187, 217, 245, 246, 247, 248, 249}

# Clean unambiguous OCR patterns first
def preclean_exam(ex):
    s = ex.strip()
    if not s.startswith('('): s = '(' + s
    if not s.endswith(')'): s = s + ')'
    # Fix standard exam name OCR typos
    s = re.sub(r'\bSSCCGL\b', 'SSC CGL', s)
    s = re.sub(r'\bSSCCHSL\b', 'SSC CHSL', s)
    s = re.sub(r'\bSSCMTS\b', 'SSC MTS', s)
    s = re.sub(r'\bSSCCAPFs\b', 'SSC CAPFs', s)
    s = re.sub(r'\bT[ilI1eE][er]{2}-?[1IJ]\b', 'Tier-I', s, flags=re.I)
    s = re.sub(r'\bT[ilI1eE][er]{2}-?\b', 'Tier-I', s, flags=re.I)
    s = re.sub(r'\(1[O0]\s*\+\s*2\)', '(10+2)', s)
    s = re.sub(r'\b10\s*\+\s*2\b', '10+2', s)
    return s

need_visual = []
for item in raw:
    qn = item['q_num']
    if qn in manually_verified_exams:
        continue
    fix = v3.manual.get(qn, {})
    ex = fix.get('exam_tag', item.get('exam_tag', ''))
    # Does it already have a crystal-clear unambiguous Shift (like Shift-I, Shift-II, Shift-III, Shift-IV, Shift-Il, Shift-1, etc.) + full DD.MM.YYYY?
    has_date = bool(re.search(r'\d{2}\.\d{2}\.\d{4}', ex))
    m_sh = re.search(r'(?:Shift|Shif|Slift|Shiff|Shft|Shit|Sht|Stif|Shir|Shin|Shi|Shtft|Shff|Siift)\s*[-:\.]?\s*([A-Za-z0-9]+)', ex, re.I)
    if has_date and ('Sitting' in ex or 'TFNo' in ex or 'Kolkata' in ex):
        continue
    if has_date and m_sh:
        tok = m_sh.group(1)
        # Strict unambiguous tokens: ONLY exact I, II, III, IV, or unambiguous II variants like Il, 1l, I1, lI, 1I, II1->? No, 1l/Il could be II vs II! Wait check if I/II/III/IV exact!
        if tok in {'I', 'II', 'III', 'IV'}:
            continue
    need_visual.append((qn, ex))

print(f"Truly needing visual exam verification: {len(need_visual)}")
for qn, ex in need_visual:
    print(f"  Q{qn:3d}: {repr(ex)}")
