import json, re, sys
sys.path.insert(0, 'scripts')
import solve_t4_254_v2 as v2

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = {q['q_num']: q for q in json.load(f)}

with open('scripts/pdf_samples/t4_segmented_254.json', 'r', encoding='utf-8') as f:
    segs = {s['q_num']: s for s in json.load(f)}

print("=== WHY Q61 and Q188 HIT WRONG OPTIONS ===")
for qn in [61, 188]:
    q = dict(raw[qn]); q.update(v2.manual.get(qn, {}))
    kind, payload = v2.parse_q_v2(q['question_text'], q['options'])
    print(f"Q{qn} ({kind}): payload={payload}")
    if kind == 'ex_list_to_ans':
        ex_pairs, target = payload
        rs = [{r[0]: r for r in v2.find_pair_rule_v2(a, b)} for a, b in ex_pairs]
        common = set(rs[0].keys())
        for r in rs[1:]: common &= set(r.keys())
        for rid in sorted(common):
            res = rs[0][rid][1](target)
            if res in q['options']:
                print(f"  MATCHED {rid} ({rs[0][rid][2]}) -> {res} (Opt {q['options'].index(res)+1})")
    elif kind == 'pair_match':
        rs = [{r[0]: r for r in v2.find_pair_rule_v2(a, b)} for a, b in payload]
        common = set(rs[0].keys())
        for rid in sorted(common):
            hits = []
            for i, o in enumerate(q['options']):
                oa, ob = [x.strip() for x in o.split(':', 1)]
                if rid in {r[0] for r in v2.find_pair_rule_v2(oa, ob)}:
                    hits.append(i+1)
            if hits:
                print(f"  MATCHED {rid} ({rs[0][rid][2]}) -> Opts {hits}")

print("\n=== ANALYZING SOLVABLE-IF-NORMALIZED QUESTIONS & MATHEMATICAL PATTERNS ===")
test_qs = [29, 68, 70, 76, 78, 82, 87, 92, 96, 97, 100, 103, 104, 106, 110, 111, 113, 118, 120,
           121, 128, 130, 132, 133, 139, 142, 143, 144, 145, 146, 149, 150, 153, 155, 156, 158, 159,
           165, 166, 167, 172, 176, 180, 181, 195, 196, 200, 201, 202, 204, 206, 220, 230, 237, 238, 249, 251, 252]

for qn in test_qs:
    q = dict(raw[qn]); q.update(v2.manual.get(qn, {}))
    ans = v2.manual[qn]['correct_ans'] if (qn in v2.manual and 'correct_ans' in v2.manual[qn]) else v2.p40_ans[qn]
    ans_opt = q['options'][ans - 1]
    qt = v2.normalize_prompt(q['question_text'])
    # Try to pull pairs from colon
    m = re.findall(r'([A-Za-z0-9\?_]+(?:\s+\d+)?)\s*:\s*([A-Za-z0-9\?_]+(?:\s+\d+)?)', qt)
    print(f"Q{qn:3d} Ans={ans}({ans_opt}) | pairs={m} | {segs[qn]['lines'][0]['col_name']}")
