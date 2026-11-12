import sys
sys.path.insert(0, 'scripts')
import solve_t4_254_v3 as v3

# Inspect rid prefixes dynamically
sample_rids = set()
for item in v3.parsed:
    qn = item['q_num']
    fix = v3.manual.get(qn, {})
    qt = fix.get('question_text', item['question_text'])
    opts = fix.get('options', item['options'])
    kind, payload = v3.parse_q_v3(qt, opts)
    if kind in ('one_ex_to_ans', 'two_ex_to_ans', 'ex_list_to_ans', 'rev_ex_to_ans', 'pair_match'):
        ex_pairs = [payload[0]] if kind == 'one_ex_to_ans' else ([payload[0], payload[1]] if kind == 'two_ex_to_ans' else (payload[0] if kind in ('ex_list_to_ans','rev_ex_to_ans') else payload))
        for r in v3.find_pair_rule_v3(*ex_pairs[0]):
            sample_rids.add(r[0].split(':')[0].split('_')[0] + ':' + r[0][:14])

# Print the exact 18 Qs that previously matched sort_asc_ / sort_desc_ and see what OTHER rules matched them!
for item in v3.parsed:
    qn = item['q_num']
    _, desc = v3.verified[qn]
    if desc.startswith('sort_asc then') or desc.startswith('sort_desc then'):
        fix = v3.manual.get(qn, {})
        qt = fix.get('question_text', item['question_text'])
        opts = fix.get('options', item['options'])
        kind, payload = v3.parse_q_v3(qt, opts)
        ex_pairs = payload[0] if kind in ('ex_list_to_ans', 'rev_ex_to_ans') else ([payload[0], payload[1]] if kind == 'two_ex_to_ans' else [payload[0]])
        rule_sets = [{r[0]: r for r in v3.find_pair_rule_v3(a, b)} for a, b in ex_pairs]
        common = set(rule_sets[0].keys())
        for rs in rule_sets[1:]: common &= set(rs.keys())
        ans_idx = fix.get('correct_ans', v3.p40_ans[qn]) - 1
        rids = [(rid, rule_sets[0][rid][2]) for rid in sorted(common, key=v3.rank_rid)]
        print(f"Q{qn:3d} cur='{desc}' opts={opts} ans={opts[ans_idx]}")
        print(f"     prompt={v3.normalize_prompt(qt)[-45:]}")
        for rid, d in rids:
            print(f"       cand [{rid}]: {d}")
