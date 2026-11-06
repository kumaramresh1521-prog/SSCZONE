import glob
import json
import os
import re
import sys
import unicodedata

sys.stdout.reconfigure(encoding='utf-8')

def normalize_math_chars(text: str) -> str:
    res = []
    for ch in text:
        cp = ord(ch)
        if 0x1D400 <= cp <= 0x1D7FF:
            res.append(unicodedata.normalize('NFKC', ch))
        else:
            res.append(ch)
    return ''.join(res)

def clean_footers_and_headers(text: str) -> str:
    if not text:
        return ""
    # 1. Remove footers like '6 (BASIC ARITHMETIC SKILL)' or '8 (BASIC KNOWLEDGE)'
    text = re.sub(r'\s*\d+\s*\((?:BASIC ARITHMETIC SKILL|BASIC KNOWLEDGE)\)\s*', ' ', text)
    # 2. Remove stray section header QUANTITATIVE APTITUDE / GENERAL AWARENESS / etc.
    text = re.sub(r'\s*\b(QUANTITATIVE APTITUDE|GENERAL AWARENESS|GENERAL INTELLIGENCE|ENGLISH LANGUAGE)\b\s*', ' ', text)
    # 3. Remove stray (E) Not Answered
    text = re.sub(r'\s*\(E\)\s*Not Answered\s*', ' ', text)
    # 4. Special Q.86 page 10 number in 30 Sept Shift 3
    text = re.sub(r'parties\s+10\s*\n+\s*\(Q\)', 'parties\n\n(Q)', text)
    return text

def format_math_typography(text: str, is_math: bool = False) -> str:
    if not text:
        return ""
        
    # 1. Normalize Mathematical Alphanumeric block (U+1D400 to U+1D7FF)
    text = normalize_math_chars(text)
    
    # 2. Non-standard Greek theta & ring operator degree
    text = text.replace("𝞱", "θ").replace("𝜽", "θ").replace("𝛉", "θ")
    text = text.replace("∘", "°")
    
    # 3. Degree spacing: "30 °" -> "30°"
    text = re.sub(r'(\d+)\s+°', r'\1°', text)
    
    # 4. Units with powers: cm2 -> cm², cm3 -> cm³, m2 -> m², m3 -> m³, km2 -> km²
    text = re.sub(r'\b(cm|m|km|mm)2\b', r'\1²', text)
    text = re.sub(r'\b(cm|m|km|mm)3\b', r'\1³', text)
    
    # 5. Trigonometry formatting
    # Space between coefficient and trig name: e.g. 3cosec -> 3 cosec, 2tan -> 2 tan
    text = re.sub(r'(\d+)(sin|cos|tan|sec|cosec|cot|csc)\b', r'\1 \2', text)
    
    # Trig square/cube attached to angle: cosec260 -> cosec² 60, cos230 -> cos² 30, csc260 -> csc² 60
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot|csc)2(\d+)', r'\1² \2', text)
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot|csc)3(\d+)', r'\1³ \2', text)
    
    # Trig square/cube with spaces or followed by angle/theta: sin2 -> sin², cos2 -> cos²
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot|csc)2\s*', r'\1² ', text)
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot|csc)3\s*', r'\1³ ', text)
    
    # 6. Bracketed powers: )2 -> )², ]2 -> ]², }2 -> }²
    text = re.sub(r'([)\]}])2\b', r'\1²', text)
    text = re.sub(r'([)\]}])3\b', r'\1³', text)
    
    # 7. Math section specific algebra powers
    if is_math:
        # Algebraic powers with coefficients: 64x2 -> 64x², 81y2 -> 81y²
        text = re.sub(r'(\d+)([a-dxyzrp])2\b', r'\1\2²', text)
        text = re.sub(r'(\d+)([a-dxyzrp])3\b', r'\1\2³', text)
        
        # Standalone algebraic variables: a2 + b2, x2 - y2, p2 - 1, r2
        text = re.sub(r'\b([a-dxyzrp])2\b', r'\1²', text)
        text = re.sub(r'\b([a-dxyzrp])3\b', r'\1³', text)
        
        # In compact expressions like a2+b2 or x2/y2
        text = re.sub(r'([a-dxyzrp])2(?=[+\-=*/])', r'\1²', text)
        text = re.sub(r'([a-dxyzrp])3(?=[+\-=*/])', r'\1³', text)
        text = re.sub(r'(?<=[+\-=*/])([a-dxyzrp])2\b', r'\1²', text)
        text = re.sub(r'(?<=[+\-=*/])([a-dxyzrp])3\b', r'\1³', text)
        
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def clean_question_text(text: str, qn: int, fname: str) -> str:
    if not text:
        return ""
        
    # Special fix for 9 Oct Shift 3 Q21
    if "9-october-2026-shift-3" in fname and qn == 21:
        return "How many triangles are there in the given figure?"
        
    # Special fix for 5 Oct Shift 3 Q73
    if "5-october-2026-shift-3" in fname and qn == 73:
        return "A projectile launch angle satisfies sine twice the angle is 0.8 and cosine twice the angle is 0.6. Calculate sum of fourth powers of sine and cosine of the launch angle to predict range stability."

    # Remove footers and headers
    text = clean_footers_and_headers(text)
    
    # Remove DIAGRAM_OR_GEOMETRIC placeholder
    text = re.sub(r'\s*DIAGRAM_OR_GEOMETRIC\s*', ' ', text)
    
    # Remove option grids in question text:
    # Handles:
    # 2\n(A) (B)\n(C) (D)
    # (A) (B) \n (C) (D)
    # (A) (B) \n (C) (D) 2
    text = re.sub(r'^\s*[1-5]\s*\n+', '', text)
    text = re.sub(r'\(A\)\s*(?:\(B\)\s*\d*|\d*)\s*(?:\n*\s*\(C\)\s*\d*\s*(?:\(D\))?\s*\d*)?(?:\s+[1-5]\b)?', '', text)
    text = re.sub(r'\(A\)\s*(?:\n*\s*\(B\))?\s*(?:\n*\s*\(C\))?\s*(?:\n*\s*\(D\))?', '', text)
    
    # Format math typography
    is_math = (51 <= qn <= 75)
    text = format_math_typography(text, is_math=is_math)
    
    # Clean redundant whitespace and empty lines
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    return text.strip()

