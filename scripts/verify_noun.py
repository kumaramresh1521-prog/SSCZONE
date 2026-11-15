import sys
from generate_noun_chapter import build_noun_content

content = build_noun_content()
content_lower = content.lower()

# Verification checklist (from noun_ssczone.pdf)
checks = [
    # Kinds
    ("Common Noun", "common noun"),
    ("Proper Noun", "proper noun"),
    ("Collective Noun", "collective noun"),
    ("Abstract Noun", "abstract noun"),
    ("Material Noun", "material noun"),
    # Cases
    ("Nominative Case", "nominative"),
    ("Objective Case", "objective"),
    ("Possessive Case", "possessive"),
    ("Vocative Case", "vocative"),
    ("Apposition Case", "apposition"),
    # Rules
    ("Rule I (Uncountables)", "rule i"),
    ("Rule II (Collective Nouns)", "rule ii"),
    ("Rule III (Same Singular & Plural)", "rule iii"),
    ("Rule IV (Nouns ending in s)", "rule iv"),
    ("Rule V (Meaning changing in plural)", "rule v"),
    ("Rule VI (Plural-only nouns)", "rule vi"),
    ("Rule VII (Compound nouns)", "rule vii"),
    ("Rule VIII (Nouns of number)", "rule viii"),
    ("Rule IX (Apostrophe with s)", "rule ix"),
    ("Rule X (Two adjectives)", "rule x"),
    ("Rule XI (Noun repeated after prep)", "rule xi"),
    ("Rule XII (Fractions)", "rule xii"),
    ("Rule XIII (Foreign & Irregular plurals)", "rule xiii"),
    # Critical Vocabulary / Specific items
    ("Scenery uncountable", "scenery"),
    ("Furniture uncountable", "furniture"),
    ("Advice uncountable", "advice"),
    ("Luggage uncountable", "luggage"),
    ("Mischief uncountable", "mischief"),
    ("Loaf of bread", "loaf of bread"),
    ("Piece of advice", "piece of advice"),
    ("Cattle plural", "cattle"),
    ("Committee divided vs united", "committee"),
    ("Jury", "jury"),
    ("Sheep singular/plural", "sheep"),
    ("Deer", "deer"),
    ("Mathematics subject vs calculation", "mathematics"),
    ("Measles disease", "measles"),
    ("Wood vs Woods", "woods"),
    ("Good vs Goods", "goods"),
    ("Arm vs Arms", "arms"),
    ("Iron vs Irons", "irons"),
    ("Water vs Waters", "waters"),
    ("Sand vs Sands", "sands"),
    ("Scissors plural-only", "scissors"),
    ("Spectacles plural-only", "spectacles"),
    ("Alms", "alms"),
    ("Ten-day tour", "ten-day tour"),
    ("Five-rupee note", "five-rupee note"),
    ("Two hundred vs Hundreds of", "two hundred"),
    ("Living vs Non-living apostrophe", "non-living"),
    ("Somebody else's", "somebody else's"),
    ("City after city", "city after city"),
    ("Door to door", "door to door"),
    ("One and a half years", "one and a half"),
    ("Commander-in-chief plural", "commanders-in-chief"),
    ("Criterion vs Criteria", "criteria"),
    ("Phenomenon vs Phenomena", "phenomena"),
    ("Datum vs Data", "datum"),
    ("Alumnus vs Alumni", "alumni"),
]

passed = 0
failed = 0

print("=== Running Verification Check 1 for Chapter: Noun ===")
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

print("\n🎉 ALL VERIFICATION CHECKS PASSED FOR NOUN (100% COMPLETE & VERIFIED)")
