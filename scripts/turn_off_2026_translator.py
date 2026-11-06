import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

settings_path = r"c:\ssczone\src\data\paper_settings.json"

with open(settings_path, "r", encoding="utf-8") as f:
    settings = json.load(f)

# Update all 2026 papers (IDs 25 to 53) to have allow_translation = False
for pid in range(25, 54):
    key = str(pid)
    if key not in settings:
        settings[key] = {}
    settings[key]["allow_translation"] = False

with open(settings_path, "w", encoding="utf-8") as f:
    json.dump(settings, f, indent=2)

print("Successfully set allow_translation=False for all 2026 papers (IDs 25 to 53) in paper_settings.json!")
print(f"Total entries in paper_settings.json: {len(settings)}")
for pid in range(25, 54):
    print(f"  Paper {pid}: {settings[str(pid)]}")
