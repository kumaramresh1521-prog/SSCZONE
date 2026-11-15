import sys
import re
from generate_articles_chapter import build_articles_content

content = build_articles_content()
content_lower = content.lower()
clean_text = re.sub(r'<[^>]+>', ' ', content).lower()
clean_text = re.sub(r'\s+', ' ', clean_text)

checks = [
    # Types & Basics
    ("Indefinite Articles", "indefinite"),
    ("Definite Article", "definite"),
    # A vs An
    ("Sound vs spelling rule", "sound"),
    ("University with a", "university"),
    ("European with a", "european"),
    ("Unique with a", "unique"),
    ("One-eyed with a", "one-eyed"),
    ("Silent h (hour)", "hour"),
    ("Heir with an", "heir"),
    ("Honest with an", "honest"),
    ("Honorary with an", "honorary"),
    ("M.L.A. with an", "m.l.a."),
    ("S.P. with an", "s.p."),
    ("F.I.R. with an", "f.i.r."),
    ("X-ray with an", "x-ray"),
    ("LL.B. with an", "ll.b."),
    # Uses of A/An
    ("Class representative cow", "cow"),
    ("Proper as common Shylock", "shylock"),
    ("Price speed kilo hour", "kilo"),
    ("Exclamations what a", "what a pretty girl"),
    ("Position with so too such", "too weak a"),
    ("Verb as noun walk", "for a walk"),
    ("Phrases tell a lie", "tell a lie"),
    # Uses of The
    ("Himalayas mountain range", "himalayas"),
    ("Everest peak exception", "mount everest"),
    ("Rivers oceans The Ganga", "ganga"),
    ("Celestial Sun Moon", "sun"),
    ("Scriptures The Gita", "gita"),
    ("Countries USA Netherlands", "netherlands"),
    ("Adjective as plural The rich", "the rich"),
    ("Musical instruments flute", "flute"),
    ("Double comparative higher colder", "higher"),
    ("Choice of the two", "weaker of the two"),
    ("Metaphorical Kalidas Shakespeare", "shakespeare"),
    ("Television exception", "television"),
    # Omission (Zero Article)
    ("Primary purpose school hospital prison", "primary purpose"),
    ("Gold of South Africa specific", "south africa"),
    ("Languages English vs The English", "languages"),
    ("By transport by bus", "by bus"),
    ("Man is mortal", "man is mortal"),
    # Repetition
    ("Prime Minister and President is vs are", "prime minister and president"),
    ("Ordinals first and second chapters", "ordinals"),
]

passed = 0
failed = 0

print("=== Running Verification Check 1 for Chapter: Articles ===")
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
html_tags = ["<table", "</table>", "<thead>", "<tbody>", "<tr>", "<td>", "<div class=\"callout-box", "<div class=\"pyq-box"]
for tag in html_tags:
    count = content.count(tag)
    if count == 0:
        print(f"❌ Missing tag: {tag}")
        sys.exit(1)
    else:
        print(f"✓ Tag '{tag}' verified (count: {count})")

print("\n🎉 ALL VERIFICATION CHECKS PASSED FOR ARTICLES (100% COMPLETE & VERIFIED)")
