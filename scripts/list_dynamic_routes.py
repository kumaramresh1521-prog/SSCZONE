import os

param_dirs = []
for root, dirs, files in os.walk('src/app'):
    for d in dirs:
        if d.startswith('[') and d.endswith(']'):
            rel = os.path.relpath(os.path.join(root, d), 'src/app')
            param_dirs.append(rel)

print(f"Total dynamic route folders in src/app: {len(param_dirs)}")
for p in sorted(param_dirs):
    print(p)
