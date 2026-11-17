#!/usr/bin/env python3
"""Build perf/index.html: the live city with the performance features switched on
(adaptive resolution, throttled shadows, simpler far cars and people). Test link only."""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
s = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
s = s.replace("<html>", '<html data-perf="1">', 1)
s = s.replace("'state.json?v='", "'../state.json?v='")
s = s.replace("<title>Motoropolis by TorqueBlueprint</title>", "<title>Motoropolis · Performance test</title>", 1)
banner = ('<div style="position:sticky;top:0;z-index:50;background:#2e7d4f;color:#fff;font:800 14px/1.3 sans-serif;'
          'text-align:center;padding:8px 12px;letter-spacing:.05em">⚡ MOTOROPOLIS · PERFORMANCE TEST (same city, lighter engine)</div>')
s = s.replace("<body>", "<body>" + banner, 1)
os.makedirs(os.path.join(ROOT, "perf"), exist_ok=True)
open(os.path.join(ROOT, "perf", "index.html"), "w", encoding="utf-8").write(s)
print("perf/index.html built", len(s))
