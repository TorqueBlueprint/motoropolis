#!/usr/bin/env python3
"""Build xmas/index.html: the Christmas version of the city (snow, lights, the city
tree, market, Santa's sleigh, the light truck, Christmas jobs). Test link only."""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
s = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
s = s.replace("<html>", '<html data-xmas="1">', 1) if "<html>" in s else s.replace("<html ", '<html data-xmas="1" ', 1)
s = s.replace("'state.json?v='", "'../state.json?v='")
s = s.replace("<title>Motoropolis by TorqueBlueprint</title>", "<title>Motoropolis · Christmas</title>", 1)
banner = ('<div style="position:sticky;top:0;z-index:50;background:#b3261e;color:#fff;font:800 14px/1.3 sans-serif;'
          'text-align:center;padding:8px 12px;letter-spacing:.05em">🎄 MOTOROPOLIS CHRISTMAS · TEST VERSION (not the live city yet)</div>')
s = s.replace("<body>", "<body>" + banner, 1)
os.makedirs(os.path.join(ROOT, "xmas"), exist_ok=True)
open(os.path.join(ROOT, "xmas", "index.html"), "w", encoding="utf-8").write(s)
print("xmas/index.html built", len(s))
