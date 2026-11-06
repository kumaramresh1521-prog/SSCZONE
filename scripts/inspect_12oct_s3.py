import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\ssczone\src\data\pyq_backup\ssc-cgl-2026-12-october-2026-shift-3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=" * 70)
print("12 Oct Shift 3 - ALL QUESTIONS OVERVIEW")
print("=" * 70)

for q in data:
    qn = q['question_number']
    qt = q.get('question_text', '')
    oa = q.get('option_a', '')
    ob = q.get('option_b', '')
    oc = q.get('option_c', '')
    od = q.get('option_d', '')
    ans = q.get('correct_answer', '')

    print(f"\nQ.{qn} ({ans}): {repr(qt[:200])}")
    print(f"  A: {repr(oa[:100])}")
    print(f"  B: {repr(ob[:100])}")
    print(f"  C: {repr(oc[:100])}")
    print(f"  D: {repr(od[:100])}")
