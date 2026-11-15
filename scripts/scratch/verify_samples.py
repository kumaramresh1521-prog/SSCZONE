import sys
sys.path.insert(0, 'c:/ssczone/scripts')
from supabase_env import get_supabase_credentials
import urllib.request, json

u, k = get_supabase_credentials()

def inspect_paper(paper_id, sample_q_nums):
    q_str = ','.join(str(n) for n in sample_q_nums)
    req = urllib.request.Request(
        f'{u}/rest/v1/paper_questions?paper_id=eq.{paper_id}&question_number=in.({q_str})&select=question_number,question_text,option_a,option_b,correct_answer',
        headers={'apikey': k, 'Authorization': f'Bearer {k}'}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())
    
    print(f"\n================ PAPER {paper_id} SAMPLES ================")
    for q in sorted(data, key=lambda x: x['question_number']):
        print(f"\n--- Q.{q['question_number']} [Ans: {q['correct_answer']}] ---")
        lines = (q['question_text'] or '').split('\n')
        print(f"Total lines: {len(lines)}")
        print("Text:")
        print(q['question_text'])
        print(f"Option A: {q['option_a'][:60]}")

if __name__ == '__main__':
    # Inspect samples across different 2023 papers
    inspect_paper(95, [4, 8, 26, 46])
    inspect_paper(120, [3, 15, 30, 52])
    inspect_paper(130, [5, 12, 40, 75])
