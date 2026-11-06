import glob
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

json_files = glob.glob(r'src/data/pyq_backup/*.json')
print(f"Scanning {len(json_files)} papers for image formats...")

img_types = {
    'markdown': 0,
    'html_img': 0,
    'bracket_image': 0,
    'raw_url': 0
}

sample_images = []

for jf in json_files:
    fname = jf.split('\\')[-1]
    with open(jf, 'r', encoding='utf-8') as f:
        try:
            qs = json.load(f)
        except Exception:
            continue
            
    for q in qs:
        fields = [q.get('question_text'), q.get('option_a'), q.get('option_b'), q.get('option_c'), q.get('option_d')]
        for f in fields:
            if not f:
                continue
            if '![' in f:
                img_types['markdown'] += 1
                if len(sample_images) < 3: sample_images.append(('markdown', fname, q.get('question_number'), f[:100]))
            if '<img' in f:
                img_types['html_img'] += 1
                if len(sample_images) < 6: sample_images.append(('html_img', fname, q.get('question_number'), f[:100]))
            if '[Image:' in f:
                img_types['bracket_image'] += 1
                if len(sample_images) < 9: sample_images.append(('bracket_image', fname, q.get('question_number'), f[:100]))

print("Image format counts across all papers:", img_types)
print("\nSamples:")
for s in sample_images:
    print(f"  [{s[0]}] {s[1]} Q{s[2]}: {s[3]}")
