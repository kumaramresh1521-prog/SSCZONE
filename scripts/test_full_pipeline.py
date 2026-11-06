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

def format_clean_text(text: str, is_math: bool = False) -> str:
    if not text:
        return ""
    
    # Step 1: Remove DIAGRAM_OR_GEOMETRIC placeholder
    text = re.sub(r'\s*DIAGRAM_OR_GEOMETRIC\s*', ' ', text)
    
    # Step 2: Remove stray trailing/leading section headers
    text = re.sub(r'\b(GENERAL AWARENESS|GENERAL INTELLIGENCE|QUANTITATIVE APTITUDE|ENGLISH LANGUAGE|GENERAL)\b', '', text)
    
    # Step 3: Remove option grids in question text like (A) (B) \n (C) (D)
    text = re.sub(r'\(A\)\s*(?:\(B\)\s*\d*|\d*)\s*(?:\n*\s*\(C\)\s*\d*\s*(?:\(D\))?\s*\d*)?', '', text)
    text = re.sub(r'\(A\)\s*(?:\n*\s*\(B\))?\s*(?:\n*\s*\(C\))?\s*(?:\n*\s*\(D\))?', '', text)
    
    # Step 4: Remove stray isolated page numbers
    text = re.sub(r'^\s*\d+\s*\n+', '', text)
    text = re.sub(r'\n+\s*\d+\s*$', '', text)
    text = re.sub(r'\n+\s*\d+\s*\n+', '\n\n', text)
    text = re.sub(r'\s+\d+\s*$', '', text)
    
    # Step 5: Normalize Mathematical Alphanumeric block (U+1D400 to U+1D7FF)
    text = normalize_math_chars(text)
    
    # Step 6: Non-standard Greek theta or ring degree
    text = text.replace("𝞱", "θ").replace("𝜽", "θ").replace("𝛉", "θ")
    text = text.replace("∘", "°")
    
    # Step 7: Degree spacing (e.g. "30 °" -> "30°")
    text = re.sub(r'(\d+)\s+°', r'\1°', text)
    
    # Step 8: Units with powers: cm2 -> cm², cm3 -> cm³, etc.
    text = re.sub(r'\b(cm|m|km|mm)2\b', r'\1²', text)
    text = re.sub(r'\b(cm|m|km|mm)3\b', r'\1³', text)
    
    # Step 9: Math-specific formatting (trigonometry, algebra, parenthesized powers)
    # Coefficient spacing before trig: e.g. 3cosec -> 3 cosec, 2tan -> 2 tan
    text = re.sub(r'(\d+)(sin|cos|tan|sec|cosec|cot|csc)\b', r'\1 \2', text)
    
    # Trig powers attached to angle: cosec260 -> cosec² 60, cos230 -> cos² 30, csc260 -> csc² 60
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot|csc)2(\d+)', r'\1² \2', text)
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot|csc)3(\d+)', r'\1³ \2', text)
    
    # Trig powers with spaces or followed by angle/symbol: sin2 -> sin², cos2 -> cos²
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot|csc)2\s*', r'\1² ', text)
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot|csc)3\s*', r'\1³ ', text)
    
    # Parenthesized powers: )2 -> )², )3 -> )³
    text = re.sub(r'\)2\b', r')²', text)
    text = re.sub(r'\)3\b', r')³', text)
    
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
    
    # Clean whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    return text.strip()

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))

total_qt_changed = 0
total_opt_changed = 0

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        data = json.load(f)
    for q in data:
        qn = q["question_number"]
        is_math = (51 <= qn <= 75)
        
        qt = q.get("question_text", "")
        c_qt = format_clean_text(qt, is_math=is_math)
        if c_qt != qt:
            total_qt_changed += 1
            
        for k in ["option_a", "option_b", "option_c", "option_d"]:
            opt = q.get(k, "")
            c_opt = format_clean_text(opt, is_math=is_math)
            if c_opt != opt:
                total_opt_changed += 1

print(f"Total question_text modified: {total_qt_changed}")
print(f"Total options modified: {total_opt_changed}")
