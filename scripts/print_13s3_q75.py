import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("tmp/13sept_s3_raw.json", "r", encoding="utf-8") as f:
    qs = json.load(f)

q75 = qs[74]
print("Q75 TEXT:", q75["question_text"])
print("Q75 A:", q75["option_a"])
print("Q75 B:", q75["option_b"])
print("Q75 C:", q75["option_c"])
print("Q75 D:", q75["option_d"])
print("Q75 ANS:", q75["correct_answer"])
