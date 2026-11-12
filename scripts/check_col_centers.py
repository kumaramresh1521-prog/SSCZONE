from PIL import Image
import json
import numpy as np

# Let's inspect x coordinates of text boxes in p40
with open('all_expl_ocr_lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

# Wait, all_expl_ocr_lines.json didn't store x, only cy!
# But we can inspect using RapidOCR or re-extract x coordinates!
