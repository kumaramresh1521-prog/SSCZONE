import pypdf
import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'F:\startup  send mail\pdf\A New Approach to REASONING Verbal & Non-Verbal.pdf'
reader = pypdf.PdfReader(pdf_path)

# Extract raw pypdf text for pages 1 to 8
pypdf_lines = []
for p in range(8):
    t = reader.pages[p].extract_text() or ''
    for l in t.split('\n'):
        l_str = l.strip()
        if l_str:
            pypdf_lines.append(l_str)

print(f"Total lines extracted by pypdf: {len(pypdf_lines)}")

# Let's inspect lines starting with numbers 1..155
pypdf_q_map = {}
for i, l in enumerate(pypdf_lines):
    m = re.match(r'^(\d{1,3})\.\s*(.*)', l)
    if m:
        q_num = int(m.group(1))
        if 1 <= q_num <= 155:
            # Gather continuation lines until next question or options
            content = [m.group(2)]
            for next_line in pypdf_lines[i+1:i+4]:
                if re.match(r'^\d{1,3}\.', next_line) or re.match(r'^\([a-e]\)', next_line):
                    break
                # if it's text like "related to"
                if any(w in next_line for w in ['related to', 'same way', 'in the', '::']):
                    content.append(next_line)
            pypdf_q_map[q_num] = " ".join(content)

print(f"pypdf mapped question lines: {len(pypdf_q_map)} / 155")
for q in range(1, 16):
    if q in pypdf_q_map:
        print(f"Q{q}: {pypdf_q_map[q]}")
