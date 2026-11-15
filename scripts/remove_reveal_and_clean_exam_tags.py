import json
import re

def clean_notes():
    with open('src/data/chapter_notes.json', 'r', encoding='utf-8') as f:
        notes = json.load(f)

    # Regex to remove <details class="quiz-reveal">.*?</details>
    details_pattern = re.compile(r'\s*<details class="quiz-reveal">.*?</details>', re.DOTALL)
    
    # Also remove "Tap Answer to check" paragraphs
    tap_pattern_en = re.compile(r'<p class="sub">Tap "Answer" to check\.</p>\s*', re.IGNORECASE)
    tap_pattern_hi = re.compile(r'<p class="sub">उत्तर देखने के लिए "उत्तर" पर टैप करें।</p>\s*', re.IGNORECASE)
    tap_pattern_bi = re.compile(r'<p class="sub">\s*<span class="lang-en">Tap "Answer" to check\.</span>\s*<span class="lang-hi">उत्तर देखने के लिए "उत्तर" पर टैप करें।</span>\s*</p>\s*', re.IGNORECASE)

    for note in notes:
        # Clear exam_tag
        note["exam_tag"] = ""

        # Clean content
        if "content" in note and note["content"]:
            note["content"] = details_pattern.sub('', note["content"])
            note["content"] = tap_pattern_bi.sub('', note["content"])
            note["content"] = tap_pattern_en.sub('', note["content"])
            note["content"] = tap_pattern_hi.sub('', note["content"])

        # Clean english_content
        if "english_content" in note and note["english_content"]:
            note["english_content"] = details_pattern.sub('', note["english_content"])
            note["english_content"] = tap_pattern_en.sub('', note["english_content"])

        # Clean hindi_content
        if "hindi_content" in note and note["hindi_content"]:
            note["hindi_content"] = details_pattern.sub('', note["hindi_content"])
            note["hindi_content"] = tap_pattern_hi.sub('', note["hindi_content"])

    with open('src/data/chapter_notes.json', 'w', encoding='utf-8') as f:
        json.dump(notes, f, ensure_ascii=False, indent=2)

    print("SUCCESS: Cleaned <details class='quiz-reveal'> and exam_tag from all notes in chapter_notes.json!")

if __name__ == '__main__':
    clean_notes()
