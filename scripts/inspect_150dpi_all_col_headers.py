import json
import re
import os
import sys
sys.path.append('scripts')
from parse_t4_from_150dpi import order, half_dir, is_noise, find_two_col_splits, cluster_col_lines, is_exam_line, is_opt_line

# First check x-range / column splits of p31_r and p38_r
for edge_name in ['p31_r', 'p38_r']:
    with open(os.path.join(half_dir, f"{edge_name}.json"), 'r', encoding='utf-8') as f:
        raw = [it for it in json.load(f) if not is_noise(it['box'], it['text'])]
    print(f"\n=== EDGE {edge_name} ({len(raw)} boxes) ===")
    raw.sort(key=lambda b: (b['box'][0][0], b['box'][0][1]))
    for b in raw[:15]:
        print(f"  x={b['box'][0][0]:.1f}..{b['box'][1][0]:.1f}, y={b['box'][0][1]:.1f} -> {b['text']}")
    print("  --- largest x ---")
    raw_hi = sorted(raw, key=lambda b: -b['box'][1][0])
    for b in raw_hi[:15]:
        print(f"  x={b['box'][0][0]:.1f}..{b['box'][1][0]:.1f}, y={b['box'][0][1]:.1f} -> {b['text']}")

# Also print all candidate question-start lines in columns 25..40 (p36..p38) to verify exact col_ranges!
with open('scripts/pdf_samples/t4_150dpi_stream.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
stream = data['stream']

print("\n=== SCANNING ALL Q NUMBERS FOUND IN EACH COLUMN ===")
for ci in range(41):
    clines = [it for it in stream if it['col'] == ci]
    cname = clines[0]['col_name'] if clines else f"col_{ci}"
    found_nums = []
    for it in clines:
        txt = it['line'].strip()
        if is_opt_line(txt) or is_exam_line(txt): continue
        m = re.match(r'^[^\w]*([1-9]\d{0,2})\s*[\.\,\:\s]', txt)
        if m:
            v = int(m.group(1))
            if 1 <= v <= 254:
                found_nums.append(f"{v}:{txt[:22]}")
    print(f"Col {ci:2d} ({cname:9s}): {found_nums}")
