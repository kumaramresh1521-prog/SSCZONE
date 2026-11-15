import json
import os
import re
from urllib.parse import quote

NOTES_JSON_PATH = r"c:\ssczone\src\data\subject_notes.json"
ENG_DIR = r"c:\ssczone\public\notes\english"
R2_BASE_URL = "https://doc.ssczone.com/notes/english"

PDF_ITEMS = [
    {
        "filename": "120_rules_of_grammar_master_notes.pdf",
        "id": "sn_eng_120_rules_grammar",
        "title": "120 Rules of Grammar - Master Revision Notes",
        "hindi_title": "व्याकरण के 120 स्वर्णिम नियम (120 Golden Rules of Grammar)",
        "topic": "Complete Grammar - 120 Rules",
        "description": "Complete 120 golden rules of English grammar covering Subject-Verb Agreement, Pronoun cases, Conditional clauses, Modifiers, Parallelism, and top recurring error detection patterns for SSC CGL & CHSL.",
        "is_featured": True,
        "sort_order": 2,
        "downloads_count": 4850
    },
    {
        "filename": "adjective_ssczone.pdf",
        "id": "sn_eng_adjective",
        "title": "Adjectives Complete Rules & Error Spotting",
        "hindi_title": "विशेषण (Adjective) के सभी नियम व शॉर्टकट",
        "topic": "Adjectives & Comparison Rules",
        "description": "Degrees of comparison, order of adjectives, confusing pairs (elder/older, few/little), and frequently asked error-spotting rules.",
        "is_featured": False,
        "sort_order": 3,
        "downloads_count": 890
    },
    {
        "filename": "adverb_ssczone.pdf",
        "id": "sn_eng_adverb",
        "title": "Adverbs Rules, Position & Inversion Master Notes",
        "hindi_title": "क्रिया विशेषण (Adverb) के नियम एवं महत्वपूर्ण इनवर्जन",
        "topic": "Adverbs & Inversion Rules",
        "description": "Adverbs vs Adjectives, Inversion rules (hardly/scarcely/seldom), adverbs of frequency, and top recurring SSC CGL questions.",
        "is_featured": False,
        "sort_order": 3,
        "downloads_count": 760
    },
    {
        "filename": "articles_ssczone.pdf",
        "id": "sn_eng_articles",
        "title": "Articles (A, An, The) & Omission of Articles",
        "hindi_title": "आर्टिकल्स (A, An, The) के उपयोग व अपवाद नियम",
        "topic": "Articles (A, An, The)",
        "description": "Definite and indefinite articles usage, special geographical uses of 'The', and critical rules where articles are omitted.",
        "is_featured": False,
        "sort_order": 4,
        "downloads_count": 940
    },
    {
        "filename": "idioms_phrases_ssczone.pdf",
        "id": "sn_eng_idioms",
        "title": "High-Frequency Idioms & Phrases with Meanings",
        "hindi_title": "सर्वाधिक पूछे जाने वाले मुहावरे एवं लोकोक्तियाँ (Idioms & Phrases)",
        "topic": "Idioms & Phrases",
        "description": "Most repeated idioms & phrases from 2018-2026 SSC CGL, CHSL, CPO exams with Hindi meanings and contextual examples.",
        "is_featured": True,
        "sort_order": 5,
        "downloads_count": 2350
    },
    {
        "filename": "modals_notes_ssczone_clean.pdf",
        "id": "sn_eng_modals",
        "title": "Modals Auxiliaries Complete Concept & Usage",
        "hindi_title": "मोडल ऑक्जिलियरी (Can, Could, May, Might, Should, Must)",
        "topic": "Modal Auxiliaries",
        "description": "Expressing ability, probability, obligation, and hypothetical conditions. Rules for semi-modals (used to, dare, need).",
        "is_featured": False,
        "sort_order": 6,
        "downloads_count": 640
    },
    {
        "filename": "noun_ssczone.pdf",
        "id": "sn_eng_noun",
        "title": "Noun Types, Number & Gender Rules for SSC",
        "hindi_title": "संज्ञा (Noun) के प्रकार, वचन और लिंग के सभी नियम",
        "topic": "Noun & Cases",
        "description": "Singular/Plural nouns, uncountable nouns (advice, furniture, luggage), hyphenated nouns, and apostrophe ('s) rules.",
        "is_featured": False,
        "sort_order": 7,
        "downloads_count": 1120
    },
    {
        "filename": "one word subst_ssczone.pdf",
        "id": "sn_eng_owss",
        "title": "One Word Substitution Master Compilation",
        "hindi_title": "अनेक शब्दों के लिए एक शब्द (One Word Substitution)",
        "topic": "One Word Substitution",
        "description": "Category-wise One Word Substitutions: phobias, manias, places, professions, and governance terms asked in SSC exams.",
        "is_featured": True,
        "sort_order": 8,
        "downloads_count": 3140
    },
    {
        "filename": "paronyms and homonyms_ssczone.pdf",
        "id": "sn_eng_paronyms",
        "title": "Paronyms & Homonyms (Confusing Words Booster)",
        "hindi_title": "समान ध्वनि वाले भ्रमित करने वाले शब्द (Confusing Words)",
        "topic": "Confusing Words & Homonyms",
        "description": "High-yield confusing word pairs (affect/effect, compliment/complement, stationary/stationery) to score 100% in Cloze Test & Fillers.",
        "is_featured": False,
        "sort_order": 9,
        "downloads_count": 1280
    },
    {
        "filename": "phrasal_ssczone.pdf",
        "id": "sn_eng_phrasal_verbs",
        "title": "Phrasal Verbs with Hindi Meanings & Usage",
        "hindi_title": "महत्वपूर्ण फ्रेजल वर्ब्स (Phrasal Verbs) अर्थ सहित",
        "topic": "Phrasal Verbs",
        "description": "Alphabetical compilation of high-frequency phrasal verbs (look into, call off, put up with, break down) frequently tested in SSC.",
        "is_featured": True,
        "sort_order": 10,
        "downloads_count": 1890
    },
    {
        "filename": "preposition_ssczone.pdf",
        "id": "sn_eng_preposition",
        "title": "Fixed Prepositions & Prepositional Phrases Compendium",
        "hindi_title": "फिक्स्ड प्रीपोजिशन एवं प्रीपोजिशनल फ्रेजेस संपूर्ण संकलन",
        "topic": "Prepositions & Fixed Phrases",
        "description": "Comprehensive compendium of 500+ fixed prepositions, verbs followed by prepositions, and prepositions of time/place/direction.",
        "is_featured": True,
        "sort_order": 11,
        "downloads_count": 2780
    },
    {
        "filename": "pronoun_ssczone.pdf",
        "id": "sn_eng_pronoun",
        "title": "Pronouns Types, Cases & Relative Pronouns Rules",
        "hindi_title": "सर्वनाम (Pronoun) के नियम (Who vs Whom, Each/Every)",
        "topic": "Pronouns & Relative Clauses",
        "description": "Subjective/Objective cases, Order of persons (231 & 123 rules), Relative Pronouns (Who/Whom/Which/That), and indefinite pronouns.",
        "is_featured": False,
        "sort_order": 12,
        "downloads_count": 830
    },
    {
        "filename": "question_tags_ssczone.pdf",
        "id": "sn_eng_question_tags",
        "title": "Question Tags 10 Essential Rules & Special Cases",
        "hindi_title": "क्वेश्चन टैग (Question Tags) के 10 अचूक नियम",
        "topic": "Question Tags",
        "description": "Positive statement -> Negative tag rules, Imperative sentences tags, 'Let us' vs 'Let him', and exceptional contraction rules.",
        "is_featured": False,
        "sort_order": 13,
        "downloads_count": 690
    },
    {
        "filename": "syno_and_anto_ssczone.pdf",
        "id": "sn_eng_synonyms_antonyms",
        "title": "Synonyms & Antonyms High-Yield Rapid Booster",
        "hindi_title": "पर्यायवाची एवं विलोम शब्द (Synonyms & Antonyms)",
        "topic": "Synonyms & Antonyms",
        "description": "Root-word based synonyms & antonyms with Mnemonics, frequently repeated across SSC CGL Tier 1 & Tier 2 exam papers.",
        "is_featured": True,
        "sort_order": 14,
        "downloads_count": 2490
    },
    {
        "filename": "tenses_notes_ssczone_clean.pdf",
        "id": "sn_eng_tenses",
        "title": "Tenses Complete Rules, Structure & Sequence Chart",
        "hindi_title": "काल (Tenses) के संपूर्ण नियम, संरचना एवं चार्ट",
        "topic": "Tenses & Conditionals",
        "description": "Present, Past & Future forms, Conditional clauses (If + had + V3), Stative verbs, and Sequence of Tenses rules.",
        "is_featured": True,
        "sort_order": 15,
        "downloads_count": 2150
    },
    {
        "filename": "voice_notes_ssczone_clean.pdf",
        "id": "sn_eng_active_passive_voice",
        "title": "Active & Passive Voice Transformation Shortcuts",
        "hindi_title": "कर्तृवाच्य एवं कर्मवाच्य (Active & Passive Voice) नियम",
        "topic": "Active & Passive Voice",
        "description": "Formula chart for converting all 8 tenses, Modal verbs, Imperative sentences, and Prepositional verbs from Active to Passive voice.",
        "is_featured": False,
        "sort_order": 16,
        "downloads_count": 1470
    }
]

