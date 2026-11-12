import fitz
import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

# --- STEP 1: PARSE ALL 155 ANSWERS & EXPLANATIONS ---

with open('all_explanations_clean_lines.txt', 'r', encoding='utf-8') as f:
    expl_text = f.read()

# Normalize known OCR artifacts in answers:
expl_text = expl_text.replace('(Cc)', '(c)').replace('(Q)', '(a)').replace('(α)', '(a)').replace('(C)', '(c)')
# Normalize leading stray characters before question numbers: e.g. "is 28. (a)" -> "\n28. (a)"
expl_text = re.sub(r'([a-zA-Z\s]{1,10})\b(\d{1,3})\s*[\.\)]\s*\(([a-eA-E])\)', r'\n\2. (\3)', expl_text)

# Find positions of all explanation headers: "\n<num>. (<letter>)"
expl_matches = list(re.finditer(r'(?:^|\n)\s*(\d{1,3})\s*[\.\)]\s*(?:\(([a-eA-E])\))?', expl_text))

# Build raw explanations
expl_positions = []
for m in expl_matches:
    q_num = int(m.group(1))
    if 1 <= q_num <= 155:
        letter = m.group(2).upper() if m.group(2) else None
        expl_positions.append((q_num, letter, m.start(), m.end()))

# Deduplicate keeping earliest/best
clean_expl_pos = []
seen_nums = set()
for q_num, letter, start, end in expl_positions:
    if q_num not in seen_nums:
        seen_nums.add(q_num)
        clean_expl_pos.append((q_num, letter, start, end))

clean_expl_pos.sort(key=lambda x: x[2])

# Build map of (answer, explanation_text)
explanations_map = {}
for i in range(len(clean_expl_pos)):
    q_num, letter, start, end = clean_expl_pos[i]
    next_start = clean_expl_pos[i+1][2] if i + 1 < len(clean_expl_pos) else len(expl_text)
    raw_block = expl_text[end:next_start].strip()
    
    # If letter was not captured in header, search in raw_block
    if not letter:
        m_let = re.search(r'^\s*\(?([a-eA-E])\)?', raw_block)
        if m_let:
            letter = m_let.group(1).upper()
            raw_block = raw_block[m_let.end():].strip()
        elif q_num == 81:
            letter = 'C'
        elif q_num in (123, 124):
            letter = 'C'
            
    # Clean explanation text
    # remove trailing page markers
    clean_block = re.sub(r'={5,}.*?={5,}', '', raw_block).strip()
    clean_block = re.sub(r'\s+', ' ', clean_block).strip()
    
    explanations_map[q_num] = {
        'answer': letter,
        'explanation': clean_block
    }

# Explicit overrides for verified special cases
if 81 in explanations_map and not explanations_map[81]['answer']:
    explanations_map[81]['answer'] = 'C'
if 123 in explanations_map and not explanations_map[123]['answer']:
    explanations_map[123]['answer'] = 'C'
if 124 in explanations_map and not explanations_map[124]['answer']:
    explanations_map[124]['answer'] = 'C'

print(f"Total explanations parsed: {len(explanations_map)} / 155")
missing_expl = [i for i in range(1, 156) if i not in explanations_map or not explanations_map[i]['answer']]
print(f"Missing explanations or answers: {missing_expl}")

# --- STEP 2: PARSE ALL 155 QUESTIONS & OPTIONS ---

with open('all_questions_clean_lines.txt', 'r', encoding='utf-8') as f:
    q_text = f.read()

# Preprocess to normalize question number boundaries
# If a line contains e.g. "2013] 80.", split before 80.
q_text = re.sub(r'(\]|\bBLOCK\b)\s*(\d{1,3})\.', r'\1\n\2.', q_text)
# If a line has e.g. "77.8:28::", insert space "77. 8:28::"
q_text = re.sub(r'(\d{1,3})\.([^\s\d])', r'\1. \2', q_text)
q_text = re.sub(r'(\d{1,3})\.([0-9])', r'\1. \2', q_text)

