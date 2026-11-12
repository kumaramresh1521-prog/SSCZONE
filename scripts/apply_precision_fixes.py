import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('reasoning_analogy_155_verified.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

for q in questions:
    num = q['question_number']
    
    # Q10
    if num == 10:
        q['explanation'] = "'Water' is contained in 'Ocean'. Likewise 'Sand' is contained in 'Desert'."
        
    # Q16
    if num == 16:
        q['question_text'] = "'Skirmish' is related to 'War' in the same way as 'Disease' is related to"
        
    # Q18
    if num == 18:
        q['question_text'] = "'Good' is related to 'Bad' in the same way as 'Roof' is related to"
        
    # Q20
    if num == 20:
        q['question_text'] = "'Umpire' is related to 'Match' in the same way as 'Judge' is related to"
        
    # Q22
    if num == 22:
        q['question_text'] = "'Needle' is related to 'Thread' in the same way as 'Pen' is related to"
        
    # Q72
    if num == 72:
        q['explanation'] = "As with every 'Right' comes a 'Duty', similarly 'Power' invites 'Liability'."
        
    # Q90
    if num == 90:
        q['explanation'] = "Relation: Noun : Opposite adjective. 'Infallible' means never committing 'Error', similarly 'Impeccable' means having no 'Flaw'."
        
    # Q96: Restore exact book options and answer
    if num == 96:
        q['question_text'] = 'A : Transaction :: Language : B'
        q['option_a'] = 'A. Agreement, B. Communication'
        q['option_b'] = 'A. Business, B. Media'
        q['option_c'] = 'A. Money, B. Conversation'
        q['option_d'] = 'A. Contract, B. Scholar'
        q['correct_answer'] = 'C'
        q['explanation'] = "First is required for the second: 'Money' (A) is required for 'Transaction', and 'Language' is required for 'Conversation' (B). Hence, option (c)."
        
    # Q97: Restore exact book options and answer
    if num == 97:
        q['question_text'] = 'A : Inert :: Active : B'
        q['option_a'] = 'A. Statics, B. Gymnast'
        q['option_b'] = 'A. Helium, B. Participation'
        q['option_c'] = 'A. Air, B. Smart'
        q['option_d'] = 'A. Static, B. Dynamic'
        q['correct_answer'] = 'D'
        q['explanation'] = "The words in each pair are synonyms: 'Static' (A) is synonymous with 'Inert', and 'Active' is synonymous with 'Dynamic' (B). Hence, option (d)."

    # Q103
    if num == 103:
        q['question_text'] = "If 'Asinine' is for 'Donkey', then"
        q['option_a'] = "'Vulpine' is for 'Fox'"
        q['option_b'] = "'Vulpine' is for 'Vulture'"
        q['option_c'] = "'Avian' is for 'Cow'"
        q['option_d'] = "'Avian' is for 'Dove'"
        q['explanation'] = "'Asinine' means foolish or like a donkey; similarly, 'Vulpine' means cunning or resembling a fox. ('Avian' refers to birds in general, not specifically doves or cows)."

    # Q134
    if num == 134:
        q['explanation'] = "'River' flows to meet the 'Ocean', in the same way 'Lane' goes on to meet the 'Road'."
        
    # Q140
    if num == 140:
        q['question_text'] = "'Carnivorous' is related to 'Panther' in the same way as 'Herbivorous' is related to"

with open('reasoning_analogy_155_verified.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("Applied precision fixes successfully!")
