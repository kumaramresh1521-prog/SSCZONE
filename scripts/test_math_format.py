import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

sample_math = [
    "If a2 + b2 = 89 and ab = 20, find the value of |a - b|.",
    "If tan 𝞱= √3, then find the value of cosec2𝞱+sec2 𝞱. cosec2𝞱−sec2 𝞱 Do it.",
    "What is the value of 8 cos2 30∘+4 sin2 45∘−3cosec260∘ ? 2 tan2 60∘−6cosec 30∘",
    "Evaluate: sin2 25∘+ sin2 65∘",
    "If a + b = 22 and ab = 85, evaluate a2 + b2.",
    "The base of a right prism is a triangle with sides 5 cm, 12 cm, and 13 cm. Base area is 30 cm2 and volume is 300 cm3.",
    "If 64x2 + kxy + 81y2 is a perfect square, find k."
]

def format_math_equations(text: str) -> str:
    if not text:
        return ""
        
    # Replace non-standard theta
    text = text.replace("𝞱", "θ").replace("𝜽", "θ").replace("𝛉", "θ")
    
    # Replace ring operator degree with standard degree
    text = text.replace("∘", "°")
    
    # Fix units: cm2 -> cm², cm3 -> cm³, m2 -> m², m3 -> m³, km2 -> km²
    text = re.sub(r'\b(cm|m|km|mm)2\b', r'\1²', text)
    text = re.sub(r'\b(cm|m|km|mm)3\b', r'\1³', text)
    
    # Fix trigonometric squares: sin2 -> sin², cos2 -> cos², tan2 -> tan², sec2 -> sec², cosec2 -> cosec², cot2 -> cot²
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot)2\s*', r'\1² ', text)
    text = re.sub(r'\b(sin|cos|tan|sec|cosec|cot)3\s*', r'\1³ ', text)
    
    # Fix algebraic squares: a2 -> a², b2 -> b², x2 -> x², y2 -> y², z2 -> z², r2 -> r²
    text = re.sub(r'\b([a-zA-Z])2\b', r'\1²', text)
    text = re.sub(r'\b([a-zA-Z])3\b', r'\1³', text)
    
    # Fix cases like 64x2 -> 64x², 81y2 -> 81y²
    text = re.sub(r'(\d+)([a-zA-Z])2\b', r'\1\2²', text)
    text = re.sub(r'(\d+)([a-zA-Z])3\b', r'\1\2³', text)
    
    # Remove raw DIAGRAM_OR_GEOMETRIC tag
    text = re.sub(r'\s*DIAGRAM_OR_GEOMETRIC\s*', ' ', text)
    
    # Clean redundant (A) (B) (C) (D) list from question text
    text = re.sub(r'\s*\(A\)\s*\(B\)\s*\(C\)\s*\(D\)\s*', ' ', text)
    
    return text.strip()

for s in sample_math:
    print("BEFORE:\n ", s)
    print("AFTER :\n ", format_math_equations(s))
    print("-" * 50)
