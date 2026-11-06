import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

test_texts = [
    "Simplify: (2½ + 3.6) – 1.9 सरल करें: (2½ + 3.6) - 1.9",
    "Evaluate: 7¼ – [5/6 ÷ {1/3 – (1/2 × (3/4 – 1/4))}] का मूल्यांकन करें: 7¼ - [5/6 ÷ {1/3 - (1/2 × (3/4 - 1/4))}]",
    "Find m: The line y = mx + 5 passes through (1,8). रेखा y = mx + 5 बिंदु (1,8) से होकर जाती है। m ज्ञात कीजिए।",
    "What is the value of: x² + 2x + 1 when x = 3? x² + 2x + 1 का मान क्या है जब x = 3?"
]

devanagariRegex = re.compile(r'[\u0900-\u097F]')

for text in test_texts:
    firstHi = devanagariRegex.search(text).start()
    prefix = text[:firstHi]
    
    # Old faulty logic:
    m = re.search(r'(\?|\.\s|\.\n|:\s)\s*(["\w\s\d\+\-\=]{1,40})$', prefix)
    if m:
        punctPos = m.start(1) + len(m.group(1))
        en_old = text[:punctPos].strip()
        hi_old = text[punctPos:].strip()
    else:
        en_old = text[:firstHi].strip()
        hi_old = text[firstHi:].strip()
        
    print("\n--- TEST CASE ---")
    print("RAW:   ", text)
    print("EN_OLD:", en_old)
    print("HI_OLD:", hi_old)
