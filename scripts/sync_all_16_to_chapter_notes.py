# -*- coding: utf-8 -*-
"""
Syncs all 16 rebuilt, 100% clean English chapters into src/data/chapter_notes.json
"""

import json
import os

mapping = {
    'english-noun-rules-types-usage': 'scripts/scratch/noun_masterclass_formatted.html',
    'english-pronoun-complete-rules-types': 'scripts/scratch/pronoun_masterclass_formatted.html',
    'english-tenses-rules-structures-usage': 'scripts/scratch/tenses_masterclass_formatted.html',
    'english-adjective-degrees-order-rules': 'scripts/scratch/adjective_masterclass_formatted.html',
    'english-adverb-rules-inversion-usage': 'scripts/scratch/adverb_masterclass_formatted.html',
    'english-articles-a-an-the-rules-omission': 'scripts/scratch/articles_masterclass_formatted.html',
    'english-active-passive-voice-rules-charts': 'scripts/scratch/voice_masterclass_formatted.html',
    'english-question-tags-rules-exceptions': 'scripts/scratch/question_tags_masterclass_formatted.html',
    'english-modals-auxiliaries-rules-usage': 'scripts/scratch/modals_masterclass_formatted.html',
    'english-preposition-rules-fixed-prepositions': 'scripts/scratch/preposition_masterclass_formatted.html',
    'english-120-rules-of-grammar-master-notes': 'scripts/scratch/120_rules_ssczone_formatted.html',
    'english-phrasal-verbs-master-list-examples': 'scripts/scratch/phrasal_ssczone_formatted.html',
    'english-one-word-substitution-compendium': 'scripts/scratch/ows_ssczone_formatted.html',
    'english-idioms-and-phrases-master-list': 'scripts/scratch/idioms_ssczone_formatted.html',
    'english-synonyms-and-antonyms-thesaurus': 'scripts/scratch/syno_anto_ssczone_formatted.html',
    'english-paronyms-homonyms-confusing-words': 'scripts/scratch/paronyms_ssczone_formatted.html',
}

json_path = 'src/data/chapter_notes.json'
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

synced_count = 0
for item in data:
    slug = item.get('slug')
    if slug in mapping:
        file_path = mapping[slug]
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as hf:
                new_content = hf.read()
            old_len = len(item.get('content', ''))
            item['content'] = new_content
            synced_count += 1
            print(f"Synced {slug:<45}: {old_len:>7} -> {len(new_content):>7} chars")
        else:
            print(f"⚠️ Warning: {file_path} does not exist!")

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\nSuccessfully synced {synced_count} of 16 English chapters into {json_path}!")
