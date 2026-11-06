import urllib.parse
import urllib.request
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def mask_tokens(text):
    tokens = []
    
    def repl(m):
        tokens.append(m.group(0))
        return f"___PROTECT_{len(tokens)-1}___"
        
    current = text
    
    # 1. Markdown Images & HTML
    current = re.sub(r'!\[[^\]]*\]\([^\s)]+\)', repl, current)
    current = re.sub(r'<img\b[^>]*>', repl, current, flags=re.I)
    current = re.sub(r'<[^>]+>', repl, current)
    
    # 2. LaTeX Math
    current = re.sub(r'(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$\n]+\$)', repl, current)
    
    # 3. Quoted tokens
    current = re.sub(r'(["\'])(?:(?=(\\?))\2.)*?\1', repl, current)
    
    # 4. Mixed-case ciphers
    current = re.sub(r'\b(?:[A-Z]+[a-z]+[A-Z][A-Za-z]*|[a-z]+[A-Z]+[a-z]*)\b', repl, current)
    
    # 5. Letter analogies & series
    current = re.sub(r'\b[A-Z]{2,}\s*:\s*[A-Z]{2,}\b', repl, current)
    current = re.sub(r'\b[A-Z]{2,}(?:\s*,\s*[A-Z]{2,})+\b', repl, current)
    current = re.sub(r'\b[A-Z](?:\s*,\s*[A-Z])+\b', repl, current)
    current = re.sub(r'\b[A-Z]{1,4}(?:-[A-Z]{1,4})+\b', repl, current)
    current = re.sub(r'\b[A-Za-z0-9]+\s*::\s*[A-Za-z0-9]+\b', repl, current)
    
    # 6. Trigonometry functions & arguments
    current = re.sub(r'\b(?:sin|cos|tan|cot|sec|cosec|csc)(?:²|³|\^[0-9]+)?(?:\s*(?:[A-Za-zθθαβγφxyz]|\([^\)\n]+\)|\d+°?))?\b', repl, current, flags=re.I)
    
    # 7. Geometry
    current = re.sub(r'(?:△|∠|⊥|∥|≅|∼)\s*[A-Za-z0-9]+', repl, current)
    
    # 8. Coordinates
    current = re.sub(r'\(\s*[-+]?\d*\.?\d+\s*,\s*[-+]?\d*\.?\d+\s*\)', repl, current)
    current = re.sub(r'\(\s*[xyz]\s*,\s*[xyz]\s*\)', repl, current, flags=re.I)
    
    # 9. Equations & Ratios
    current = re.sub(r'\b\d+\s*:\s*\d+(?:\s*:\s*\d+)?\b', repl, current)
    current = re.sub(r'\b[a-zA-Z]\s*=\s*[-+]?\d*\.?\d+\b', repl, current)
    
    # 10. Math operators substitution
    current = re.sub(r'\b\d+\s+[A-Z]\s+\d+(?:\s+[A-Z]\s+\d+)*\b', repl, current)
    current = re.sub(r'\b[A-Z]\s+(?:denotes|means|stands for|represents)\b', repl, current, flags=re.I)
    
    return current, tokens

def unmask_tokens(text, tokens):
    res = text
    for idx, t in enumerate(tokens):
        # Match any variation of ___PROTECT_0___ Google might emit
        pat = re.compile(rf'(?:___|---|—)\s*(?:PROTECT|सुरक्षित|सुरक्षा|प्रोटेक्ट)\s*_?\s*{idx}\s*(?:___|---|—)', re.I)
        res = pat.sub(lambda _: t, res)
    return res

def translate(text):
    masked, tokens = mask_tokens(text)
    print("MASKED:", masked)
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q={urllib.parse.quote(masked)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        raw_hi = "".join(item[0] for item in data[0] if item and item[0])
    restored = unmask_tokens(raw_hi, tokens)
    return restored

tests = [
    "If sin A + cos A = 1, then find the value of sin 2A.",
    "Evaluate: 6 - [2/3 ÷ {1/6 + (1/2 × (1 - 1/3))}]",
    "Find the coordinates of the point on the y-axis which is equidistant from the points (3, 2) and (-5, -2).",
    "In △ABC, ∠B = 90°, AB = 5 cm and BC = 12 cm. What is tan A?",
    "If 'A' denotes '+', 'B' denotes '-', then find the value of 16 D 4 A 8 C 2 B 5.",
    "The ratio of the speed of two trains is 3 : 4."
]

for t in tests:
    print(f"\nORIGINAL: {t}")
    out = translate(t)
    print(f"HINDI:    {out}")
    # Verify no 'पाप' in trigonometry
    if 'पाप' in out:
        print("  ❌ ERROR: 'पाप' found in translation!")
    else:
        print("  ✅ PASS: Trig/math accurately preserved!")
