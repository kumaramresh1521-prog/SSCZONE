import json

with open(r"c:\ssczone\scripts\scratch\gk_image_ocr_dump.json", encoding="utf-8") as f:
    items = json.load(f)

print(f"Total: {len(items)}")
for it in items[:5]:
    print(f"Q#{it['id']} (Q.{it['q_num']}):")
    print("  Lines:", it['ocr_text'])
    print()
