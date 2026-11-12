import json
import re

with open('scripts/pdf_samples/t4_structured_lines.json', 'r', encoding='utf-8') as f:
    raw_lines = json.load(f)

# Reconstruct cols
cols = []
cur_key = None
cur_list = []
for idx, item in enumerate(raw_lines):
    if idx >= 2599: break
    key = (item['file'], item['col'])
    if key != cur_key:
        if cur_list: cols.append((cur_key, cur_list))
        cur_key = key
        cur_list = []
    cur_list.append(item['text'])
if cur_list: cols.append((cur_key, cur_list))

with open('scripts/pdf_samples/t4_col_starts.json', 'r', encoding='utf-8') as f:
    col_starts_meta = json.load(f)

all_questions = []

def clean_opt_text(text):
    text = re.sub(r'^[^\w]+', '', text)
    text = re.sub(r'[\(\[].*$', '', text)
    return text.strip()

for c_meta in col_starts_meta:
    c_idx = c_meta['c_idx']
    lines = cols[c_idx][1]
    starts = {int(k): v for k, v in c_meta['starts'].items()}
    q_start = c_meta['q_start']
    q_end = c_meta['q_end']
    
    for qn in range(q_start, q_end + 1):
        if qn == 32:
            prompt = "MNOP : LONQ :: FGHI : ?"
            # Options in Col 3 lines 0-3
            c3_lines = cols[3][1]
            chunk = c3_lines[:6]
        else:
            st = starts.get(qn, 0)
            en = starts.get(qn + 1, len(lines))
            chunk = lines[st:en]
            # Prompt is lines before the first option
            prompt_lines = []
            for l in chunk:
                if re.match(r'^[\(\[]\s*[1-4Ili]\s*[\)\]]', l) or re.match(r'^[1-4]\s*[\)\]]', l):
                    break
                prompt_lines.append(l)
            prompt = " ".join(prompt_lines).strip()
            # Clean leading question number
            prompt = re.sub(r'^[^\w]*\d{1,3}\s*[\.\,\)\-\:]\s*', '', prompt)
            
        all_questions.append({
            'q_num': qn,
            'raw_prompt': prompt,
            'chunk_len': len(chunk),
            'first_line': chunk[0] if chunk else ""
        })

print(f"Total extracted: {len(all_questions)}")
empty_prompts = [q for q in all_questions if len(q['raw_prompt']) < 3]
print(f"Empty or too short prompts: {len(empty_prompts)} -> {[q['q_num'] for q in empty_prompts]}")
for q in empty_prompts:
    print(f"Q{q['q_num']}: first_line='{q['first_line']}'")
