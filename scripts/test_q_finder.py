import fitz
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"F:\startup  send mail\2026\SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"
doc = fitz.open(pdf_path)

# Extract all blocks with page number
all_blocks = []
for p_idx in range(1, len(doc)):
    blocks = doc[p_idx].get_text("blocks")
    for b in blocks:
        text = b[4].strip()
        if text:
            all_blocks.append({
                "page": p_idx + 1,
                "x0": b[0], "y0": b[1], "x1": b[2], "y1": b[3],
                "text": text
            })

# Let's check finding each question 1..100
# A question header starts with regex: r"^0?{i}\.\s*"
q_data = {}

for q_num in range(1, 101):
    pattern = rf"(?:^|\n)\s*0?{q_num}\.\s*"
    found = []
    for b_idx, b in enumerate(all_blocks):
        m = re.search(pattern, b["text"])
        if m:
            found.append((b_idx, b))
    if len(found) == 1:
        q_data[q_num] = found[0]
    elif len(found) > 1:
        # If multiple matches (e.g. 1. matching inside a sentence or options), pick the one starting with number
        strict = [f for f in found if re.match(rf"^0?{q_num}\.\s*", f[1]["text"])]
        if len(strict) == 1:
            q_data[q_num] = strict[0]
        else:
            q_data[q_num] = found[0]
    else:
        print(f"Missing Q.{q_num}")

print(f"Successfully identified Question Headers: {len(q_data)} / 100")
