#!/usr/bin/env python3
"""Build world/index.html: the SimCity-style test world (river, bridges, districts,
new unlocks). Preview any size with ?subs=N (only on this page, nothing is saved)."""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
s = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
s = s.replace("<html>", '<html data-world="1">', 1) if "<html>" in s else s.replace("<html ", '<html data-world="1" ', 1)
s = s.replace("'state.json?v='", "'../state.json?v='")
s = s.replace("<title>Motoropolis by TorqueBlueprint</title>", "<title>Motoropolis · World test</title>", 1)
banner = ('<div style="position:sticky;top:0;z-index:50;background:#2f6fd9;color:#fff;font:800 14px/1.3 sans-serif;'
          'text-align:center;padding:8px 12px;letter-spacing:.05em">MOTOROPOLIS WORLD · TEST VERSION (not the live city) · '
          'preview: <a style="color:#ffd34d" href="?subs=150">150</a> · <a style="color:#ffd34d" href="?subs=700">700</a> · '
          '<a style="color:#ffd34d" href="?subs=2500">2,500</a> · <a style="color:#ffd34d" href="?subs=10000">10,000</a> · '
          '<a style="color:#ffd34d" href="./">real subs</a></div>')
s = s.replace("<body>", "<body>" + banner, 1)
s = s.replace("all the way to a race track at 1,000.", "all the way to a fire station, an airport and a Grand Prix at 10,000.", 1)
os.makedirs(os.path.join(ROOT, "world"), exist_ok=True)
open(os.path.join(ROOT, "world", "index.html"), "w", encoding="utf-8").write(s)
print("world/index.html built", len(s))
