import re, html

def render_math_sim(text):
    # This simulates formatRawMathText in MathText.tsx
    tableRegex = r'(?:^[ \t]*\|[^\n]+\|[ \t]*(?:\r?\n|$)){2,}'
    clean = re.sub(tableRegex, '', text).strip()
    
    intentionalBreakRegex = r'\n(?=(?:\d+[\.\)]\s+|[a-dA-D][\.\)]\s+|\([a-zA-Z0-9ivxIVX]+\)\s*|[ivxIVX]+[\.\)]\s+|[-•*]\s+|(?:Statements?|Conclusions?|कथन|निष्कर्ष)\b|[A-Z0-9\s]{2,}:[^:]+::|\d+\s*,\s*\d+\s*,\s*(?:\?|\d+)|!\[|<img|___MD_TABLE_))'
    
    rawParagraphs = re.split(r'\r?\n\s*\r?\n', clean)
    normalizedParagraphs = []
    
    for para in rawParagraphs:
        trimmedPara = para.strip()
        if not trimmedPara:
            continue
        breaks = []
        def save_brk(m):
            breaks.append("")
            return f'___INTENTIONAL_BRK_{len(breaks)-1}___'
        
        withPlaceholders = re.sub(intentionalBreakRegex, save_brk, trimmedPara, flags=re.IGNORECASE)
        joined = re.sub(r'\s*\r?\n\s*', ' ', withPlaceholders)
        escaped = html.escape(joined)
        for idx, _ in enumerate(breaks):
            escaped = escaped.replace(f'___INTENTIONAL_BRK_{idx}___', '<span class="block my-1"></span>')
        normalizedParagraphs.append(escaped)
        
    formatted = '<span class="block my-2"></span>'.join(normalizedParagraphs)
    
    # image replacement
    formatted = re.sub(r'!\[(.*?)\]\(([^\s)]+)\)', r'<span class="my-1.5 block"><img src="\2" /></span>', formatted)
    return formatted

# Test Q1:
q1 = '''Three different positions of the same dice are shown. Find the number on the face opposite the face showing ‘6’.\n![Figure](/images/pyq/2023/ssc-cgl-2023-20-july-2023-shift-1_p1_img1.png)'''
print('=== Q1 ===')
print(render_math_sim(q1))
print()

# Test Q4:
q4 = '''Select the option that is related to the fifth letter-cluster in the same way as the second\nletter-cluster is related to the first letter-cluster and the fourth letter-cluster is related\nto the third letter-cluster.\nRAT : IZG : YUM : BFN :: SIP : ?'''
print('=== Q4 ===')
print(render_math_sim(q4))
print()

# Test Q6:
q6 = '''Select the Venn diagram that best illustrates the relationship between the following\nclasses.\nCricket, Athlete, Sport'''
print('=== Q6 ===')
print(render_math_sim(q6))
print()

# Test Q12:
q12 = '''Select the option that represents the correct order of the given words as they would\nappear in an English dictionary.\n1. Dissolve\n2. Display\n3. Distance\n4. Disturb\n5. Displace\n6. Dispute'''
print('=== Q12 ===')
print(render_math_sim(q12))
print()
