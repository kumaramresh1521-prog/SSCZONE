# -*- coding: utf-8 -*-
"""
Inserts Pronoun and Tenses chapters into src/data/chapter_notes.json
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from generate_pronoun_chapter import (
    build_pronoun_content,
    extract_pure_english as extract_pronoun_en,
    extract_pure_hindi as extract_pronoun_hi
)
from generate_tenses_chapter import (
    build_tenses_content,
    extract_pure_english as extract_tenses_en,
    extract_pure_hindi as extract_tenses_hi
)

NOTES_JSON_PATH = r"c:\ssczone\src\data\chapter_notes.json"

def main():
    with open(NOTES_JSON_PATH, "r", encoding="utf-8") as f:
        notes = json.load(f)

    # 1. Build Pronoun Chapter
    p_content = build_pronoun_content()
    p_en = extract_pronoun_en(p_content)
    p_hi = extract_pronoun_hi(p_content)

    pronoun_note = {
        "id": "cn_eng_01",
        "slug": "english-pronoun-complete-rules-types",
        "title": "Pronoun: Types, Rules & Error Spotting Guide",
        "hindi_title": "सर्वनाम (Pronoun): संपूर्ण प्रकार, 17 स्वर्णिम नियम एवं उदाहरण",
        "excerpt": "Comprehensive bilingual guide to Pronouns covering all 8 types (Personal, Relative, Reflexive, Distributive, etc.), 17 golden exam rules (231/123 order, reflexive verbs, who vs whom, both, neither) and 15 interactive MCQs for SSC CGL, CHSL & CPO.",
        "type": "chapter_note",
        "subject_id": "english",
        "subject_name": "English Comprehension (अंग्रेजी भाषा)",
        "chapter_number": 1,
        "chapter_title": "Pronoun (सर्वनाम)",
        "read_time": "12 min read",
        "sort_order": 1,
        "is_active": True,
        "is_featured": True,
        "exam_tag": "",
        "created_at": "2026-11-14T14:00:00Z",
        "updated_at": "2026-11-14T14:00:00Z",
        "seo_title": "Pronoun Rules for SSC CGL PDF: Types, 17 Golden Rules & Practice MCQs - SSCZone",
        "seo_description": "Master English Pronouns for SSC CGL 2026. Complete bilingual guide covering 8 types, Personal Pronoun cases, 17 golden rules with correct/incorrect examples, and 15 interactive practice MCQs.",
        "keywords": [
            "Pronoun Rules for SSC CGL",
            "सर्वनाम के नियम अंग्रेजी",
            "Personal Pronouns Cases Table",
            "Who vs Whom Rules SSC",
            "Order of Pronouns 231 and 123",
            "Reflexive Pronoun Rules",
            "SSC English Grammar Notes PDF",
            "Pronoun Error Spotting Questions",
            "SSC CGL 2026 English Notes"
        ],
        "content": p_content,
        "english_content": p_en,
        "hindi_content": p_hi
    }

    # 2. Build Tenses Chapter
    t_content = build_tenses_content()
    t_en = extract_tenses_en(t_content)
    t_hi = extract_tenses_hi(t_content)

    tenses_note = {
        "id": "cn_eng_02",
        "slug": "english-tenses-rules-structures-usage",
        "title": "Tenses: Complete Structures, Rules & Sequence of Tenses",
        "hindi_title": "काल (Tenses): संपूर्ण 12 काल, संरचना, नियम एवं उदाहरण",
        "excerpt": "Master all 12 Tenses with comprehensive bilingual explanations, formula charts, stative verbs list, past of past rules, point of time vs period of time (since vs for), and 15 interactive MCQs for SSC CGL, CHSL, CPO & CDS.",
        "type": "chapter_note",
        "subject_id": "english",
        "subject_name": "English Comprehension (अंग्रेजी भाषा)",
        "chapter_number": 2,
        "chapter_title": "Tenses (काल)",
        "read_time": "15 min read",
        "sort_order": 2,
        "is_active": True,
        "is_featured": True,
        "exam_tag": "",
        "created_at": "2026-11-14T14:05:00Z",
        "updated_at": "2026-11-14T14:05:00Z",
        "seo_title": "Tenses Rules for SSC CGL PDF: 12 Tenses Formula Chart, Stative Verbs & MCQs - SSCZone",
        "seo_description": "Complete bilingual guide to English Tenses for SSC CGL 2026. Structures of 12 tenses, Stative verbs vs Progressive verbs, Since vs For, Sequence of Tenses rules, and 15 interactive MCQs.",
        "keywords": [
            "Tenses Rules for SSC CGL",
            "काल के नियम अंग्रेजी",
            "12 Tenses Formula Chart PDF",
            "Stative Verbs in English Grammar",
            "Since vs For Rules SSC",
            "Past Perfect Past of Past Rule",
            "Present Perfect vs Simple Past",
            "SSC English Grammar Tenses MCQs",
            "SSC CGL 2026 English Notes"
        ],
        "content": t_content,
        "english_content": t_en,
        "hindi_content": t_hi
    }

    # Filter out if any old english notes exist with these ids/slugs
    filtered_notes = [n for n in notes if n.get("id") not in ("cn_eng_01", "cn_eng_02") and n.get("slug") not in ("english-pronoun-complete-rules-types", "english-tenses-rules-structures-usage")]

    filtered_notes.append(pronoun_note)
    filtered_notes.append(tenses_note)

    with open(NOTES_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(filtered_notes, f, indent=2, ensure_ascii=False)

    print(f"Successfully updated {NOTES_JSON_PATH}!")
    print(f"Total notes in library: {len(filtered_notes)}")
    print("Added:")
    print("  1. cn_eng_01: Pronoun (Types, 17 Rules, 15 MCQs)")
    print("  2. cn_eng_02: Tenses (12 Tenses, Stative Verbs, 15 MCQs)")

if __name__ == "__main__":
    main()
