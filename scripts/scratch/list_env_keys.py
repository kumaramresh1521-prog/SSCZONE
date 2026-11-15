from pathlib import Path

env_path = Path("c:/ssczone/.env.local")
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        key = line.split("=")[0].strip()
        print(f"Env key found: {key}")
