import re
import json

EXAM_TAGS = {
    range(1, 6): "SSC CGL 1st Sit. 2010",
    range(6, 11): "SSC CGL 2nd Sit. 2010",
    range(11, 17): "SSC CHSL 2013",
    range(17, 21): "SSC CHSL 2015",
    range(21, 25): "SSC CHSL 2015",
    range(25, 30): "SSC Steno. 2016",
    range(30, 32): "SSC CGL 2017, Set-1",
    range(32, 34): "SSC CGL 2017, Set-2",
    range(34, 36): "SSC CGL 2017",
    range(36, 38): "SSC CGL 2017",
    range(38, 40): "SSC CHSL 2017",
    range(40, 45): "SSC Stenographer 2017",
    range(45, 47): "SSC CHSL 2018",
    range(47, 49): "SSC CGL 2018",
    range(49, 51): "SSC Steno 2018",
    range(51, 54): "SSC Steno 2018",
    range(54, 55): "SSC CGL 2019-20",
    range(55, 56): "SSC CGL 2019-20",
    range(56, 57): "SSC CGL 2019-20",
    range(57, 59): "SSC CHSL 2019-20",
    range(59, 61): "SSC CGL 2020-21",
    range(61, 63): "SSC CHSL 2020-21",
    range(63, 64): "SSC MTS 2020-21",
    range(64, 66): "SSC Stenographer 2020-21",
    range(66, 67): "SSC Stenographer 2020-21",
    range(67, 69): "SSC Stenographer 2020-21",
}

def get_exam_tag(q_num):
    for r, tag in EXAM_TAGS.items():
        if q_num in r:
            return tag
    return "SSC Previous Year Exam"

pdf_official_keys = {
    1: 'B', 2: 'D', 3: 'A', 4: 'A', 5: 'B', 6: 'A',
    7: 'A', 8: 'B', 9: 'C', 10: 'D', 11: 'D', 12: 'B',
    13: 'D', 14: 'C', 15: 'A', 16: 'D', 17: 'C', 18: 'B',
    19: 'D', 20: 'C', 21: 'D', 22: 'B', 23: 'B', 24: 'C',
    25: 'C', 26: 'D', 27: 'B', 28: 'A', 29: 'B', 30: 'C',
    31: 'C', 32: 'C', 33: 'B', 34: 'B', 35: 'D', 36: 'C',
    37: 'A', 38: 'B', 39: 'A', 40: 'B', 41: 'B', 42: 'D',
    43: 'C', 44: 'D', 45: 'C', 46: 'D', 47: 'B', 48: 'C',
    49: 'A', 50: 'B', 51: 'A', 52: 'A', 53: 'C', 54: 'A',
    55: 'A', 56: 'B', 57: 'C', 58: 'C', 59: 'B', 60: 'C',
    61: 'A', 62: 'C', 63: 'A', 64: 'A', 65: 'B', 66: 'B',
    67: 'C', 68: 'C'
}

