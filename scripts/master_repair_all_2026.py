import os
import glob
import json
import re
import sys
import fitz

sys.stdout.reconfigure(encoding='utf-8')

backup_dir = r'c:\ssczone\src\data\pyq_backup'
f_drive = r'F:\startup  send mail\2026'

paper_mapping = [
    (25, "ssc-cgl-2026-30-september-2026-shift-2", "SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 2).pdf"),
    (26, "ssc-cgl-2026-30-september-2026-shift-3", "SSC CGL 2026 (Held On_ 30 Sep 2026 Shift 3).pdf"),
    (27, "ssc-cgl-2026-1-october-2026-shift-1", "SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 1).pdf"),
    (28, "ssc-cgl-2026-1-october-2026-shift-2", "SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 2).pdf"),
    (29, "ssc-cgl-2026-1-october-2026-shift-3", "SSC CGL 2026 (Held On_ 1 Oct 2026 Shift 3).pdf"),
    (30, "ssc-cgl-2026-5-october-2026-shift-1", "SSC CGL 2026 (Held On_ 5 Oct 2026 Shift 1).pdf"),
    (31, "ssc-cgl-2026-5-october-2026-shift-2", "SSC CGL 2026 (Held On_ 5 Oct 2026 Shift 2).pdf"),
    (32, "ssc-cgl-2026-5-october-2026-shift-3", "SSC CGL 2026 (Held On_ 5 Oct 2026 Shift 3).pdf"),
    (33, "ssc-cgl-2026-6-october-2026-shift-1", "SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 1).pdf"),
    (34, "ssc-cgl-2026-6-october-2026-shift-2", "SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 2).pdf"),
    (35, "ssc-cgl-2026-6-october-2026-shift-3", "SSC CGL 2026 (Held On_ 6 Oct 2026 Shift 3).pdf"),
    (36, "ssc-cgl-2026-7-october-2026-shift-1", "SSC CGL 2026 (Held On_ 7 Oct 2026 Shift 1).pdf"),
    (37, "ssc-cgl-2026-7-october-2026-shift-2", "SSC CGL 2026 (Held On_ 7 Oct 2026 Shift 2).pdf"),
    (38, "ssc-cgl-2026-7-october-2026-shift-3", "SSC CGL 2026 (Held On_ 7 Oct 2026 Shift 3).pdf"),
    (39, "ssc-cgl-2026-8-october-2026-shift-1", "SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 1).pdf"),
    (40, "ssc-cgl-2026-8-october-2026-shift-2", "SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 2).pdf"),
    (41, "ssc-cgl-2026-8-october-2026-shift-3", "SSC CGL 2026 (Held On_ 8 Oct 2026 Shift 3).pdf"),
    (42, "ssc-cgl-2026-9-october-2026-shift-1", "SSC CGL 2026 (Held On_ 9 Oct 2026 Shift 1).pdf"),
    (43, "ssc-cgl-2026-9-october-2026-shift-2", "SSC CGL 2026 (Held On_ 9 Oct 2026 Shift 2).pdf"),
    (44, "ssc-cgl-2026-9-october-2026-shift-3", "SSC CGL 2026 (Held On_ 9 Oct 2026 Shift 3).pdf"),
    (45, "ssc-cgl-2026-10-october-2026-shift-1", "SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 1).pdf"),
    (46, "ssc-cgl-2026-10-october-2026-shift-2", "SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 2).pdf"),
    (47, "ssc-cgl-2026-10-october-2026-shift-3", "SSC CGL 2026 (Held On_ 10 Oct 2026 Shift 3).pdf"),
    (48, "ssc-cgl-2026-12-october-2026-shift-1", "SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 1).pdf"),
    (49, "ssc-cgl-2026-12-october-2026-shift-2", "SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 2).pdf"),
    (50, "ssc-cgl-2026-12-october-2026-shift-3", "SSC CGL 2026 (Held On_ 12 Oct 2026 Shift 3).pdf"),
    (51, "ssc-cgl-2026-13-october-2026-shift-1", "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 1).pdf"),
    (52, "ssc-cgl-2026-13-october-2026-shift-2", "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 2).pdf"),
    (53, "ssc-cgl-2026-13-october-2026-shift-3", "SSC CGL 2026 (Held On_ 13 Oct 2026 Shift 3).pdf"),
]

print("Script template ready.")
