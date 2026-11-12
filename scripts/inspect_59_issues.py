import json, re, os
import sys
sys.path.insert(0, 'scripts')
import solve_t4_254_v2 as v2

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw_parsed = {q['q_num']: q for q in json.load(f)}

print("1. CHECKING POST-MANUAL OPTIONS ACROSS ALL 254:")
for qn in sorted(raw_parsed):
    q = dict(raw_parsed[qn])
    if qn in v2.manual:
        q.update(v2.manual[qn])
    opts = q['options']
    for i, o in enumerate(opts):
        bad = False
        if not o or not o.strip():
            bad = True
        elif qn == 104:
            if not re.match(r'^[A-Z][a-z]+$', o): bad = True
        elif qn == 193:
            if not re.match(r'^[A-Z]+\s+\d+$', o): bad = True
        elif ':' in o:
            if not re.match(r'^[A-Z0-9]+\s*:\s*[A-Z0-9]+$', o): bad = True
        else:
            if not re.match(r'^[A-Z]+$', o): bad = True
        if bad:
            print(f"  Q{qn:3d} Opt{i+1}: {repr(o)}")

print("\n2. CHECKING ALL EXAM TAGS ACROSS ALL 254:")
exam_counts = {}
weird_exams = []
for qn in sorted(raw_parsed):
    ex = raw_parsed[qn].get('exam_tag', '')
    if not re.match(r'^\(SSC .+?\d{2}\.\d{2}\.\d{4}.*\)$', ex) or any(w in ex for w in ['Shif-', 'Slift', 'Tler', 'TIer', 'Tlcr', 'Shm', 'Shit', 'Shift-m', 'Shift-n', 'Shift-Im', 'Shift-D', 'Shift-I)', 'Exam.', 'Multr', 'Multui', 'CHSL(', 'CGL(', 'CPO(', '10\\+2']):
        weird_exams.append((qn, ex))
print(f"Total exam tags needing polish check: {len(weird_exams)}")
for qn, ex in weird_exams[:40]:
    print(f"  Q{qn:3d}: {repr(ex)}")

print("\n3. CHECKING PDF_SAMPLES DIR:")
print(sorted(os.listdir('scripts/pdf_samples')))