# Book hints from pages 9 and 10 of PDF
PDF_BOOK_HINTS = {
    38: "The sentence begins with 'we are told that its' use of 'its' here indicates that the following fragment should contain something which relates to 'its'. So option 'R' suitably fits here followed by fragments 'Q' and 'P' respectively.",
    39: "'R' should be the first sentence fragment as it contains a subject 'the poor'. Next fragment should be 'P' as it tells what the subject does. 'Q' should be last fragment as it contains 'object' of the sentence. So, sequence 'RPQ' is the right answer.",
    40: "The correct sequence is RPQ. They sat in a heavy flat bottomed boat each holding a long, crooked rod in his hands and eagerly waiting for 'a bite'.",
    41: "The correct sequence is PQR. The boxes were heavy so carrying two of them was a lot of weight to handle.",
    42: "The correct sequence is RQP. A long hallway ran across the back of the upstairs leading to four bedrooms.",
    43: "The correct sequence is QPR. His father laughed softly casting his mind back to the days of his youth when he himself had been an eager player of the same game.",
    44: "The correct sequence is PQR. When they reached the summit, the boys could hear the faint notes of a festival wafted towards them on the soft breeze of the spring night.",
    45: "May I take your order? Yes, first get us some fresh juice and some sandwiches. Sure. Would you like some coffee too? Not now, maybe a little later. (Sequence: BCAD)",
    46: "My grandmother is an active eighty year old. She begins her morning with meditation. Then she does some gardening. Finally before her mid morning nap, she eats a light breakfast. (Sequence: CDAB)",
    47: "BADC. The paragraph begins with 'Arvind bumbled down the interminable corridor, ...followed by 'he would sit ..... followed by 'some days he would imagine ...and remains with 'C'.",
    48: "BDAC. The paragraph opens with the sentence 'Kanyakumari is a coastal town... followed by 'Jutting out into the Laccadive sea, '...followed by 'It is a popular spot... and the 'C' remains the last.",
    54: "C should be the first fragment as it is the introductory sentence, defining 'growth of population'. B should be the second fragment as it is talking about the 'change' which is mentioned in C. D is the extension of B's explanation. And obviously A is the last fragment as it is beginning with concluding word 'however'. Hence, the correct sequence is CBDA.",
    55: "Render. The word 'render' means provide or give (a service, help, etc.). Hence, render is the right fit here. The terms 'contribute' and 'donate' are used for giving some physical thing or help; money. Exert means apply or bring to bear (a force, influence, or quality), which is not correct here contextually.",
    56: "BDCA. B is the opening sentence of paragraph beginning with a problem (a general tendency of human); D should be the next linkage as in B people 'find faults' is given and 'condemn and criticize' is given in D. C is the next fragment as it is expansion of D, also it is beginning with pronoun 'they' which is used for 'people' used in D. and A is the last fragment beginning with concluding word 'however'. Hence, the coherent sequence is BDCA.",
    59: "Option B comes first as it introduces the subject of the story. Option D further elaborates on it. Option number C is a follow up of option D which states that he could not find anyone to take the letter. And C states that he decided to take it himself. Option A comes after C, as it's the action of what he decided in option C.",
    60: "The passage is about Olive tree and option D makes the olive tree its subject and therefore comes first in rearrangement. Option B further narrates the story and thus comes next in rearrangement. Option B states that the snow fell on the trees and Option A further elaborates on this and thus comes after B. While option A had talked about Olive tree's condition after the snow fell on it, option C talks about fig tree's condition and comes after A. The order is DBAC.",
    61: "The passage is story, which begins with the subject's introduction. So option D comes first. B builds up on D's statement. B was talking about the speaker being picked up so A states the description of the man who picked up. And lastly C with the man's description. Thus, the order is DBAC.",
    62: "The passage begins with D which highlights the subject of the passage-vast area. A further talks about the subject, and thus comes next in order. Because A talks about wonderland, C which comes next builds up on that idea by talking about children's world and stating what it is not. Hence, B talks about what the world of children is about and thus comes last and after C. The order is DACB.",
    63: "Stationary means fixed so the opposite of it is moving.",
    64: "Since the first option is talking about 'choices' the second sentence after it which is option c further elaborates on it. And since option c talks about dangers, the next sentence has to be option be which further builds up on that idea. And option D is the last as it has a concluding phrasal word 'therefore'. (Order: ACBD)",
    65: "The order is ABDC. A talks about getting rid of weeds and b further builds up on it by suggesting two ways to do it, D starts with a 'but' indicating a contradiction so it comes second last and then we are left c, which comes last.",
    66: "A comes first as it introduces the subject. C comes next as it follows up the theme stated in A -getting into the car and then thirty minutes ride. B is next as it talks about reaching home. And lastly D which is the only option left. (Order: ACBD)",
    67: "Option A talks about the crisis, while option D talks about crisis management. D talks about the new CEO, B further builds up on his functioning. And c provides a conclusion. (Order: ADBC)",
    68: "The order is ABDC. It begins with the author narrating his arrival to then talking about his motives, to explaining what action he took to carry out his motive. And lastly a contradictory statement."
}

