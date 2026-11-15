# -*- coding: utf-8 -*-
"""
Filters src/data/chapter_notes.json:
Deletes all English chapters except 'english-120-rules-of-grammar-master-notes'.
Keeps all other subjects (Physics, Polity, Maths, Biology) intact.
"""

import json

json_path = 'src/data/chapter_notes.json'
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

kept = []
deleted = []

for item in data:
    if item.get('subject_id') == 'english':
        if item.get('slug') == 'english-120-rules-of-grammar-master-notes':
            item['chapter_number'] = 1
            item['sort_order'] = 1
            item['is_featured'] = True
            item['is_active'] = True
            kept.append(item)
            print(f"✅ KEEP: {item.get('slug')} ({item.get('title')})")
        else:
            deleted.append(item.get('slug'))
            print(f"❌ DELETE: {item.get('slug')}")
    else:
        kept.append(item)

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(kept, f, ensure_ascii=False, indent=2)

print("\n--- SUMMARY ---")
print(f"Total original chapters: {len(data)}")
print(f"Total deleted English chapters: {len(deleted)}")
print(f"Total remaining chapters: {len(kept)}")
eng_kept = [c for c in kept if c.get('subject_id') == 'english']
print(f"Remaining English chapters: {[c.get('slug') for c in eng_kept]}")
