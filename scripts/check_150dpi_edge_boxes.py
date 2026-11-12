import json
import os
import sys
sys.path.append('scripts')
from analyze_150dpi_columns import order, half_dir, is_noise, find_two_col_splits

print("=== CHECKING NOISE-FILTERED BOXES ===")
for name in order:
    with open(os.path.join(half_dir, f"{name}.json"), 'r', encoding='utf-8') as f:
        raw = json.load(f)
    dropped = [it for it in raw if is_noise(it['box'], it['text'])]
    for it in dropped:
        if not any(k in it['text'].upper() for k in ['TELEGRAM', '@APNA', 'ANALOGY', 'K5279', 'TYPE-IV', 'TYPE -IV', 'TYPE - IV']):
            print(f"  DROPPED {name} y={(it['box'][0][1]+it['box'][2][1])/2:.1f}: '{it['text']}'")

# Also inspect p34_r crossing box
with open(os.path.join(half_dir, "p34_r.json"), 'r', encoding='utf-8') as f:
    raw34r = [it for it in json.load(f) if not is_noise(it['box'], it['text'])]
for it in raw34r:
    if it['box'][0][0] < 549 < it['box'][1][0]:
        print(f"p34_r crossing box at x={it['box'][0][0]:.1f}..{it['box'][1][0]:.1f}, y={it['box'][0][1]:.1f}: '{it['text']}'")
