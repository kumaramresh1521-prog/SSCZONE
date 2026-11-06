import fitz
import json
import re
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

def unwrap_question_text(text: str) -> str:
    if not text:
        return ""
        
    # 1. Clean out page footers like "8\n(BASIC KNOWLEDGE)" or "\n8\n(BASIC KNOWLEDGE)"
    text = re.sub(r'\n*\s*\b\d{1,2}\s*\n*\s*\(\s*BASIC\s+KNOWLEDGE\s*\)\s*', ' ', text, flags=re.I)
    text = re.sub(r'\(\s*BASIC\s+KNOWLEDGE\s*\)', ' ', text, flags=re.I)
    
    # 2. If already contains markdown divider "---", separate sections
    sections = text.split('\n---\n')
    processed_sections = []
    
    for sec in sections:
        lines = sec.split('\n')
        output_blocks = []
        
        # Regex to detect lines that MUST start a new block
        structure_re = re.compile(
            r'^\s*('
            r'(\d+[\.\)])|'
            r'([I|V|X]+[\.\)])|'
            r'(\([a-zA-Z0-9]+\))|'
            r'(Statement[s]?\s*:)|'
            r'(Conclusion[s]?\s*:)|'
            r'(Course\s+of\s+Action\s*:)|'
            r'(Direction[s]?\s*:)|'
            r'(Note\s*:)|'
            r'(Where\s*:)|'
            r'([-•\*]\s+)|'
            r'(!\[.*?\])|'
            r'(\*\*[^*]+\*\*)'
            r')',
            re.I
        )
        
        current_block = ""
        for line in lines:
            line_str = line.strip()
            if not line_str:
                if current_block:
                    output_blocks.append(current_block)
                    current_block = ""
                continue
                
            if structure_re.match(line_str):
                if current_block:
                    output_blocks.append(current_block)
                current_block = line_str
            else:
                if current_block:
                    # Hyphenated word break from PDF
                    if current_block.endswith('-') and not current_block.endswith(' -'):
                        current_block = current_block[:-1] + line_str
                    else:
                        current_block += " " + line_str
                else:
                    current_block = line_str
                    
        if current_block:
            output_blocks.append(current_block)
            
        processed_sections.append("\n\n".join(output_blocks))
        
    return "\n\n---\n\n".join(processed_sections)

def clean_option_text(val: str) -> str:
    if not val:
        return ""
    val = val.strip()
    
    # 1. Strip section names
    val = re.sub(r'\s*\b(QUANTITATIVE\s+APTITUDE|ENGLISH\s+LANGUAGE|GENERAL\s+AWARENESS|GENERAL\s+INTELLIGENCE(\s+(&|AND)\s+REASONING)?)\s*$', '', val, flags=re.I)
    val = re.sub(r'\s*\b\d{1,2}\s*\(\s*BASIC\s+KNOWLEDGE\s*\)\s*$', '', val, flags=re.I)
    val = re.sub(r'\s*\(\s*BASIC\s+KNOWLEDGE\s*\)\s*$', '', val, flags=re.I)
    
    # 2. Strip stray trailing page number (e.g. "Mango 2", "Weak 5", "Common 10", "wrack, wrack 9")
    # Do NOT strip if it's "Only 1", "Both 1 and 2", "Article 368", "1, 2, 3, 4", "Rule 14", "Option 2"
    protected_pattern = re.compile(r'^(Only|Both|Neither|Option|Rule|Article|Schedule|Clause|Section|Part|Table|Case|No|Figure|Fig|Step)\b|\b(and|or|,)\s+\d+$|^\d+$|^[\d\s,]+$', re.I)
    
    if not protected_pattern.search(val):
        # Match trailing space followed by 1 or 2 digits
        m = re.search(r'\s+(\d{1,2})$', val)
        if m:
            page_num = int(m.group(1))
            if 1 <= page_num <= 25:
                val = val[:m.start()].strip()
                
    return val.strip()

# Test with Paper 1
with open(r"c:\ssczone\src\data\pyq_backup\ssc-cgl-2026-1-october-2026-shift-1.json", "r", encoding="utf-8") as f:
    qs = json.load(f)

print("--- TESTING Q.75, Q.76, Q.50 on Paper 1 ---")
q75 = qs[74]
q76 = qs[75]
q50 = qs[49]

print("BEFORE Q.50 Opt D:", repr(q50['option_d']))
print("AFTER Q.50 Opt D :", repr(clean_option_text(q50['option_d'])))

print("\nBEFORE Q.75 Opt D:", repr(q75['option_d'][:100]))
print("AFTER Q.75 Opt D :", repr(clean_option_text("2d : r")))

print("\nBEFORE Q.76 Text:\n", q76['question_text'])
print("\nAFTER Q.76 Text (Unwrapped):\n", unwrap_question_text(q76['question_text']))
