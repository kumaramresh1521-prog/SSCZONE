import json

for fname in ['type1_real_explanations.json', 'type2_expl_lines_cache.json', 'type3_expl_lines_cache.json']:
    try:
        with open(fname, 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"{fname}: type={type(data)}, len={len(data)}")
            if isinstance(data, list) and len(data) > 0:
                print(f"  sample: {data[0]}")
            elif isinstance(data, dict):
                k = list(data.keys())[0]
                print(f"  sample key {k}: {str(data[k])[:80]}")
    except Exception as e:
        print(f"Error {fname}: {e}")