def clean_option_text(text: str, qn: int, opt_letter: str, fname: str) -> str:
    if not text:
        return ""
        
    # Special fix for 9 Oct Shift 3 Q21
    if "9-october-2026-shift-3" in fname and qn == 21:
        opts_map = {"a": "32", "b": "34", "c": "36", "d": "42"}
        return opts_map.get(opt_letter.lower(), text)
        
    # Special fix for 5 Oct Shift 3 Q73
    if "5-october-2026-shift-3" in fname and qn == 73:
        if opt_letter.lower() == "a":
            return "1"
        elif opt_letter.lower() == "b":
            return "0.6"
        elif opt_letter.lower() == "c":
            return "0.68"
        elif opt_letter.lower() == "d":
            return "0.72"
            
    # Clean footers
    text = clean_footers_and_headers(text)
    
    # Remove DIAGRAM_OR_GEOMETRIC placeholder if any in options
    text = re.sub(r'\s*DIAGRAM_OR_GEOMETRIC\s*', ' ', text)
    
    # Format math typography
    is_math = (51 <= qn <= 75)
    text = format_math_typography(text, is_math=is_math)
    
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))

total_questions = 0
modified_questions = 0

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        data = json.load(f)
    for q in data:
        total_questions += 1
        qn = q["question_number"]
        qt = q.get("question_text", "")
        c_qt = clean_question_text(qt, qn, fname)
        
        c_opts = {}
        opts_changed = False
        for opt_key in ["a", "b", "c", "d"]:
            val = q.get(f"option_{opt_key}", "")
            c_val = clean_option_text(val, qn, opt_key, fname)
            c_opts[opt_key] = c_val
            if c_val != val:
                opts_changed = True
                
        if c_qt != qt or opts_changed:
            modified_questions += 1

print(f"Total Questions: {total_questions}")
print(f"Total Modified Questions: {modified_questions}")
