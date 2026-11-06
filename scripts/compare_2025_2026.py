import requests
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('.env.local') as f:
    env = dict(line.strip().split('=', 1) for line in f if '=' in line and not line.startswith('#'))

url = env['NEXT_PUBLIC_SUPABASE_URL'].strip('\"\'')
key = env['SUPABASE_SERVICE_ROLE_KEY'].strip('\"\'')
headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

res25 = requests.get(f'{url}/rest/v1/previous_papers?year=eq.2025&limit=1', headers=headers).json()
if res25:
    p25_id = res25[0]['id']
    q25 = requests.get(f'{url}/rest/v1/paper_questions?paper_id=eq.{p25_id}&limit=5&order=question_number.asc', headers=headers).json()
    print('=== 2025 QUESTIONS SAMPLE ===')
    for q in q25:
        print(f"Q.{q['question_number']}:")
        print(repr(q['question_text']))
        print("Opt A:", repr(q['option_a']))
        print("-" * 40)

res26 = requests.get(f'{url}/rest/v1/previous_papers?year=eq.2026&limit=1', headers=headers).json()
if res26:
    p26_id = res26[0]['id']
    q26 = requests.get(f'{url}/rest/v1/paper_questions?paper_id=eq.{p26_id}&limit=5&order=question_number.asc', headers=headers).json()
    print('=== 2026 QUESTIONS SAMPLE ===')
    for q in q26:
        print(f"Q.{q['question_number']}:")
        print(repr(q['question_text']))
        print("Opt A:", repr(q['option_a']))
        print("-" * 40)
