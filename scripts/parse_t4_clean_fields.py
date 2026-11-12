import json
import os
import re

with open('scripts/pdf_samples/t4_clean_stream.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
stream = data['stream']

with open('scripts/pdf_samples/t4_answers_visual_verified.json', 'r', encoding='utf-8') as f:
    ans_map = {int(k): v for k, v in json.load(f).items()}

def is_opt_line(text):
    t = text.strip()
    if re.search(r'(?:^|\s)[\(\[]\s*[1-4]\s*[\)\]]', t):
        return True
    if re.match(r'^[\(\[]\s*[Iil\|\!]\s*[\)\]]\s*\S', t):
        return True
    if re.match(r'^\(\s*\)\s*[A-Za-z0-9]{2,}', t):
        return True
    if re.match(r'^\(?[1-4]\)\s*\S', t):
        return True
    return False

def is_exam_start_or_cont(text):
    t = text.strip()
    if is_opt_line(t):
        return False
    tu = t.upper()
    # Never classify prompt prose as exam line
    if any(w in tu for w in [
        'SELECT', 'RELATED', 'OPTION', 'CLUSTER', 'CLUS-', 'ALPHABET', 'FOLLOWING',
        'CERTAIN', 'LOGIC', 'MEANINGFUL', 'VOWEL', 'CONSONANT', 'CONSIDERED',
        'DIFFERENT', 'ALIKE', 'MANNER', 'PAIR', 'WHICH ONE', 'SAME WAY',
        'REPLACE', 'SERIES', 'MARK'
    ]):
        return False
    # Exact exam patterns
    if re.search(r'(?:^|[\s\(\[\|I])SSC(?:$|[\s\)\]])|SSCC', tu):
        return True
    if re.search(r'\b(EXAM|EXCM|EXAN|EXAT|EXAR|EXM|CHSL|CGL|MTS|CAPF|STENO|CONSTABLE|RIFLEMAN|SITTING|POLLICE|POLICE)\b', tu):
        return True
    if re.search(r'(?:TIER|TTER|THER|TLER|TIOR)\s*[-–—]?\s*(?:I{1,3}|1|2|l|m|n)\b|\(CBE\)|CBE\)|TF\s*NO|DELHI\s*POL|MULTI-?TASK|MULTU-?TASK|MULU-?TASK|MULT-?TASK|MIS\s*EXAM', tu):
        return True
    if re.search(r'\d{2}\.\d{2}\.\d{2,4}', t):
        return True
    if re.search(r'(?:SHIFT|SHIFF|SHIF|SHIT|SHNT|SHTT|SHFT|SHTFT)\b|(?:SHIF|SHIT|SHA|SHM)[-\)\s]', tu):
        return True
    if re.search(r'GRADE\s*[\'"]?C', tu) or re.match(r'^[\'"]?C[\'"]?\s*&\s*D', tu):
        return True
    if re.match(r'^(\(?TF\s*N|TFN|\(1ST\s*S|\(2ND\s*S|\(LST\s*S|IST\s*SITTING|EXAM\.|20\d{2}\s*S)', tu):
        return True
    return False

def normalize_leading_qnum(txt, expected_q):
    s = txt.strip()
    if is_opt_line(s) or is_exam_start_or_cont(s):
        return None
    s_clean = s.lstrip(".*+•-_'\" ")
    # Strict numeric before dot/comma/space
    m = re.match(r'^(\d{1,3})\s*[\.\,]\s*(.*)', s_clean)
    if m and int(m.group(1)) == expected_q:
        return expected_q, m.group(2)
    # Missing dot after number (must not be followed by ':')
    m2 = re.match(r'^(\d{1,3})\s+([A-Za-z\'"].*)', s_clean)
    if m2 and int(m2.group(1)) == expected_q:
        return expected_q, m2.group(2)
    # Glued digits + uppercase cluster like "13RTU"
    m3 = re.match(r'^(\d{1,3})([A-Z]{2,}.*)', s_clean)
    if m3 and int(m3.group(1)) == expected_q:
        return expected_q, m3.group(2)
    # Normalize OCR confusions on leading digits before '.' or ','
    m_sep = re.match(r'^([0-9IlLiBoOSsgGq]{1,4})\s*[\.\,]\s*(.*)', s_clean)
    if m_sep:
        tok, rest = m_sep.group(1), m_sep.group(2)
        trans = (tok.replace('I', '1').replace('i', '1').replace('l', '1').replace('L', '1')
                    .replace('o', '0').replace('O', '0').replace('B', '8').replace('S', '5')
                    .replace('s', '5').replace('g', '9').replace('q', '9').replace('G', '6'))
        if trans.isdigit() and int(trans) == expected_q:
            return expected_q, rest
        # Single-digit visual confusion (e.g. 160->180, 163->183, 169->189, 186->188, 195->196, 203->209, 236->296)
        exp_s = str(expected_q)
        if trans.isdigit() and len(trans) == len(exp_s):
            diffs = sum(1 for a, b in zip(trans, exp_s) if a != b)
            pairs_ok = all(
                (a == b or {a, b} in ({'6', '8'}, {'3', '9'}, {'8', '9'}, {'5', '6'}, {'2', '3'}, {'4', '7'}, {'1', '7'}))
                for a, b in zip(trans, exp_s)
            )
            if diffs == 1 and pairs_ok:
                return expected_q, rest
        # Truncated leading digit like 8. for 48 or 37. for 137
        if len(exp_s) >= 2 and trans == exp_s[1:] and (len(rest) > 5 or ':' in rest):
            return expected_q, rest
    return None

# Start at Q1
i = 0
while i < len(stream) and ('DIRECTION' in stream[i]['line'].upper() or not normalize_leading_qnum(stream[i]['line'], 1)):
    i += 1

questions_raw = []
cur_idx = i
for qn in range(1, 255):
    if cur_idx >= len(stream):
        print(f"STOPPED EARLY at Q{qn}!")
        break
    start_idx = cur_idx
    end_idx = None
    seen_opt = False
    exam_seen = False
    j = start_idx + 1
    while j < len(stream):
        ln = stream[j]['line']
        if qn < 254 and normalize_leading_qnum(ln, qn + 1) is not None and (seen_opt or exam_seen):
            end_idx = j
            break
        if is_opt_line(ln):
            seen_opt = True
        if is_exam_start_or_cont(ln) and seen_opt:
            exam_seen = True
        elif exam_seen:
            # First non-exam line after exam lines is next question!
            end_idx = j
            break
        j += 1
    if end_idx is None:
        end_idx = len(stream)
    block = stream[start_idx:end_idx]
    questions_raw.append({
        'q_num': qn,
        'start_idx': start_idx,
        'end_idx': end_idx,
        'explicit_q': normalize_leading_qnum(stream[start_idx]['line'], qn) is not None,
        'lines': block
    })
    cur_idx = end_idx

print(f"Segmented {len(questions_raw)} questions! Final stream idx={cur_idx}/{len(stream)}")
if cur_idx < len(stream):
    print("Remaining lines after Q254:")
    for it in stream[cur_idx:]:
        print(f"  [{it['idx']}] ({it['col_name']}) {it['line']}")

non_exp = [q['q_num'] for q in questions_raw if not q['explicit_q']]
print(f"\nNon-explicit starts ({len(non_exp)}): {non_exp}")
for qn in non_exp:
    q = questions_raw[qn - 1]
    print(f"  [Non-exp Q{qn}] lines[0..2] = {[l['line'] for l in q['lines'][:3]]}")

# Check vertical gaps & exam presence
print("\n=== Gaps (dy > 14.8) & exam-line audit ===")
gap_qs = []
for q in questions_raw:
    lns = q['lines']
    has_exam = any(is_exam_start_or_cont(l['line']) for l in lns)
    if not has_exam:
        print(f"  NO EXAM LINE in Q{q['q_num']}: {[l['line'] for l in lns]}")
    for k in range(len(lns) - 1):
        if lns[k]['col'] == lns[k+1]['col']:
            dy = lns[k+1]['y'] - lns[k]['y']
            if dy > 14.8:
                gap_qs.append(q['q_num'])
                print(f"  GAP dy={dy:.1f} Q{q['q_num']} ({lns[k]['col_name']} y={lns[k]['y']}->{lns[k+1]['y']}): '{lns[k]['line']}' -> '{lns[k+1]['line']}'")

# Parse prompt, options, exam_tag for each Q1..254
def parse_options_from_lines(opt_lines):
    # Join parts or texts in order, then split on (1), (2), (3), (4) (with OCR variants like (I), [1], etc.)
    full = " ".join(l['line'] for l in opt_lines)
    # Normalize common OCR option marker quirks BEFORE splitting:
    # (I) -> (1) when at start or after whitespace and followed by space/letter and (2) exists
    full_norm = re.sub(r'(?:^|\s)\(\s*[Il\|!]\s*\)', ' (1)', full)
    full_norm = re.sub(r'(?:^|\s)\[\s*([1-4])\s*[\)\]]', r' (\1)', full_norm)
    full_norm = re.sub(r'(?:^|\s)\(\s*([1-4])\s*[\]\)]', r' (\1)', full_norm)
    # Sometimes closing paren is OCR'd or missing like "(1 ROPS" or "1) ROPS" -> keep careful
    opts = ['', '', '', '']
    # Find markers (1) .. (4) in ascending order
    matches = list(re.finditer(r'\(([1-4])\)', full_norm))
    if len(matches) >= 4:
        # Pick 1, 2, 3, 4 in sequence
        chosen = []
        target = 1
        for m in matches:
            if int(m.group(1)) == target:
                chosen.append(m)
                target += 1
                if target > 4:
                    break
        if len(chosen) == 4:
            for k in range(4):
                s_idx = chosen[k].end()
                e_idx = chosen[k + 1].start() if k < 3 else len(full_norm)
                opts[k] = full_norm[s_idx:e_idx].strip()
            return opts, full
    # Fallback: use matches we found
    for k, m in enumerate(matches):
        idx = int(m.group(1)) - 1
        s_idx = m.end()
        e_idx = matches[k + 1].start() if k + 1 < len(matches) else len(full_norm)
        if not opts[idx]:
            opts[idx] = full_norm[s_idx:e_idx].strip()
    return opts, full

parsed = []
bad_opts = []
bad_prompts = []
suspicious_chars = []

for q in questions_raw:
    qn = q['q_num']
    lns = q['lines']
    # Find first option line & first exam line
    opt_start = next((idx for idx, l in enumerate(lns) if is_opt_line(l['line'])), None)
    exam_start = next((idx for idx, l in enumerate(lns) if is_exam_start_or_cont(l['line'])), None)
    if opt_start is None:
        prompt_lns = lns[:exam_start] if exam_start else lns
        opt_lns = []
    else:
        prompt_lns = lns[:opt_start]
        opt_lns = lns[opt_start:exam_start] if exam_start else lns[opt_start:]
    exam_lns = lns[exam_start:] if exam_start is not None else []

    # Clean prompt text: strip leading question number from line 0
    if prompt_lns:
        first_txt = prompt_lns[0]['line'].strip()
        m_strip = re.match(r'^[^\w\(]*[0-9IlLiBoOSsgGq]{1,4}\s*[\.\,]?\s*(.*)', first_txt)
        m_glued = re.match(r'^(\d{1,3})([A-Z]{2,}.*)', first_txt)
        if m_strip and (re.match(r'^[^\w\(]*[0-9IlLiBoOSsgGq]{1,4}\s*[\.\,]', first_txt) or re.match(r'^\d{1,3}\s+[A-Za-z]', first_txt)):
            p0 = m_strip.group(1)
        elif m_glued and int(m_glued.group(1)) == qn:
            p0 = m_glued.group(2)
        else:
            p0 = first_txt
        p_parts = [p0] + [l['line'].strip() for l in prompt_lns[1:]]
        # Rejoin hyphenated line wraps cleanly
        q_text = ''
        for part in p_parts:
            if not part:
                continue
            if q_text.endswith('-') and part[0:1].isalpha():
                if q_text.lower().endswith('letter-') and part.lower().startswith('cluster'):
                    q_text = q_text + part
                else:
                    q_text = q_text[:-1] + part
            else:
                q_text = (q_text + ' ' + part) if q_text else part
    else:
        q_text = ''

    opts, raw_opt_str = parse_options_from_lines(opt_lns)
    # Strip trailing punctuation/noise on options
    opts_clean = [re.sub(r'^[\s\.\-\:]+|[\s\.]+$', '', o).replace(' ,', ',').strip() for o in opts]

    exam_tag = " ".join(l['line'].strip() for l in exam_lns)
    ans_num = ans_map[qn]
    ans_letter = 'ABCD'[ans_num - 1]

    item = {
        'q_num': qn,
        'col_start': lns[0]['col_name'],
        'question_text': q_text,
        'options': opts_clean,
        'correct_option': ans_letter,
        'exam_tag': exam_tag,
        'raw_lines': [l['line'] for l in lns],
        'raw_opt_str': raw_opt_str
    }
    parsed.append(item)

    if any(not o for o in opts_clean) or len(set(opts_clean)) < 4:
        bad_opts.append((qn, opts_clean, raw_opt_str))
    if not q_text or len(q_text) < 12 or ('?' not in q_text and qn not in (73,)):
        bad_prompts.append((qn, q_text))
    # Check suspicious characters inside option clusters (lowercase or digits inside letter clusters, except known alphanumeric Q193/Q195)
    for oi, o in enumerate(opts_clean):
        if any(c.isdigit() or c in 'glqoc' or (c.islower() and c not in 's') for c in re.sub(r'[^A-Za-z0-9]', '', o)):
            if re.search(r'[A-Z].*[0-9]|[0-9].*[A-Z]|[a-z]', o):
                suspicious_chars.append((qn, f"Opt{oi+1}", o))

print(f"\n=== AUDIT SUMMARY (1..254) ===")
print(f"Bad / empty / dup options ({len(bad_opts)}):")
for qn, oc, raw in bad_opts:
    print(f"  Q{qn}: {oc}  | raw={raw!r}")

print(f"\nBad / missing '?' prompts ({len(bad_prompts)}):")
for qn, qt in bad_prompts:
    print(f"  Q{qn}: {qt!r}")

print(f"\nSuspicious chars in options ({len(suspicious_chars)}):")
for qn, tag, val in suspicious_chars:
    print(f"  Q{qn} {tag}: {val!r}")

with open('scripts/pdf_samples/t4_segmented_254.json', 'w', encoding='utf-8') as f:
    json.dump(questions_raw, f, indent=2, ensure_ascii=False)

with open('scripts/pdf_samples/t4_parsed_254.json', 'w', encoding='utf-8') as f:
    json.dump(parsed, f, indent=2, ensure_ascii=False)
