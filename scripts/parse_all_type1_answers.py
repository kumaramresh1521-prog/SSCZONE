from rapidocr_onnxruntime import RapidOCR
import re
import json

engine = RapidOCR()

answers = {}

# 1. Parse Block B (105 to 168)
res_b, _ = engine(r'c:\ssczone\scripts\pdf_samples\type1_answers_105_168.png')
for box, text, score in res_b:
    matches = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    for q_num, ans in matches:
        num = int(q_num)
        if 105 <= num <= 168:
            answers[num] = int(ans)

# 2. Parse Block A & C from type1_answers_crop.png
res_ac, _ = engine(r'c:\ssczone\scripts\pdf_samples\type1_answers_crop.png')
for box, text, score in res_ac:
    matches = re.findall(r'(\d{1,3})\s*[\.\)]\s*\(?([1-4])\)?', text)
    for q_num, ans in matches:
        num = int(q_num)
        if 1 <= num <= 284:
            answers[num] = int(ans)

print(f"Total answers parsed: {len(answers)} / 284")
missing = [i for i in range(1, 285) if i not in answers]
print(f"Missing answers: {missing}")

with open('type1_answers_complete.json', 'w') as f:
    json.dump(answers, f, indent=2)
