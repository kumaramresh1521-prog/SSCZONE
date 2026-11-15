import re

def enrich_quizzes():
    script_path = "scripts/rebuild_pure_bilingual_cell_note.py"
    with open(script_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find each quiz card block
    # Pattern: <!-- MCQ (\d+) -->\s*<div class="quiz-card">.*?</div>\s*</div> (or similar)
    card_pattern = re.compile(r'(<div class="quiz-card">.*?</div>\s*</details>\s*</div>)', re.DOTALL)

    def process_card(match):
        card_html = match.group(1)
        # Extract correct answer letter
        ans_match = re.search(r'Correct Answer:\s*([A-D])', card_html)
        if not ans_match:
            print("Warning: no answer found in a card!")
            return card_html
        
        correct_letter = ans_match.group(1).upper()

        # Replace each <div class="quiz-option">
        def replace_opt(opt_match):
            key = opt_match.group(1).upper()
            is_corr = "true" if key == correct_letter else "false"
            return f'<div class="quiz-option" data-opt="{key}" data-is-correct="{is_corr}"><span class="quiz-option-key">{key}</span>'

        opt_pattern = re.compile(r'<div class="quiz-option">\s*<span class="quiz-option-key">([A-D])</span>')
        updated_card = opt_pattern.sub(replace_opt, card_html)
        return updated_card

    new_content = card_pattern.sub(process_card, content)

    with open(script_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("Successfully enriched rebuild_pure_bilingual_cell_note.py with data-opt and data-is-correct!")

if __name__ == "__main__":
    enrich_quizzes()
