import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. Load Question Lines
with open('type2_raw_lines_cache.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

# The Type-II questions are in lines 151 to 3448
q_lines = raw_lines[151:3448]
print(f"Loaded {len(q_lines)} question lines for Type-II.")

# Group option blocks
opt_indices = [idx for idx, l in enumerate(q_lines) if re.search(r'\([1-4]\)', l)]
opt_groups = []
curr = []
for idx in opt_indices:
    if not curr or (idx <= curr[-1] + 2 and not any('Exam' in q_lines[k] for k in range(curr[-1]+1, idx))):
        curr.append(idx)
    else:
        opt_groups.append(curr)
        curr = [idx]
if curr:
    opt_groups.append(curr)

print(f"Detected {len(opt_groups)} option groups (target: 307).")
assert len(opt_groups) == 307, f"Expected 307 option groups, got {len(opt_groups)}"

def is_exam_line(l):
    if re.search(r'\b(SSC|Exam|Shift|Sitting|CBE|Tier|Constable|Stenographer|Police|CAPF|CPO|CHSL|MTS|GD|Selection|Post|Staff|Graduate|Clerk)\b', l, re.I):
        return True
    if re.search(r'\d{2}\.\d{2}\.\d{4}', l):
        return True
    if re.search(r'^\s*\(?\s*[\d\.\s\-]+(?:Shift|Sitting)?\s*\)?\s*$', l):
        return True
    return False

def clean_noise(text):
    text = re.sub(r'K5279/\d+', '', text)
    text = re.sub(r'Search onTele.*', '', text)
    text = re.sub(r'@apna.*', '', text)
    text = re.sub(r'\(puom', '', text)
    text = re.sub(r'\(pamoreousipueosuon', '', text)
    text = re.sub(r'^\s*TYPE\s*-\s*I+\s*', '', text, flags=re.I)
    return text.strip()

questions = []
for i in range(len(opt_groups)):
    q_num = i + 1
    grp = opt_groups[i]
    opt_start = grp[0]
    opt_end = grp[-1]

    # Options text
    opt_raw = ' '.join(q_lines[k] for k in grp)
    opt_raw = clean_noise(opt_raw)
    
    # Extract 4 options
    p1 = re.search(r'\(1\)\s*(.*?)(?=\s*\(2\)|\s*\([a-d]\)|$)', opt_raw)
    p2 = re.search(r'\(2\)\s*(.*?)(?=\s*\(3\)|\s*\([a-d]\)|$)', opt_raw)
    p3 = re.search(r'\(3\)\s*(.*?)(?=\s*\(4\)|\s*\([a-d]\)|$)', opt_raw)
    p4 = re.search(r'\(4\)\s*(.*)', opt_raw)
    
    opt_a = p1.group(1).strip() if p1 else ''
    opt_b = p2.group(1).strip() if p2 else ''
    opt_c = p3.group(1).strip() if p3 else ''
    opt_d = p4.group(1).strip() if p4 else ''

    # Question text: from end of previous exam tag to opt_start
    prev_end = 0 if i == 0 else opt_groups[i-1][-1] + 1
    between_prev = q_lines[prev_end:opt_start]
    
    # Split exam tag of previous from question text of current
    exam_prev = []
    curr_q_lines = []
    found_curr_q = False
    
    for bl in between_prev:
        cbl = clean_noise(bl)
        if not cbl:
            continue
        if i == 0:
            curr_q_lines.append(cbl)
        else:
            if not found_curr_q:
                if is_exam_line(cbl):
                    exam_prev.append(cbl)
                else:
                    found_curr_q = True
                    curr_q_lines.append(cbl)
            else:
                curr_q_lines.append(cbl)

    q_text_raw = ' '.join(curr_q_lines).strip()
    # Strip leading question number e.g. "1. " or "134. " or "5e. " or "eo. "
    q_text_clean = re.sub(r'^(?:\d{1,3}|[5e|eo|82|68|ilI\d]+)\s*[\.\,\:\)]\s*', '', q_text_raw).strip()
    if not q_text_clean:
        q_text_clean = q_text_raw

    # For the last question (Q307), its exam tag is after opt_end
    if i == 306:
        after_lines = [clean_noise(l) for l in q_lines[opt_end+1:] if clean_noise(l) and is_exam_line(l)]
        exam_tag = ' '.join(after_lines).strip()
    else:
        # Exam tag of current question is collected in next iteration or we can look forward:
        next_opt_start = opt_groups[i+1][0]
        between_next = q_lines[opt_end+1:next_opt_start]
        curr_exam_lines = []
        for bl in between_next:
            cbl = clean_noise(bl)
            if not cbl:
                continue
            if is_exam_line(cbl):
                curr_exam_lines.append(cbl)
            else:
                break
        exam_tag = ' '.join(curr_exam_lines).strip()

    exam_tag = exam_tag.strip('() ')
    if exam_tag and not exam_tag.startswith('('):
        exam_tag = f"({exam_tag})"

    questions.append({
        'question_number': q_num,
        'question_text': q_text_clean,
        'option_a': opt_a,
        'option_b': opt_b,
        'option_c': opt_c,
        'option_d': opt_d,
        'exam_tag': exam_tag
    })

print(f"Successfully assembled {len(questions)} questions.")

# Check sample questions
for q in [1, 2, 26, 30, 59, 60, 62, 63, 100, 200, 300, 307]:
    item = questions[q-1]
    print(f"\n--- Q{item['question_number']} ---")
    print(f"Text: {item['question_text']}")
    print(f"Options: A) {item['option_a']} | B) {item['option_b']} | C) {item['option_c']} | D) {item['option_d']}")
    print(f"Exam: {item['exam_tag']}")

with open('type2_questions_raw.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
print("\nSaved type2_questions_raw.json")
