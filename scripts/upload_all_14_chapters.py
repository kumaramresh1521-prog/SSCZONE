# -*- coding: utf-8 -*-
"""
Upload all 14 generated English master chapters into:
1. Supabase `blogs` table (via REST API with Service Role Key)
2. `src/data/chapter_notes.json` (as persistent local fallback)
"""

import os
import json
import uuid
import datetime
import urllib.request

CHAPTERS_CONFIG = [
    {
        "slug": "english-noun-rules-types-usage",
        "title": "English Grammar: Noun Rules, Types, Number & Gender (Master Notes)",
        "hindi_title": "संज्ञा (Noun) के संपूर्ण नियम, प्रकार, वचन व महत्वपूर्ण अपवाद",
        "excerpt": "Master SSC English Noun rules: Types of nouns, pluralization rules, uncountable nouns taking singular verb, nouns always plural, hyphenated compound nouns, and 12 solved shift PYQs.",
        "html_file": "scripts/scratch/noun_ssczone_formatted.html",
        "chapter_number": 1,
        "read_time": "18 min read",
        "focus": "Noun Rules for SSC CGL",
        "secondary": "Noun Types, Singular Plural Noun Rules, Nouns Always Plural, SSC English Grammar Notes",
        "keywords": ["Noun Rules for SSC CGL", "संज्ञा के नियम अंग्रेजी", "Singular Plural Noun Rules SSC", "Uncountable Nouns in English Grammar", "Hyphenated Noun Rule", "SSC English Grammar Notes PDF", "Noun Error Spotting Questions", "SSC CGL 2026 English Notes"]
    },
    {
        "slug": "english-adjective-degrees-order-rules",
        "title": "English Grammar: Adjectives & Degrees of Comparison (Master Notes)",
        "hindi_title": "विशेषण (Adjective) के प्रकार, OSASCOMP क्रम व Degrees of Comparison",
        "excerpt": "Complete bilingual notes on Adjectives: Positive, Comparative & Superlative degrees, OSASCOMP order of adjectives, Latin adjectives (senior, junior to), and 6 solved SSC PYQs.",
        "html_file": "scripts/scratch/adjective_ssczone_formatted.html",
        "chapter_number": 2,
        "read_time": "16 min read",
        "focus": "Adjective Rules for SSC CGL",
        "secondary": "Degrees of Comparison, OSASCOMP Order of Adjectives, Latin Adjectives to, SSC English Notes",
        "keywords": ["Adjective Rules for SSC CGL", "विशेषण के नियम अंग्रेजी", "Degrees of Comparison Rules", "OSASCOMP Order of Adjectives", "Senior Junior to Rule", "SSC English Grammar Notes PDF", "Adjective Error Spotting Questions", "SSC CGL 2026 English Notes"]
    },
    {
        "slug": "english-adverb-rules-inversion-usage",
        "title": "English Grammar: Adverbs, Position & Inversion Rules (Master Notes)",
        "hindi_title": "क्रियाविशेषण (Adverb) के नियम, MPT क्रम, Inversion व प्रमुख Traps",
        "excerpt": "Comprehensive guide to Adverbs for SSC: Adverbs of manner, place, time (MPT order), inversion after negative adverbs (hardly, seldom, scarcely), too vs very, and 8 solved PYQs.",
        "html_file": "scripts/scratch/adverb_ssczone_formatted.html",
        "chapter_number": 3,
        "read_time": "16 min read",
        "focus": "Adverb Rules for SSC CGL",
        "secondary": "Adverb of Manner Place Time MPT, Inversion after Negative Adverbs, Seldom Hardly Inversion, Too vs Very Rules",
        "keywords": ["Adverb Rules for SSC CGL", "क्रियाविशेषण के नियम अंग्रेजी", "Inversion in English Grammar SSC", "MPT Order of Adverbs", "Seldom Hardly Scarcely Inversion", "Too vs Very Rules", "SSC English Grammar Notes PDF", "SSC CGL 2026 English Notes"]
    },
    {
        "slug": "english-articles-a-an-the-rules-omission",
        "title": "English Grammar: Articles (A, An, The) & Omission Rules (Master Notes)",
        "hindi_title": "Articles (A, An, The) के संपूर्ण नियम, The के विशिष्ट प्रयोग व Omission Rules",
        "excerpt": "Master Articles for SSC CGL & CHSL: Indefinite (A/An) sound rules, Definite Article (The) special uses with geography/titles, Zero Article (omission rules), and 5 solved shift PYQs.",
        "html_file": "scripts/scratch/articles_ssczone_formatted.html",
        "chapter_number": 4,
        "read_time": "16 min read",
        "focus": "Articles Rules for SSC CGL",
        "secondary": "A An The Rules PDF, Omission of Articles Zero Article, Use of The with Geography, SSC English Articles",
        "keywords": ["Articles Rules for SSC CGL", "उपपद A An The के नियम", "Omission of Articles Rules SSC", "Use of Definite Article The", "A vs An Vowel Sound Rules", "SSC English Grammar Notes PDF", "Articles Error Spotting Questions", "SSC CGL 2026 English Notes"]
    },
    {
        "slug": "english-active-passive-voice-rules-charts",
        "title": "Active & Passive Voice: Rules, Tense Charts & Special Traps (Master Notes)",
        "hindi_title": "वाच्य (Voice): Active से Passive में परिवर्तन के सभी 8 काल, Modals व अपवाद",
        "excerpt": "Complete Active and Passive Voice for SSC CGL & CPO: Tense transformation tables, modals, imperative commands/advice, bare infinitive traps (made to sing), fixed prepositions, and 4 solved PYQs.",
        "html_file": "scripts/scratch/voice_ssczone_formatted.html",
        "chapter_number": 5,
        "read_time": "20 min read",
        "focus": "Active and Passive Voice for SSC CGL",
        "secondary": "Voice Change Rules PDF, Imperative Sentences Passive Voice, To Be Forms Passive, Fixed Prepositions Voice",
        "keywords": ["Active and Passive Voice Rules SSC CGL", "कर्मवाच्य कर्तृवाच्य के नियम", "Voice Transformation Chart PDF", "Imperative Sentences Passive Rules", "Bare Infinitive in Passive Voice", "Fixed Prepositions in Voice", "SSC CGL Tier 2 Voice Questions", "SSC CGL 2026 English Notes"]
    },
    {
        "slug": "english-question-tags-rules-exceptions",
        "title": "Question Tags: Rules, Contraction Tables & 13 Core Traps (Master Notes)",
        "hindi_title": "Question Tags (प्रश्नवाचक पूँछ) के सभी 13 स्वर्णिम नियम, aren't I? व PYQs",
        "excerpt": "Master Question Tags for SSC: 13 golden rules, contracted auxiliaries master table, aren't I? trap, negative adverbs (seldom, barely), indefinite pronouns (everyone -> they), and solved PYQs.",
        "html_file": "scripts/scratch/question_tags_ssczone_formatted.html",
        "chapter_number": 6,
        "read_time": "14 min read",
        "focus": "Question Tags Rules for SSC CGL",
        "secondary": "Question Tags Rules PDF, Aren't I Rule SSC, Negative Words Positive Tag, Indefinite Pronoun They Tag",
        "keywords": ["Question Tags Rules SSC CGL", "प्रश्नवाचक पूँछ के नियम अंग्रेजी", "Contracted Auxiliaries Table", "Aren't I Question Tag Rule", "Negative Adverbs Question Tags", "Everyone Haven't They Rule", "SSC English Grammar Notes PDF", "SSC CGL 2026 English Notes"]
    },
    {
        "slug": "english-modals-auxiliaries-rules-usage",
        "title": "Modal Auxiliaries: Rules, Functions & Perfect Modals (Master Notes)",
        "hindi_title": "मॉडल सहायक क्रियाएँ (Modals) के नियम, Perfect Modals व Semi-Modals",
        "excerpt": "Complete guide to Modals: Can vs Could, May vs Might, Should vs Must vs Ought to, perfect modals (should have, must have + V3), semi-modals (used to, need, dare), and SSC traps.",
        "html_file": "scripts/scratch/modals_ssczone_formatted.html",
        "chapter_number": 7,
        "read_time": "16 min read",
        "focus": "Modals in English Grammar for SSC CGL",
        "secondary": "Modal Auxiliaries Rules PDF, Should Have Must Have V3, Used to vs Be Used to, Need Dare as Modals",
        "keywords": ["Modal Verbs Rules SSC CGL", "मॉडल सहायक क्रियाएँ अंग्रेजी", "Can vs Could May vs Might", "Perfect Modals Should Have V3", "Used to vs Be Used to V1 ing", "Lest Should Rule SSC", "Need Dare Modals Rules", "SSC CGL 2026 English Notes"]
    },
    {
        "slug": "english-preposition-rules-fixed-prepositions",
        "title": "Prepositions & Fixed Prepositions: Complete Rules & A-Z Master Compendium",
        "hindi_title": "पूर्वसर्ग (Prepositions) के नियम, Confusion Pairs व 350+ Fixed Prepositions",
        "excerpt": "Master Prepositions for SSC CGL: Accusative case, confusion pairs (between/among, in/into, beside/besides, by/with), omission traps (discuss, enter, order), and 350+ fixed prepositions A-Z.",
        "html_file": "scripts/scratch/preposition_ssczone_formatted.html",
        "chapter_number": 8,
        "read_time": "25 min read",
        "focus": "Fixed Prepositions for SSC CGL",
        "secondary": "Preposition Rules PDF, Between vs Among Rules, Omission of Preposition Discuss Enter, 350 Fixed Prepositions A to Z",
        "keywords": ["Preposition Rules for SSC CGL", "पूर्वसर्ग के नियम अंग्रेजी", "Fixed Prepositions Master List PDF", "Between vs Among Rules SSC", "Omission of Prepositions Rules", "Cope with not Cope up with", "Dispose of not Dispose off", "SSC CGL 2026 English Notes"]
    },
    {
        "slug": "english-120-rules-of-grammar-master-notes",
        "title": "120 Rules of Grammar: Master Notes (Complete Hindi + English Compendium)",
        "hindi_title": "व्याकरण के 120 स्वर्णिम नियम (120 Rules of Grammar) &bull; संपूर्ण संकलन",
        "excerpt": "The ultimate 120 Rules of English Grammar for SSC CGL, CHSL, CPO & Banking. Complete bilingual rules, common errors, right vs wrong comparison, and expert pro tips.",
        "html_file": "scripts/scratch/120_rules_ssczone_formatted.html",
        "chapter_number": 9,
        "read_time": "35 min read",
        "focus": "120 Rules of Grammar for SSC CGL",
        "secondary": "120 Rules of English Grammar PDF, Subject Verb Agreement 120 Rules, Inversion Rules, Conditionals Rules",
        "keywords": ["120 Rules of Grammar SSC CGL", "व्याकरण के 120 नियम हिंदी में", "120 Rules of English Grammar PDF", "Subject Verb Agreement Rules SSC", "Inversion Rules in Grammar", "Conditional Sentences Rules", "Error Spotting Golden Rules", "SSC CGL 2026 English Notes"]
    },
    {
        "slug": "english-phrasal-verbs-master-list-examples",
        "title": "Phrasal Verbs: 215+ Master List with Meanings & Examples (Master Notes)",
        "hindi_title": "फ्रेजल वर्ब्स (Phrasal Verbs) की 215+ संपूर्ण सूची, अर्थ व SSC उदाहरण",
        "excerpt": "Complete 215+ Phrasal Verbs list for SSC Cloze Test & Error Spotting: Break, Call, Look, Put, Turn clusters with bilingual meanings and authentic exam sentence examples.",
        "html_file": "scripts/scratch/phrasal_ssczone_formatted.html",
        "chapter_number": 10,
        "read_time": "22 min read",
        "focus": "Phrasal Verbs for SSC CGL",
        "secondary": "Phrasal Verbs List PDF, Phrasal Verbs with Meaning in Hindi, Break Down Break Out Phrasal, Put Up With Phrasal",
        "keywords": ["Phrasal Verbs for SSC CGL", "फ्रेजल वर्ब्स हिंदी अर्थ सहित", "Phrasal Verbs Master List PDF", "Break Family Phrasal Verbs", "Put Up With Put Off Phrasal", "Call Off Call On Phrasal", "Cloze Test Phrasal Verbs SSC", "SSC CGL 2026 English Notes"]
    },
    {
        "slug": "english-one-word-substitution-compendium",
        "title": "One Word Substitution: 500+ Words in 13 Categories (Master Compendium)",
        "hindi_title": "अनेक शब्दों के लिए एक शब्द (One Word Substitution) &bull; 500+ शब्द व Root Words",
        "excerpt": "Master 500+ One Word Substitutions in 13 organized categories (Persons, Places, Science, Phobias, Government, Killings) with Root Word formula cards and SSC solved PYQs.",
        "html_file": "scripts/scratch/ows_ssczone_formatted.html",
        "chapter_number": 11,
        "read_time": "30 min read",
        "focus": "One Word Substitution for SSC CGL",
        "secondary": "One Word Substitution PDF, Root Words Cide Phobia Cracy, One Words Denoting Persons Places, SSC OWS List",
        "keywords": ["One Word Substitution SSC CGL", "अनेक शब्दों के लिए एक शब्द अंग्रेजी", "One Word Substitution 500 Words PDF", "Root Words English Grammar", "Killings Cide Words SSC", "Phobias and Manias Words List", "SSC CGL Tier 1 Tier 2 OWS", "SSC CGL 2026 English Notes"]
    },
    {
        "slug": "english-idioms-and-phrases-master-list",
        "title": "Idioms & Phrases: 450+ A-to-Z Master Compendium with Meanings & Examples",
        "hindi_title": "मुहावरे और वाक्यांश (Idioms & Phrases) &bull; 450+ शब्दों की A-to-Z सूची व अर्थ",
        "excerpt": "Comprehensive 450+ Idioms and Phrases for SSC CGL Tier-1 & Tier-2: Thematic clusters (colors, animals, body parts, conflict) with English meaning, Hindi translation and usage.",
        "html_file": "scripts/scratch/idioms_ssczone_formatted.html",
        "chapter_number": 12,
        "read_time": "28 min read",
        "focus": "Idioms and Phrases for SSC CGL",
        "secondary": "Idioms and Phrases PDF, Idioms with Hindi Meaning and Sentences, Most Repeated SSC Idioms, A to Z Idioms",
        "keywords": ["Idioms and Phrases for SSC CGL", "अंग्रेजी मुहावरे हिंदी अर्थ सहित", "Most Repeated SSC Idioms PDF", "Color Idioms Animal Idioms", "At One's Wit's End Meaning", "Bury the Hatchet Meaning", "SSC CGL Tier 1 Tier 2 Idioms", "SSC CGL 2026 English Notes"]
    },
    {
        "slug": "english-synonyms-and-antonyms-thesaurus",
        "title": "Synonyms & Antonyms: 498 Master Keywords & 4,000+ Word Thesaurus",
        "hindi_title": "समानार्थी एवं विलोम शब्द (Synonyms & Antonyms) &bull; 498 मुख्य शब्द व Thesaurus",
        "excerpt": "Master 498 high-yield SSC Keywords with 4,000+ Synonyms and Antonyms in pure Hindi and English. Includes tone analysis, root word clues, and previous year shift questions.",
        "html_file": "scripts/scratch/syno_anto_ssczone_formatted.html",
        "chapter_number": 13,
        "read_time": "35 min read",
        "focus": "Synonyms and Antonyms for SSC CGL",
        "secondary": "Synonyms and Antonyms PDF, SSC Most Repeated Synonyms, Word Power Thesaurus, Antonyms with Hindi Meaning",
        "keywords": ["Synonyms and Antonyms for SSC CGL", "समानार्थी एवं विलोम शब्द अंग्रेजी", "4000 Words Synonyms Antonyms PDF", "SSC CGL Most Repeated Vocab", "Assiduous Diligent Synonym", "Abjure Renounce Adopt Antonym", "SSC Vocabulary Master List", "SSC CGL 2026 English Notes"]
    },
    {
        "slug": "english-paronyms-homonyms-confusing-words",
        "title": "Paronyms & Homonyms: 227 Sets of Confusing Words with Meanings & Usage",
        "hindi_title": "समोच्चरित एवं भ्रामक शब्द (Paronyms & Homonyms) &bull; 227 सेट्स व 490+ शब्द",
        "excerpt": "Master 227 sets of confusing words (Affect/Effect, Compliment/Complement, Stationary/Stationery, Principal/Principle) with nuances, Hindi meanings, and SSC exam examples.",
        "html_file": "scripts/scratch/paronyms_ssczone_formatted.html",
        "chapter_number": 14,
        "read_time": "25 min read",
        "focus": "Paronyms and Homonyms for SSC CGL",
        "secondary": "Confusing Words in English PDF, Affect vs Effect Rules, Compliment vs Complement, Stationary vs Stationery",
        "keywords": ["Paronyms and Homonyms SSC CGL", "समोच्चरित भ्रामक शब्द अंग्रेजी", "Confusing Words in English Grammar", "Affect vs Effect Rules SSC", "Stationary vs Stationery Meaning", "Compliment vs Complement Difference", "SSC CGL 2026 English Notes"]
    }
]

