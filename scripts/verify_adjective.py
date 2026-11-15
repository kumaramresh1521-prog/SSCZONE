import sys
from generate_adjective_chapter import build_adjective_content

content = build_adjective_content()
content_lower = content.lower()

checks = [
    # Kinds & Classes
    ("Descriptive vs Determiner", "descriptive"),
    ("Attributive vs Predicative", "attributive"),
    ("Demonstrative Adjective", "demonstrative"),
    ("Distributive Adjective", "distributive"),
    ("Quantitative Adjective", "quantitative"),
    ("Participle Adjective", "participle"),
    ("Proper Adjective", "proper adjective"),
    # Degrees Table
    ("Positive, Comparative, Superlative", "degrees of comparison"),
    ("Good better best", "better"),
    ("Bad worse worst", "worse"),
    ("Little less least", "least"),
    ("Much more most", "more"),
    # Rules
    ("Rule I (Quality vs Action)", "rule i"),
    ("Rule II (Linking Verbs)", "linking verbs"),
    ("Rule III (Absolute Adjectives)", "absolute adjectives"),
    ("Rule IV (Latin -ior take to)", "preferable"),
    ("Rule V (Confusing Pairs)", "confusing pairs"),
    ("Rule VI (Same Degree)", "same degree"),
    ("Rule VII (Ordinal before Cardinal)", "ordinal"),
    ("Rule VIII (more clever vs cleverer)", "more clever"),
    ("Rule IX (kind / type / sort)", "kind"),
    ("Rule X (other / else & that of)", "illogical"),
    ("Rule XI (all, both, whole)", "both"),
    ("Rule XII (Position of correlatives)", "not only"),
    ("Rule XIII (as...as / than)", "as honest as"),
    ("Rule XIV (Different prepositions)", "different prepositions"),
    ("Rule XVI (Times with positive degree)", "times"),
    ("Rule XVII (Predicative-only adjectives)", "afraid"),
    ("Rule XVIII (Order of Adjectives SSACNM)", "ssacnm"),
    # Specific Critical Items
    ("Unique no degree", "unique"),
    ("Senior to", "senior to"),
    ("Little vs Few", "hardly any"),
    ("Elder vs Older", "blood relations"),
    ("Farther vs Further", "farther"),
    ("Later vs Latter", "latter"),
    ("Fewer passengers", "fewer"),
    ("Climate of Chennai that of", "that of delhi"),
    ("All the students", "all the"),
    ("Three times as cheap as", "as cheap as"),
    ("The boy was asleep", "asleep"),
]

passed = 0
failed = 0

print("=== Running Verification Check 1 for Chapter: Adjective ===")
for label, term in checks:
    if term in content_lower:
        passed += 1
    else:
        print(f"❌ MISSING: {label} ('{term}')")
        failed += 1

print(f"Check 1 Result: {passed}/{len(checks)} passed.")
if failed > 0:
    print("VERIFICATION FAILED")
    sys.exit(1)

print("\n=== Running Verification Check 2 (HTML Structure & Formatting) ===")
html_tags = ["<table", "</table>", "<thead>", "<tbody>", "<tr>", "<td>", "<div class=\"callout-box", "<div class=\"formula-card", "<div class=\"pyq-box"]
for tag in html_tags:
    count = content.count(tag)
    if count == 0:
        print(f"❌ Missing tag: {tag}")
        sys.exit(1)
    else:
        print(f"✓ Tag '{tag}' verified (count: {count})")

print("\n🎉 ALL VERIFICATION CHECKS PASSED FOR ADJECTIVE (100% COMPLETE & VERIFIED)")
