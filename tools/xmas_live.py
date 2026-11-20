#!/usr/bin/env python3
"""Turn the Christmas city on (or off) for the LIVE main city.

  python3 tools/xmas_live.py on    # main city becomes Christmas
  python3 tools/xmas_live.py off   # back to the normal city

With Christmas live, /xmas/ keeps working but loses its "test version" banner.
After running it, rebuild every page, commit and push.
"""
import os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
mode = (sys.argv[1] if len(sys.argv) > 1 else "on").lower()
assert mode in ("on", "off"), "use: xmas_live.py on|off"

p = os.path.join(ROOT, "index.html")
s = open(p, encoding="utf-8").read()
head = s[:200]

if mode == "on":
    if 'data-xmas="1"' not in head:
        assert s.count("<html>", 0, 200) == 1, "unexpected <html> tag"
        s = s.replace("<html>", '<html data-xmas="1">', 1)
else:
    s = s.replace('<html data-xmas="1">', "<html>", 1)

open(p, "w", encoding="utf-8").write(s)
print("main city christmas:", mode)

# /xmas/ only carries the test banner while the main city is NOT christmas
bx = os.path.join(ROOT, "tools", "build_xmas.py")
b = open(bx, encoding="utf-8").read()
b = re.sub(r'(BANNER_ON\s*=\s*)(True|False)', r'\g<1>' + ("False" if mode == "on" else "True"), b)
open(bx, "w", encoding="utf-8").write(b)
