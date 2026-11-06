import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

sample_q1 = '''The Mumbai seminar was 4 days after the
Ahmedabad seminar. The Pune seminar was
1 day before the Mumbai seminar. If the
Ahmedabad seminar was held on 15th July,
when was the Pune seminar?'''

sample_q3 = '''Statement: The Reserve Bank has mandated
that banks shall not process any high-value
interbank transactions through manual
channels beyond business hours, and such
transactions shall only be facilitated via
authorized electronic platforms.
Conclusions:
I. High-value interbank transactions are
permissible outside business hours if routed
through approved digital systems.
II. Manual processing of large interbank
transactions is prohibited entirely,
irrespective of timing.'''

sample_q10 = '''Direction: Study the following information
carefully and answer the questions given
below.
In a soft toy shop, eight boxes are kept in the
form of a stack. The boxes are numbered in
ascending order from 1 to 8 such that the
topmost box is numbered as 1 while the
bottom-most box is numbered as 8. Each box
contains different soft toys – Mickey Mouse,
Dog, Rabbit, Teddy Bear, Whale, Tiger,
Monkey, and Duck. The box of Teddy bear is
kept at the top. There are four boxes between
the box of Teddy bear and the box of Duck.
The box of Monkey is kept between the box
of Rabbit and box number 6. Neither the box
of Dog nor the box of Rabbit is kept at the
bottom. The box of Whale is kept above the
box of Tiger, which is kept above the box of
Rabbit. Which soft toy does box number 2
contain?'''

sample_q7 = '''Read the following statement carefully and
identify the action that follows.
Statement: More young people are addicted
to social media.
Course of Action:
1. Promote awareness about digital wellness.
2. Ban all social media platforms.'''

def unwrap_text(text: str) -> str:
    if not text:
        return ""
    
    # 1. First remove footers like "\n8\n(BASIC KNOWLEDGE)" or "9 (BASIC KNOWLEDGE)"
    text = re.sub(r'\n*\s*\b\d+\s*\n*\s*\(\s*BASIC\s+KNOWLEDGE\s*\)\s*', ' ', text, flags=re.I)
    
    # 2. Split into lines
    lines = text.split('\n')
    output_lines = []
    
    # Structural triggers that SHOULD start on a new line:
    # - Bullet numbers: 1. , 2. , (1), (2), (i), (ii)
    # - Roman numerals: I. , II. , III. , IV.
    # - Section labels: Statement:, Statements:, Conclusion:, Conclusions:, Course of Action:, Directions:, Direction:, Note:, Where:
    # - Markdown headings / separators
    structure_re = re.compile(
        r'^\s*('
        r'(\d+[\.\)])|'
        r'([I|V|X]+[\.\)])|'
        r'(\([a-zA-Z0-9]+\))|'
        r'([A-D][\.\)])|'
        r'(Statement[s]?\s*:)|'
        r'(Conclusion[s]?\s*:)|'
        r'(Course\s+of\s+Action\s*:)|'
        r'(Direction[s]?\s*:)|'
        r'(Note\s*:)|'
        r'(Where\s*:)|'
        r'([-•\*]\s+)|'
        r'(!\[.*?\])|'
        r'(---)'
        r')',
        re.I
    )
    
    current_block = ""
    for line in lines:
        line_str = line.strip()
        if not line_str:
            if current_block:
                output_lines.append(current_block)
                current_block = ""
            continue
            
        if structure_re.match(line_str):
            if current_block:
                output_lines.append(current_block)
            current_block = line_str
        else:
            if current_block:
                # Check if current_block ends with a hyphen (word split across line)
                if current_block.endswith('-') and not current_block.endswith(' -'):
                    current_block = current_block[:-1] + line_str
                else:
                    current_block += " " + line_str
            else:
                current_block = line_str
                
    if current_block:
        output_lines.append(current_block)
        
    return "\n\n".join(output_lines)

print("=== SAMPLE Q1 UNWRAPPED ===")
print(unwrap_text(sample_q1))
print("\n=== SAMPLE Q3 UNWRAPPED ===")
print(unwrap_text(sample_q3))
print("\n=== SAMPLE Q7 UNWRAPPED ===")
print(unwrap_text(sample_q7))
print("\n=== SAMPLE Q10 UNWRAPPED ===")
print(unwrap_text(sample_q10))
