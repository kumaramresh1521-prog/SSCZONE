import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)

def extract_2col(doc):
    full_text = ""
    for page_idx in range(1, len(doc)):
        page = doc[page_idx]
        blocks = page.get_text("blocks")
        valid_blocks = [b for b in blocks if b[4].strip()]
        left_blocks = [b for b in valid_blocks if (b[0] + b[2]) / 2 < 305]
        right_blocks = [b for b in valid_blocks if (b[0] + b[2]) / 2 >= 305]
        left_blocks.sort(key=lambda b: b[1])
        right_blocks.sort(key=lambda b: b[1])
        for b in left_blocks: full_text += b[4] + "\n"
        for b in right_blocks: full_text += b[4] + "\n"
    return full_text

text = extract_2col(doc)

# Print all matches of r"(?:^|\n)\s*(\d{1,3})\.\s*"
matches = list(re.finditer(r"(?:^|\n)\s*(\d{1,3})\.\s*", text))
nums = [int(m.group(1)) for m in matches]
print("All matched numbers count:", len(nums))
print("First 35 matched numbers:", nums[:35])

# Find where 26 is
for i, m in enumerate(matches):
    if int(m.group(1)) in [25, 26, 27]:
        print(f"Match #{i}: group={m.group(1)}, text snippet={text[m.start():m.start()+60].replace(chr(10), ' ')}")