def parse_html():
    with open(r"f:\startup  send mail\2026\ssc_parajumbles_cbt.html", "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()

    q_pattern = re.compile(r'q\(\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*,\s*(\d+)\s*\)', re.DOTALL)
    matches = q_pattern.findall(text)
    
    e_match = re.search(r'const\s+E\s*=\s*\[([\s\S]*?)\];', text)
    expls = re.findall(r'"((?:[^"\\]|\\.)*)"', e_match.group(1)) if e_match else []
    
    idx_to_opt = {0: 'A', 1: 'B', 2: 'C', 3: 'D'}
    
    records = []
    for i, (qtext, qopts, qans) in enumerate(matches):
        q_num = i + 1
        
        # Split options
        if "|" in qopts:
            opts = [x.strip() for x in qopts.split("|")]
        else:
            opts = [x.strip() for x in qopts.split()]
            
        while len(opts) < 4:
            opts.append("-")
            
        ans_idx = int(qans)
        correct_ans = idx_to_opt.get(ans_idx, 'A')
        
        # Cross check with PDF key
        expected = pdf_official_keys.get(q_num)
        assert expected == correct_ans, f"Mismatch at Q{q_num}: expected {expected}, got {correct_ans}"
        
        # Format question text with \n for the Parajumble badge parser
        # Unescape escaped quotes
        clean_text = qtext.replace(r'\"', '"').replace(r"\'", "'")
        
        # Convert // to \n
        formatted_text = "\n".join(part.strip() for part in clean_text.split("//") if part.strip())
        
        # Combine transition explanation (E) with PDF book hint
        e_text = expls[i] if i < len(expls) else ""
        e_text = e_text.replace(r'\"', '"').replace(r"\'", "'")
        
        book_hint = PDF_BOOK_HINTS.get(q_num, "")
        if book_hint:
            full_expl = f"Step-by-step logic:\n{e_text}\n\nGrammar & Sentence Flow:\n{book_hint}"
        else:
            full_expl = f"Step-by-step logic:\n{e_text}"
            
        record = {
            "topic_id": 264,
            "question_text": formatted_text,
            "option_a": opts[0],
            "option_b": opts[1],
            "option_c": opts[2],
            "option_d": opts[3],
            "correct_answer": correct_ans,
            "explanation": full_expl,
            "exam_tag": get_exam_tag(q_num),
            "difficulty": "medium",
            "is_active": True
        }
        records.append(record)
        
    print(f"Successfully processed and cross-checked {len(records)} questions!")
    return records

if __name__ == "__main__":
    records = parse_html()
    with open("scripts/parajumbles_68_prepared.json", "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    print("Saved prepared records to scripts/parajumbles_68_prepared.json")
    
    # Print sample Q1 and Q45
    print("\n=== Sample Q1 ===")
    print("Text:\n" + records[0]["question_text"])
    print("Options:", records[0]["option_a"], "|", records[0]["option_b"], "|", records[0]["option_c"], "|", records[0]["option_d"])
    print("Ans:", records[0]["correct_answer"])
    print("Tag:", records[0]["exam_tag"])
    print("Expl:\n" + records[0]["explanation"])
    
    print("\n=== Sample Q45 ===")
    print("Text:\n" + records[44]["question_text"])
    print("Options:", records[44]["option_a"], "|", records[44]["option_b"], "|", records[44]["option_c"], "|", records[44]["option_d"])
    print("Ans:", records[44]["correct_answer"])
    print("Tag:", records[44]["exam_tag"])
    print("Expl:\n" + records[44]["explanation"])
