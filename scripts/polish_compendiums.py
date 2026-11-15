# -*- coding: utf-8 -*-
import os
import re

fixes = [
    (r'पि्रय\s*व्यकि्त', 'प्रिय व्यक्ति'),
    (r'व्यकि्त', 'व्यक्ति'),
    (r'पि्रय', 'प्रिय'),
    (r'लोकपि्रयता', 'लोकप्रियता'),
    (r'स्वेा\s*से\s*गी', 'स्वेच्छा से गद्दी'),
    (r'स्वेा', 'स्वेच्छा'),
    (r'बतनि\s*धोने\s*का\s*ान', 'बर्तन धोने का स्थान'),
    (r'अनुयायिय\s*का', 'अनुयायियों का'),
    (r'क\s*मृत्यु', 'की मृत्यु'),
    (r'One\s*Word\s*Substitution', ''),
    (r'\bमलना\b', 'मिलना'),
    (r'\bकया\b', 'किया'),
    (r'\bलए\b', 'लिए'),
    (r'\bचा हए\b', 'चाहिए'),
    (r'\bचाहए\b', 'चाहिए'),
    (r'\bअधक\b', 'अधिक'),
    (r'\bनहैं\b', 'नहीं'),
    (r'\bमुल\b', 'मुश्किल'),
    (r'\bसहासन\b', 'सिंहासन'),
]

files = [
    'scripts/scratch/120_rules_ssczone_formatted.html',
    'scripts/scratch/phrasal_ssczone_formatted.html',
    'scripts/scratch/idioms_ssczone_formatted.html',
    'scripts/scratch/ows_ssczone_formatted.html',
    'scripts/scratch/syno_anto_ssczone_formatted.html',
    'scripts/scratch/paronyms_ssczone_formatted.html',
]

for fp in files:
    if os.path.exists(fp):
        with open(fp, 'r', encoding='utf-8') as f:
            content = f.read()

        orig_len = len(content)
        for pattern, repl in fixes:
            content = re.sub(pattern, repl, content)

        # Clean multiple spaces inside text
        content = re.sub(r'[ ]{2,}', ' ', content)

        with open(fp, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"Polished {fp} (len: {orig_len} -> {len(content)})")

print("All 6 compendiums polished successfully.")
