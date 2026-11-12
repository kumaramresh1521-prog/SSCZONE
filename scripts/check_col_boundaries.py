import json

for pno in [32, 33, 34, 35, 36, 37, 38]:
    fname = f'scripts/pdf_samples/t4_robust/q_p{pno}_right.json'
    with open(fname, 'r', encoding='utf-8') as f:
        it = json.load(f)
    xs = [b[0][0][0] for b in it]
    # Print 10th, 33rd, 50th, 66th, 90th percentiles of x
    xs.sort()
    n = len(xs)
    p0 = xs[0]
    p33 = xs[n//3]
    p66 = xs[2*n//3]
    p100 = xs[-1]
    print(f"p{pno}_right: min={p0:.1f}, 33%={p33:.1f}, 66%={p66:.1f}, max={p100:.1f}")