def get_supabase_credentials():
    url, key = None, None
    with open('.env.local', 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
                url = line.split('=', 1)[1].strip().strip('"').strip("'")
            elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
                key = line.split('=', 1)[1].strip().strip('"').strip("'")
    return url, key

def upload_to_supabase(url, key, record):
    endpoint = f"{url}/rest/v1/blogs?on_conflict=slug"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    data_bytes = json.dumps(record).encode('utf-8')
    req = urllib.request.Request(endpoint, data=data_bytes, headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        return resp.status

def main():
    url, key = get_supabase_credentials()
    print(f"Connecting to Supabase: {url}")

    # Load existing local chapter notes
    local_path = "src/data/chapter_notes.json"
    with open(local_path, "r", encoding="utf-8") as f:
        local_notes = json.load(f)

    # Map existing slugs
    local_slug_map = {item['slug']: item for item in local_notes}
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    print(f"\nProcessing {len(CHAPTERS_CONFIG)} chapters...")

    for cfg in CHAPTERS_CONFIG:
        slug = cfg['slug']
        print(f"\n---> Uploading Chapter {cfg['chapter_number']}: {cfg['title']}")
        
        # Read HTML content
        with open(cfg['html_file'], "r", encoding="utf-8") as f:
            content_html = f.read()

        # Build Supabase Keywords JSON object
        keywords_obj = {
            "category": "English Language & Grammar",
            "focus": cfg['focus'],
            "examTag": "SSC CGL / CHSL / CPO 2026",
            "seoScore": 98,
            "secondary": cfg['secondary'],
            "readTime": cfg['read_time'],
            "hindiTitle": cfg['hindi_title']
        }

        # 1. Supabase Record
        supabase_record = {
            "title": cfg['title'],
            "slug": slug,
            "content": content_html,
            "excerpt": cfg['excerpt'],
            "seo_title": f"{cfg['title']} - SSCZone",
            "keywords": json.dumps(keywords_obj, ensure_ascii=False),
            "is_published": True,
            "updated_at": now_iso
        }

        try:
            status = upload_to_supabase(url, key, supabase_record)
            print(f"  [Supabase] Upserted successfully (HTTP {status})")
        except Exception as e:
            print(f"  [Supabase ERROR] {e}")

        # 2. Local JSON Record
        local_entry = {
            "id": slug,
            "slug": slug,
            "title": cfg['title'],
            "hindi_title": cfg['hindi_title'],
            "excerpt": cfg['excerpt'],
            "type": "chapter_notes",
            "subject_id": "english",
            "subject_name": "English",
            "chapter_number": cfg['chapter_number'],
            "chapter_title": cfg['focus'],
            "read_time": cfg['read_time'],
            "sort_order": cfg['chapter_number'],
            "is_active": True,
            "is_featured": True,
            "exam_tag": "SSC CGL / CHSL / CPO 2026",
            "created_at": now_iso,
            "updated_at": now_iso,
            "seo_title": f"{cfg['title']} - SSCZone",
            "seo_description": cfg['excerpt'],
            "keywords": cfg['keywords'],
            "content": content_html
        }
        local_slug_map[slug] = local_entry

    # Save updated local chapter notes
    all_updated = list(local_slug_map.values())
    # Sort: non-english first, then english chapters 1 to 16
    with open(local_path, "w", encoding="utf-8") as f:
        json.dump(all_updated, f, ensure_ascii=False, indent=2)

    print(f"\n[SUCCESS] Local store '{local_path}' updated with {len(all_updated)} total notes!")

if __name__ == "__main__":
    main()
