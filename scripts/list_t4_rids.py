import sys
sys.path.insert(0, 'scripts')
import solve_t4_254_v3 as v3

# Collect all solved_desc / kind patterns across 254 Qs
descs = {}
for item in v3.parsed:
    qn = item['q_num']
    fix = v3.manual.get(qn, {})
    qt = fix.get('question_text', item['question_text'])
    opts = fix.get('options', item['options'])
    kind, payload = v3.parse_q_v3(qt, opts)
    ans_num, desc = v3.verified[qn]
    descs.setdefault(desc.split(' ')[0] + ' :: ' + kind, []).append((qn, desc))

print(f"Distinct (desc_prefix :: kind) groups: {len(descs)}")
for k, lst in sorted(descs.items()):
    ex_qn, ex_d = lst[0]
    print(f"  [{len(lst):3d}] e.g. Q{ex_qn:3d}: {ex_d}")
    if len(lst) <= 4 and any(c in ex_d for c in "[]()'"):
        for qn, d in lst:
            print(f"       -> Q{qn:3d}: {d}")
