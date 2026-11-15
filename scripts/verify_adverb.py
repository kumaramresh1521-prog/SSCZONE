import sys
import re
from generate_adverb_chapter import build_adverb_content

content = build_adverb_content()
content_lower = content.lower()
clean_text = re.sub(r'<[^>]+>', ' ', content).lower()
clean_text = re.sub(r'\s+', ' ', clean_text)

checks = [
    # 8 Kinds
    ("Adverb of Time", "adverb of time"),
    ("Adverb of Frequency", "adverb of frequency"),
    ("Adverb of Place", "adverb of place"),
    ("Adverb of Manner", "adverb of manner"),
    ("Affirmation and Negation", "adverb of affirmation"),
    ("Adverb of Degree", "adverb of degree"),
    ("Interrogative Adverb", "interrogative adverb"),
    ("Relative Adverb", "relative adverb"),
    # Rules
    ("Rule I (Adjective vs Adverb)", "rule i"),
    ("Rule II (Position of Frequency)", "rule ii"),
    ("Rule III (Manner with Intransitive vs Transitive)", "rule iii"),
    ("Rule IV (Inversion)", "inversion"),
    ("Rule V (Else but vs Other than)", "else"),
    ("Rule VI (Never vs Not)", "never"),
    ("Rule VII (Fixed Correlatives)", "seldom or never"),
    ("Rule VIII (Double Negatives)", "double negatives"),
    ("Rule IX (-ly Adjectives)", "cowardly"),
    ("Rule X (Very Much Enough Too Rather)", "enough"),
    ("Rule XI (Echo Tags)", "so did"),
    ("Rule XII (Yes / No Answers)", "rule xii"),
    ("Rule XIII (Verbs with/without as)", "rule xiii"),
    # Critical Items
    ("Seldom does he", "seldom does he"),
    ("Hardly had she", "hardly had she"),
    ("No sooner did", "no sooner did"),
    ("Else followed by but", "sheer madness"),
    ("Did not go last year", "did not go"),
    ("Seldom, if ever", "seldom, if ever"),
    ("Deny forbid no negative", "denied"),
    ("In a cowardly manner", "in a cowardly manner"),
    ("Fastly wrong", "fastly"),
    ("Wise enough", "wise enough"),
    ("Too weak to walk", "too weak to walk"),
    ("Regard define take as", "regard"),
    ("Appointed him peon no as", "appointed him"),
    ("Considered the best no as", "considered"),
]

passed = 0
failed = 0

print("=== Running Verification Check 1 for Chapter: Adverb ===")
for label, term in checks:
    if term in content_lower or term in clean_text:
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

print("\n🎉 ALL VERIFICATION CHECKS PASSED FOR ADVERB (100% COMPLETE & VERIFIED)")
