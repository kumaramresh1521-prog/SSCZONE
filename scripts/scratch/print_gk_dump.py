import json

with open(r"c:\ssczone\scripts\scratch\gk_image_ocr_dump.json", encoding="utf-8") as f:
    data = json.load(f)

print(f"Total items in dump: {len(data)}\n")
for i, d in enumerate(data):
    ocr_preview = " // ".join(d["ocr_text"])[:100]
    prompt = d["txt_prompt"].strip().replace("\n", " ")[:50]
    print(f"{i+1:2d}. Q#{d['id']} (Paper {d['paper_id']} Q.{d['q_num']})")
    print(f"    Prompt: {prompt}")
    print(f"    OCR   : {ocr_preview}")
    print(f"    Opts  : A={d['option_a'][:25]} | Ans={d['correct']}")
    print()
