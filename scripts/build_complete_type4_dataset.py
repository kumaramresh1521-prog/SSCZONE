import json
import re

print("=== BUILDING COMPLETE TYPE-IV VERIFIED DATASET (1 to 254) ===")

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

with open('scripts/pdf_samples/t4_final_answers_1_to_254.json', 'r', encoding='utf-8') as f:
    answers_table = json.load(f)
answers_table = {int(k): v for k, v in answers_table.items()}

with open('type4_explanations_parsed.json', 'r', encoding='utf-8') as f:
    book_explanations = json.load(f)

digit_to_opt = {1: 'A', 2: 'B', 3: 'C', 4: 'D'}

def clean_text(t):
    return re.sub(r'\s+', ' ', t).strip()

def is_exam_line(text):
    t_up = text.upper()
    return any(k in t_up for k in ['EXAM', 'EXCM', 'EAM', 'EON', 'EXAN', 'SHIFT', 'SHIT', 'SHUT', 'SHAT', 'SHAF', 'SHT', 'SHN', 'TIER', 'TER', 'CBE', 'CDE', 'C&D', 'TF NO', 'ST SURUNE', 'CAPFS', 'CHSL', 'CGL', 'MTS', 'GD)'])

def is_option_line(text):
    return bool(re.match(r'^[\(\[]\s*[1-4Ili]\s*[\)\]]', text))

# We will collect questions 1 to 254
compiled_questions = []

for c_meta in col_starts_meta:
    c_idx = c_meta['c_idx']
    lines = cols[c_idx][1]
    starts = {int(k): v for k, v in c_meta['starts'].items()}
    q_start = c_meta['q_start']
    q_end = c_meta['q_end']
    
    for qn in range(q_start, q_end + 1):
        if qn == 32:
            prompt_str = "Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster:\nMNOP : LONQ :: FGHI : ?"
            opts = ["GFIJ", "EGHJ", "DHGK", "EHGJ"]
            exam_str = "SSC CGL Tier-I (CBE) Exam. 04.06.2019 (Shift-I)"
        elif qn == 69:
            prompt_str = "Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster:\nAOE : FUJ :: RKT : ?"
            opts = ["WQY", "WOY", "VOY", "VGX"]
            exam_str = "SSC CAPFs SI, Delhi Police SI & CISF ASI Exam, 09.12.2019 (Shift-I)"
        elif qn == 167:
            prompt_str = "Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster:\nGTQ : JVP :: SDK : ?"
            opts = ["VFJ", "UGP", "UEK", "VGK"]
            exam_str = "SSC CGL Tier-I (CBE) Exam, 21.04.2022 (Shift-III)"
        else:
            st = starts.get(qn, 0)
            en = starts.get(qn + 1, len(lines))
            chunk = lines[st:en]
            
            # Extract prompt lines (before first option line)
            prompt_parts = []
            opt_lines = []
            exam_parts = []
            in_opts = False
            
            for l in chunk:
                if not in_opts:
                    if is_option_line(l) or re.match(r'^[1-4]\s*[\)\]]', l):
                        in_opts = True
                        opt_lines.append(l)
                    else:
                        prompt_parts.append(l)
                else:
                    if is_exam_line(l) or re.search(r'\d{2}\.\d{2}\.\d{4}', l):
                        exam_parts.append(l)
                    else:
                        opt_lines.append(l)
                        
            # Format prompt
            raw_prompt = " ".join(prompt_parts).strip()
            raw_prompt = re.sub(r'^[^\w]*\d{1,3}\s*[\.\,\)\-\:]\s*', '', raw_prompt).strip()
            # If prompt has no instruction prefix, add standard prefix
            if "::" in raw_prompt:
                if "? : ?" in raw_prompt or "?:?" in raw_prompt:
                    prompt_str = f"Select the related pair of letter-clusters from the given alternatives:\n{raw_prompt}"
                elif not any(k in raw_prompt.lower() for k in ['select', 'related', 'replace']):
                    prompt_str = f"Select the option that is related to the third letter-cluster in the same way as the second letter-cluster is related to the first letter-cluster:\n{raw_prompt}"
                else:
                    prompt_str = raw_prompt
            elif "#" in raw_prompt and "%" in raw_prompt:
                prompt_str = raw_prompt
            else:
                prompt_str = f"Select the related letter-cluster from the given alternatives:\n{raw_prompt}"
                
            # Parse options
            opts_dict = {}
            for l in opt_lines:
                matches = re.finditer(r'(?:[\(\[]\s*([1-4Ili])\s*[\)\]\s]|(?:^|\s)([1-4])\s*[\)\]\.\s])\s*([A-Za-z0-9\s\:\;\,\#\%\-\_\?\~]+)', l)
                for m in matches:
                    digit = m.group(1) or m.group(2)
                    digit = digit.replace('I', '1').replace('l', '1').replace('i', '1')
                    text = m.group(3).strip()
                    text = re.sub(r'[\(\[].*$', '', text).strip()
                    if digit.isdigit() and text:
                        d_int = int(digit)
                        if 1 <= d_int <= 4 and d_int not in opts_dict:
                            opts_dict[d_int] = text
                            
            # Convert opts_dict to list [A, B, C, D]
            opts = [opts_dict.get(1, ""), opts_dict.get(2, ""), opts_dict.get(3, ""), opts_dict.get(4, "")]
            
            # Format exam tag
            if exam_parts:
                exam_str = clean_text(" ".join(exam_parts))
                exam_str = re.sub(r'^[^\w\(]+', '', exam_str)
                exam_str = re.sub(r'[\(\)]', '', exam_str).strip()
                exam_str = f"SSC {exam_str}" if not exam_str.startswith("SSC") else exam_str
            else:
                exam_str = "SSC PYQ Exam"

        ans_digit = answers_table.get(qn, 1)
        correct_opt = digit_to_opt[ans_digit]
        
        compiled_questions.append({
            'q_num': qn,
            'question_text': prompt_str,
            'options': opts,
            'correct_option': correct_opt,
            'exam_tag': exam_str,
            'explanation': "" # We will populate in next step
        })

print(f"Compiled {len(compiled_questions)} questions!")
with open('scripts/pdf_samples/t4_compiled_draft.json', 'w', encoding='utf-8') as f:
    json.dump(compiled_questions, f, ensure_ascii=False, indent=2)
print("Saved t4_compiled_draft.json")
