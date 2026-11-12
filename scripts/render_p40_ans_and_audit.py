import fitz
import json

doc = fitz.open('analogy_chapter2.pdf')
# Page 40 is doc[39], TYPE-IV is in right half / bottom-middle-right
pix = doc[39].get_pixmap(dpi=250, clip=fitz.Rect(270, 30, 835, 575))
pix.save('scripts/pdf_samples/p40_t4_ans_table.png')
print("Saved scripts/pdf_samples/p40_t4_ans_table.png")

# Check t4_answers_visual_verified.json on discrepancy clusters (82..88, 106..172, 196, 237)
with open('scripts/pdf_samples/t4_answers_visual_verified.json', 'r', encoding='utf-8') as f:
    ans = {int(k): v for k, v in json.load(f).items()}

print("AnsTable Q1..20   :", [ans[i] for i in range(1, 21)])
print("AnsTable Q81..100 :", [ans[i] for i in range(81, 101)])
print("AnsTable Q101..120:", [ans[i] for i in range(101, 121)])
print("AnsTable Q121..140:", [ans[i] for i in range(121, 141)])
print("AnsTable Q141..160:", [ans[i] for i in range(141, 161)])
print("AnsTable Q161..180:", [ans[i] for i in range(161, 181)])
print("AnsTable Q181..200:", [ans[i] for i in range(181, 201)])
