import re

# Let's write the parsing function that turns column lines into structured question dicts:
def parse_question_stream(lines):
    # lines is a list of strings in reading order
    text = "\n".join(lines)
    
    # Strip telegram watermark
    text = re.sub(r'@apna_[a-z_]+', '', text)
    text = re.sub(r'Directions\s*:.*?(?=\d+\.|\Z)', '', text, flags=re.DOTALL)
    
    # Questions start with "\n<num>. " or "^<num>. "
    # Regex to split questions
    q_blocks = re.split(r'(?:^|\n)\s*(\d{1,3})\s*[\.\)]\s*', text)
    
    questions = []
    # q_blocks[0] is header/intro before Q1
    for i in range(1, len(q_blocks), 2):
        q_num = int(q_blocks[i])
        body = q_blocks[i+1].strip()
        
        # Parse body:
        # 1. Question text is before (1)
        # 2. Options are (1)... (2)... (3)... (4)...
        # 3. Exam tag is usually at the end in parentheses (SSC...)
        
        # Find option 1
        m_opt = re.search(r'(?:\n|^|\s)\((?:1|[aA]|l|i)\)', body)
        if m_opt:
            q_txt = body[:m_opt.start()].strip()
            rest = body[m_opt.start():].strip()
        else:
            q_txt = body
            rest = ""
            
        # Extract exam tag at end: e.g. (SSC ...) or [SSC ...]
        exam_tag = ""
        m_exam = re.search(r'\((?:SSC|Delhi Police|FCI|CAPF|CPO|CGL|CHSL|MTS|Stenographer)[^\)]+\)$', rest, flags=re.I)
        if not m_exam:
            m_exam = re.search(r'\[(?:SSC|Delhi Police|FCI|CAPF|CPO|CGL|CHSL|MTS|Stenographer)[^\]]+\]$', rest, flags=re.I)
        if m_exam:
            exam_tag = m_exam.group(0).strip('()[] ')
            rest = rest[:m_exam.start()].strip()
            
        # Parse options (1), (2), (3), (4)
        opt_matches = list(re.finditer(r'(?:\n|^|\s)\(([1-4])\)', rest))
        opts = {}
        for oi in range(len(opt_matches)):
            opt_num = int(opt_matches[oi].group(1))
            start_idx = opt_matches[oi].end()
            end_idx = opt_matches[oi+1].start() if oi + 1 < len(opt_matches) else len(rest)
            opts[opt_num] = rest[start_idx:end_idx].strip()
            
        questions.append({
            'question_number': q_num,
            'question_text': re.sub(r'\s+', ' ', q_txt).strip(),
            'option_a': opts.get(1, ''),
            'option_b': opts.get(2, ''),
            'option_c': opts.get(3, ''),
            'option_d': opts.get(4, ''),
            'exam_tag': exam_tag
        })
    return questions
