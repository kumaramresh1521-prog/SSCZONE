import json

with open('type2_parsed_explanations.json', 'r', encoding='utf-8') as f:
    raw_exp = json.load(f)

with open('type2_questions_raw.json', 'r', encoding='utf-8') as f:
    raw_qs = json.load(f)

raw_qs_by_num = {q['question_number']: q for q in raw_qs}

check_qns = [40, 82, 95, 105, 122, 174, 198, 210, 211, 214, 217, 220, 224, 226, 238, 248, 252, 253, 277, 280, 282, 283]

for qn in check_qns:
    print(f"=== Q{qn} ===")
    if qn in raw_qs_by_num:
        rq = raw_qs_by_num[qn]
        print("Raw Q:", rq.get('question_text'))
        print(f"Raw Opts: A: {rq.get('option_a')} | B: {rq.get('option_b')} | C: {rq.get('option_c')} | D: {rq.get('option_d')}")
        print("Raw Exam:", rq.get('exam_tag'))
    k = str(qn)
    if k in raw_exp:
        re = raw_exp[k]
        print(f"Raw Ans digit: {re.get('ans_digit')}")
        print("Raw Exp in cache:\n", re.get('explanation', '')[:300])
    else:
        print("Not found in raw_exp")
    print("-" * 60)