# Find all question headers: ^\s*(\d{1,3})\.\s+
q_headers = list(re.finditer(r'(?:^|\n)\s*(\d{1,3})\.\s+', q_text))
q_positions = []
seen_q = set()
for m in q_headers:
    q_num = int(m.group(1))
    if 1 <= q_num <= 155 and q_num not in seen_q:
        seen_q.add(q_num)
        q_positions.append((q_num, m.start(), m.end()))

q_positions.sort(key=lambda x: x[1])
print(f"Total question headers parsed: {len(q_positions)} / 155")
missing_q = [i for i in range(1, 156) if i not in seen_q]
print(f"Missing questions: {missing_q}")

# Now segment each question
parsed_questions = []

for i in range(len(q_positions)):
    q_num, start, end = q_positions[i]
    next_start = q_positions[i+1][1] if i + 1 < len(q_positions) else len(q_text)
    block = q_text[end:next_start].strip()
    
    # Strip any page marker lines like "========================= PAGE 4 LEFT ========================="
    block_lines = [l for l in block.split('\n') if not l.startswith('====')]
    block = "\n".join(block_lines).strip()
    
    # Also strip any trailing Directions for subsequent questions if caught
    # e.g. "Directions (Q. Nos..."
    dir_idx = block.find("Directions (Q. Nos.")
    if dir_idx != -1:
        block = block[:dir_idx].strip()
        
    # Options extractor: options start with (a), (b), (c), (d), (e)
    # Search for (a)
    opt_a_match = re.search(r'(?:\n|^|\s)\((?:a|A)\)', block)
    
    if opt_a_match:
        q_body = block[:opt_a_match.start()].strip()
        opts_part = block[opt_a_match.start():].strip()
        
        # Parse options from opts_part
        # Find positions of (a), (b), (c), (d), (e)
        opt_matches = list(re.finditer(r'\(([a-eA-E])\)', opts_part))
        opts = {}
        for oi in range(len(opt_matches)):
            opt_letter = opt_matches[oi].group(1).lower()
            opt_start = opt_matches[oi].end()
            opt_end = opt_matches[oi+1].start() if oi + 1 < len(opt_matches) else len(opts_part)
            val = opts_part[opt_start:opt_end].strip()
            # Clean trailing exam tags like [SSC (CGL) 2013]
            val = re.sub(r'\[.*?\]', '', val).strip()
            opts[opt_letter] = val
            
        op_a = opts.get('a', '')
        op_b = opts.get('b', '')
        op_c = opts.get('c', '')
        op_d = opts.get('d', '')
    else:
        q_body = block
        op_a, op_b, op_c, op_d = '', '', '', ''
        
    # Clean question text: strip exam tags [SSC (CPO)...]
    q_clean = re.sub(r'\[.*?\]', '', q_body).strip()
    # Normalize internal newlines
    q_clean = re.sub(r'\s+', ' ', q_clean).strip()
    
    # Get answer & explanation
    ans_data = explanations_map.get(q_num, {'answer': 'A', 'explanation': ''})
    
    parsed_questions.append({
        'question_number': q_num,
        'topic_id': 242,  # Analogy
        'question_text': q_clean,
        'option_a': op_a,
        'option_b': op_b,
        'option_c': op_c,
        'option_d': op_d,
        'correct_answer': ans_data['answer'] or 'A',
        'explanation': ans_data['explanation'] or '',
        'exam_tag': None,  # User explicitly requested NO exam tag
        'difficulty': 'medium',
        'is_active': True,
        'tier_level': None
    })

# Sort by question number 1..155
parsed_questions.sort(key=lambda x: x['question_number'])

print(f"\nFinal Parsed Questions Count: {len(parsed_questions)}")

# Inspect first 5
print("\n=== SAMPLE QUESTIONS ===")
for q in parsed_questions[:3]:
    print(json.dumps(q, indent=2))
    print("-" * 40)

# Save to JSON
with open('reasoning_analogy_155_questions.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_questions, f, ensure_ascii=False, indent=2)

print("\nSuccessfully saved reasoning_analogy_155_questions.json!")
