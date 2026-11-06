import glob
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def format_math_text(text: str) -> str:
    if not text:
        return ""
    
    orig = text
    
    # 1. Non-standard Greek theta
    text = text.replace("𝞱", "θ").replace("𝜽", "θ").replace("𝛉", "θ")
    
    # 2. Ring operator degree -> standard degree
    text = text.replace("∘", "°")
    
    # 3. Units with powers: cm2, cm3, m2, m3, km2, mm2, mm3
    text = re.sub(r'\b(cm|m|km|mm)2\b', r'\1²', text)
    text = re.sub(r'\b(cm|m|km|mm)3\b', r'\1³', text)
    
    # 4. Trig powers: e.g. sin2, cos2, tan2, sec2, cosec2, cot2
    # Handle cases where trig power is directly attached to digits (angle): cosec260 -> cosec² 60
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot)2(\d+)', r'\1² \2', text)
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot)3(\d+)', r'\1³ \2', text)
    
    # Handle general trig squares/cubes with space or boundary or theta
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot)2\s*', r'\1² ', text)
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot)3\s*', r'\1³ ', text)
    
    # 5. Algebra squares & cubes: e.g. a2 -> a², b2 -> b², x2 -> x², y2 -> y²
    # Coefficients: 64x2 -> 64x², 81y2 -> 81y²
    text = re.sub(r'(\d+)([a-dxyzr])2\b', r'\1\2²', text)
    text = re.sub(r'(\d+)([a-dxyzr])3\b', r'\1\2³', text)
    
    # Standalone or bordered variables: a2 + b2, x2 - y2, |a - b|
    text = re.sub(r'\b([a-dxyzr])2\b', r'\1²', text)
    text = re.sub(r'\b([a-dxyzr])3\b', r'\1³', text)
    
    # In expressions like x2+y2 or a2+b2 (no spaces around operator)
    text = re.sub(r'([a-dxyzr])2(?=[+\-=*/])', r'\1²', text)
    text = re.sub(r'([a-dxyzr])3(?=[+\-=*/])', r'\1³', text)
    
    # 6. Clean coefficients before trig: e.g. 3cosec² -> 3 cosec², 2tan² -> 2 tan², 6cosec -> 6 cosec
    text = re.sub(r'(\d+)(sin|cos|tan|sec|cosec|cot)', r'\1 \2', text)
    
    # 7. Clean degree formatting when degree is separated or stuck:
    # e.g. "30 °" -> "30°", "60 °" -> "60°"
    text = re.sub(r'(\d+)\s+°', r'\1°', text)
    
    # Clean up double spaces created by substitutions
    text = re.sub(r'[ \t]+', ' ', text)
    
    return text

backup_dir = r"c:\ssczone\src\data\pyq_backup"
files = sorted(glob.glob(os.path.join(backup_dir, "*2026*.json")))

changes = []

for fpath in files:
    fname = os.path.basename(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        data = json.load(f)
    for q in data:
        qn = q["question_number"]
        if 51 <= qn <= 75:
            qt = q.get("question_text", "")
            cleaned_qt = format_math_text(qt)
            
            opts_changed = False
            new_opts = {}
            for k in ["option_a", "option_b", "option_c", "option_d"]:
                val = q.get(k, "")
                c_val = format_math_text(val)
                if c_val != val:
                    opts_changed = True
                new_opts[k] = c_val
                
            if cleaned_qt != qt or opts_changed:
                changes.append((fname, qn, qt, cleaned_qt, q.get("option_a",""), new_opts["option_a"]))

print(f"Total Math questions modified: {len(changes)}")
print("\nSample 25 transformations:")
for c in changes[:25]:
    print("=" * 60)
    print(f"{c[0]} Q.{c[1]}:")
    print(f"  BEFORE QT : {repr(c[2])}")
    print(f"  AFTER QT  : {repr(c[3])}")
    if c[4] != c[5]:
        print(f"  BEFORE OPT_A: {repr(c[4])}")
        print(f"  AFTER OPT_A : {repr(c[5])}")
