import json, re

with open('scripts/pdf_samples/t4_parsed_254.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

templates = {}
for q in raw:
    qt = q['question_text']
    # Extract prefix before the tokens
    m = re.match(r'^(.*?\.)\s*(?:[A-Z0-9\?_]+\s*:.*|[A-Z]{3,}\s+is\s+related.*)$', qt)
    if m:
        pref = m.group(1)
        templates.setdefault(pref, []).append(q['q_num'])
    else:
        templates.setdefault('RAW:' + qt[:65], []).append(q['q_num'])

print(f"Distinct instruction prefixes: {len(templates)}")
for t, qs in sorted(templates.items(), key=lambda x: -len(x[1]))[:45]:
    print(f"  [{len(qs):3d}] {t} -> qs={qs[:5]}")

print("\n=== ALL EXAM TAG PREFIXES & PATTERNS ===")
ex_pats = {}
for q in raw:
    ex = q.get('exam_tag', '')
    ex_pats.setdefault(ex, []).append(q['q_num'])
print(f"Distinct raw exam tags: {len(ex_pats)}")
for ex, qs in sorted(ex_pats.items())[:50]:
    print(f"  Q{qs}: {ex}")
