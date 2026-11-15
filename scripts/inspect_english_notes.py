import os
import re

ENG_DIR = r"c:\ssczone\public\notes\english"

METADATA_MAP = {
    "adjective_ssczone.pdf": {
        "title": "Adjectives Complete Rules & Error Spotting",
        "hindi_title": "विशेषण (Adjective) के सभी नियम व शॉर्टकट",
        "topic": "Grammar - Adjectives",
        "desc": "Degrees of comparison, order of adjectives, confusing pairs (elder/older, few/little), and frequently asked error-spotting rules."
    },
    "adverb_ssczone.pdf": {
        "title": "Adverbs Rules, Position & Inversion Master Notes",
        "hindi_title": "क्रिया विशेषण (Adverb) के नियम एवं महत्वपूर्ण इनवर्जन",
        "topic": "Grammar - Adverbs",
        "desc": "Adverbs vs Adjectives, Inversion rules (hardly/scarcely/seldom), adverbs of frequency, and top recurring SSC CGL questions."
    },
    "articles_ssczone.pdf": {
        "title": "Articles (A, An, The) & Omission of Articles",
        "hindi_title": "आर्टिकल्स (A, An, The) के उपयोग व अपवाद नियम",
        "topic": "Grammar - Articles",
        "desc": "Definite and indefinite articles usage, special geographical uses of 'The', and critical rules where articles are omitted."
    },
    "idioms_phrases_ssczone.pdf": {
        "title": "High-Frequency Idioms & Phrases with Meanings",
        "hindi_title": "सर्वाधिक पूछे जाने वाले मुहावरे एवं लोकोक्तियाँ (Idioms & Phrases)",
        "topic": "Vocabulary - Idioms",
        "desc": "Most repeated idioms & phrases from 2018-2026 SSC CGL, CHSL, CPO exams with Hindi meanings and contextual examples."
    },
    "modals_notes_ssczone_clean.pdf": {
        "title": "Modals Auxiliaries Complete Concept & Usage",
        "hindi_title": "मोडल ऑक्जिलियरी (Can, Could, May, Might, Should, Must)",
        "topic": "Grammar - Modals",
        "desc": "Expressing ability, probability, obligation, and hypothetical conditions. Rules for semi-modals (used to, dare, need)."
    },
    "noun_ssczone.pdf": {
        "title": "Noun Types, Number & Gender Rules for SSC",
        "hindi_title": "संज्ञा (Noun) के प्रकार, वचन और लिंग के सभी नियम",
        "topic": "Grammar - Noun",
        "desc": "Singular/Plural nouns, uncountable nouns (advice, furniture, luggage), hyphenated nouns, and apostrophe ('s) rules."
    },
    "one word subst_ssczone.pdf": {
        "title": "One Word Substitution Master Compilation",
        "hindi_title": "अनेक शब्दों के लिए एक शब्द (One Word Substitution)",
        "topic": "Vocabulary - OWSS",
        "desc": "Category-wise One Word Substitutions: phobias, manias, places, professions, and governance terms asked in SSC exams."
    },
    "paronyms and homonyms_ssczone.pdf": {
        "title": "Paronyms & Homonyms (Confusing Words Booster)",
        "hindi_title": "समान ध्वनि वाले भ्रमित करने वाले शब्द (Confusing Words)",
        "topic": "Vocabulary - Confusing Words",
        "desc": "High-yield confusing word pairs (affect/effect, compliment/complement, stationary/stationery) to score 100% in Cloze Test & Fillers."
    },
    "phrasal_ssczone.pdf": {
        "title": "Phrasal Verbs with Hindi Meanings & Usage",
        "hindi_title": "महत्वपूर्ण फ्रेजल वर्ब्स (Phrasal Verbs) अर्थ सहित",
        "topic": "Vocabulary - Phrasal Verbs",
        "desc": "Alphabetical compilation of high-frequency phrasal verbs (look into, call off, put up with, break down) frequently tested in SSC."
    },
    "preposition_ssczone.pdf": {
        "title": "Fixed Prepositions & Prepositional Phrases Compendium",
        "hindi_title": "फिक्स्ड प्रीपोजिशन एवं प्रीपोजिशनल फ्रेजेस संपूर्ण संकलन",
        "topic": "Grammar - Prepositions",
        "desc": "Comprehensive compendium of 500+ fixed prepositions, verbs followed by prepositions, and prepositions of time/place/direction."
    },
    "pronoun_ssczone.pdf": {
        "title": "Pronouns Types, Cases & Relative Pronouns Rules",
        "hindi_title": "सर्वनाम (Pronoun) के नियम (Who vs Whom, Each/Every)",
        "topic": "Grammar - Pronoun",
        "desc": "Subjective/Objective cases, Order of persons (231 & 123 rules), Relative Pronouns (Who/Whom/Which/That), and indefinite pronouns."
    },
    "question_tags_ssczone.pdf": {
        "title": "Question Tags 10 Essential Rules & Special Cases",
        "hindi_title": "क्वेश्चन टैग (Question Tags) के 10 अचूक नियम",
        "topic": "Grammar - Question Tags",
        "desc": "Positive statement -> Negative tag rules, Imperative sentences tags, 'Let us' vs 'Let him', and exceptional contraction rules."
    },
    "syno_and_anto_ssczone.pdf": {
        "title": "Synonyms & Antonyms High-Yield Rapid Booster",
        "hindi_title": "पर्यायवाची एवं विलोम शब्द (Synonyms & Antonyms)",
        "topic": "Vocabulary - Syno & Anto",
        "desc": "Root-word based synonyms & antonyms with Mnemonics, frequently repeated across SSC CGL Tier 1 & Tier 2 exam papers."
    },
    "tenses_notes_ssczone_clean.pdf": {
        "title": "Tenses Complete Rules, Structure & Sequence Chart",
        "hindi_title": "काल (Tenses) के संपूर्ण नियम, संरचना एवं चार्ट",
        "topic": "Grammar - Tenses",
        "desc": "Present, Past & Future forms, Conditional clauses (If + had + V3), Stative verbs, and Sequence of Tenses rules."
    },
    "voice_notes_ssczone_clean.pdf": {
        "title": "Active & Passive Voice Transformation Shortcuts",
        "hindi_title": "कर्तृवाच्य एवं कर्मवाच्य (Active & Passive Voice) नियम",
        "topic": "Grammar - Voice",
        "desc": "Formula chart for converting all 8 tenses, Modal verbs, Imperative sentences, and Prepositional verbs from Active to Passive voice."
    }
}

def get_pdf_page_count(filepath):
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
            # Fast count of /Type /Page (standard PDF page marker)
            matches = re.findall(rb'/Type\s*/Page\b', content)
            if matches:
                # Deduplicate /Pages vs /Page
                count = len(matches)
                # If /Type /Pages matches are included
                pages_matches = len(re.findall(rb'/Type\s*/Pages\b', content))
                return max(1, count - pages_matches)
    except Exception:
        pass
    return 12

def format_file_size(size_bytes):
    if size_bytes >= 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    return f"{size_bytes / 1024:.0f} KB"

def main():
    files = sorted(os.listdir(ENG_DIR))
    print(f"Total English PDFs: {len(files)}")
    for fn in files:
        if not fn.endswith(".pdf"): continue
        full = os.path.join(ENG_DIR, fn)
        sz = format_file_size(os.path.getsize(full))
        pages = get_pdf_page_count(full)
        meta = METADATA_MAP.get(fn, {})
        title = meta.get("title", fn)
        print(f"• {fn} | Size: {sz} | Pages: ~{pages} | Title: {title}")

if __name__ == '__main__':
    main()
