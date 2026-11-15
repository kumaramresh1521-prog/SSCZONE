# -*- coding: utf-8 -*-
import os
import re

chapters = [
    # 10 Grammar chapters
    ('noun', 'scripts/scratch/noun_masterclass_formatted.html'),
    ('pronoun', 'scripts/scratch/pronoun_masterclass_formatted.html'),
    ('tenses', 'scripts/scratch/tenses_masterclass_formatted.html'),
    ('adjective', 'scripts/scratch/adjective_masterclass_formatted.html'),
    ('adverb', 'scripts/scratch/adverb_masterclass_formatted.html'),
    ('articles', 'scripts/scratch/articles_masterclass_formatted.html'),
    ('voice', 'scripts/scratch/voice_masterclass_formatted.html'),
    ('question_tags', 'scripts/scratch/question_tags_masterclass_formatted.html'),
    ('modals', 'scripts/scratch/modals_masterclass_formatted.html'),
    ('preposition', 'scripts/scratch/preposition_masterclass_formatted.html'),
    # 6 Compendiums
    ('120_rules', 'scripts/scratch/120_rules_ssczone_formatted.html'),
    ('phrasal_verbs', 'scripts/scratch/phrasal_ssczone_formatted.html'),
    ('idioms_phrases', 'scripts/scratch/idioms_ssczone_formatted.html'),
    ('ows', 'scripts/scratch/ows_ssczone_formatted.html'),
    ('syno_anto', 'scripts/scratch/syno_anto_ssczone_formatted.html'),
    ('paronyms_homonyms', 'scripts/scratch/paronyms_ssczone_formatted.html'),
]

broken_words = ['कया', 'लए', 'मलना', 'मुल', 'सहासन', 'पि्रय', 'व्यकि्त', 'स्वेा', 'चाहए', 'अधक', 'नहैं', 'कमर्म', 'सवर्तानाम', 'किारण']

print("=== VERIFYING ALL 16 CHAPTERS ===")
all_pass = True

for name, path in chapters:
    if not os.path.exists(path):
        print(f"❌ [MISSING] {name}: {path} not found!")
        all_pass = False
        continue

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    size = len(content)

    # 1. Check colliding spans: span.lang-en followed directly by span.lang-hi inside <p>
    colliding = re.findall(r'<p[^>]*>\s*<span class="lang-en">.*?</span>\s*<span class="lang-hi">', content, flags=re.DOTALL)

    # 2. Check broken hindi words
    found_broken = [w for w in broken_words if w in content]

    # 3. Check dark classes or black bg
    has_dark = bool(re.search(r'\bdark:[^\s"\'>]+', content))
    has_black = bool(re.search(r'\b(bg-slate-900|bg-slate-800|#0f172a)\b', content))

    status = "✅ PASS"
    issues = []
    if colliding:
        issues.append(f"{len(colliding)} colliding paragraphs")
    if found_broken:
        issues.append(f"Broken Hindi: {found_broken}")
    if has_dark:
        issues.append("Dark theme classes")
    if has_black:
        issues.append("Black background")

    if issues:
        status = "⚠️ ISSUES"
        all_pass = False

    print(f"{status} | {name:<18} | {size:>7} chars | {', '.join(issues) if issues else '100% Clean'}")

if all_pass:
    print("\n🎉 ALL 16 CHAPTERS PASSED AUDIT WITH 100% CLEAN SCORES!")
else:
    print("\n⚠️ SOME CHAPTERS NEED FIXES.")