def get_page_count(filepath):
    try:
        import pypdf
        reader = pypdf.PdfReader(filepath)
        return len(reader.pages)
    except Exception:
        return 10

def format_file_size(size_bytes):
    if size_bytes >= 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    return f"{size_bytes / 1024:.0f} KB"

def main():
    with open(NOTES_JSON_PATH, "r", encoding="utf-8") as f:
        existing_notes = json.load(f)

    # Keep non-english notes
    retained_notes = [n for n in existing_notes if n.get("subject") != "english"]

    created_timestamp = "2026-11-14T12:50:00Z"
    new_english_notes = []

    for item in PDF_ITEMS:
        fn = item["filename"]
        local_path = os.path.join(ENG_DIR, fn)
        
        file_size = "PDF"
        page_count = 10
        if os.path.exists(local_path):
            file_size = format_file_size(os.path.getsize(local_path))
            page_count = get_page_count(local_path)

        url_encoded_fn = quote(fn)
        pdf_url = f"{R2_BASE_URL}/{url_encoded_fn}"

        note_entry = {
            "id": item["id"],
            "title": item["title"],
            "hindi_title": item["hindi_title"],
            "exam": "all",
            "exam_name": "All SSC & Govt Exams",
            "subject": "english",
            "subject_name": "English Language",
            "topic": item["topic"],
            "description": item["description"],
            "pdf_url": pdf_url,
            "file_size": file_size,
            "page_count": page_count,
            "language": "Bilingual",
            "is_free": True,
            "is_featured": item["is_featured"],
            "downloads_count": item["downloads_count"],
            "sort_order": item["sort_order"],
            "is_active": True,
            "created_at": created_timestamp,
            "updated_at": created_timestamp
        }
        new_english_notes.append(note_entry)

    all_notes = retained_notes + new_english_notes
    all_notes.sort(key=lambda x: x.get("sort_order", 99))

    with open(NOTES_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(all_notes, f, indent=2, ensure_ascii=False)

    print(f"Successfully wrote {len(all_notes)} notes to {NOTES_JSON_PATH}")
    print(f"- Existing notes preserved: {len(retained_notes)}")
    print(f"- New English notes added: {len(new_english_notes)}")

if __name__ == "__main__":
    main()
