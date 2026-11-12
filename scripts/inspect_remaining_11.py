import json

qs = json.load(open('type2_questions_raw.json', encoding='utf-8'))
lines = json.load(open('type2_expl_lines_cache.json', encoding='utf-8'))[70:2258]
full_text = '\n' + '\n'.join(lines)

targets = [46, 56, 69, 70, 126, 192, 193, 195, 215, 216, 218]

for t in targets:
    q_item = qs[t-1]
    print(f"=== Q{t} ===")
    print("Q Text:", q_item['question_text'][:80])
    print(f"Opts: A) {q_item['option_a']} | B) {q_item['option_b']} | C) {q_item['option_c']} | D) {q_item['option_d']}")
    
    # search around t in explanation full_text
    pos = full_text.find(f"{t}.")
    if pos == -1: pos = full_text.find(f"{t}(")
    if pos == -1: pos = full_text.find(f"{t} .")
    if pos != -1:
        snippet = full_text[max(0, pos-20):min(len(full_text), pos+150)]
        print("Expl snippet:", repr(snippet))
    else:
        print("Expl: NOT FOUND BY SIMPLE STRING")
