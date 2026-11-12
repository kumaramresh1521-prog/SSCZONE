import json
import re

with open('kiran_type1_284_verified.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

with open('type1_real_explanations.json', 'r', encoding='utf-8') as f:
    real_expl = json.load(f)

print(f"Loaded {len(qs)} questions and {len(real_expl)} real explanations.")

kiran_count = 0
generated_count = 0

for q in qs:
    num_str = str(q['question_number'])
    if num_str in real_expl and len(real_expl[num_str].strip()) > 10:
        expl = real_expl[num_str].strip()
        expl = re.sub(r'\s+', ' ', expl)
        expl = re.sub(r'K5279/\d+', '', expl).strip()
        q['explanation'] = expl
        kiran_count += 1
    else:
        corr_ans = q['correct_answer']
        opts = {'A': q['option_a'], 'B': q['option_b'], 'C': q['option_c'], 'D': q['option_d']}
        ans_text = opts.get(corr_ans, '')
        q_txt = q['question_text']
        q['explanation'] = f"In the given analogy relationship '{q_txt}', ({corr_ans}) '{ans_text}' correctly completes the pair based on the established semantic connection."
        generated_count += 1

with open('kiran_type1_284_verified.json', 'w', encoding='utf-8') as f:
    json.dump(qs, f, ensure_ascii=False, indent=2)

print(f"Successfully updated! Kiran book explanations: {kiran_count}, Synthesized explanations: {generated_count}")
