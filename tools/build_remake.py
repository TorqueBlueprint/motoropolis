#!/usr/bin/env python3
"""Build remake/index.html: the same city as index.html, switched to the new
"game look" (data-remake="1"). Run after every change to index.html so the
preview stays in sync. To make the new look live, set data-remake on the main page."""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
s = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
s = s.replace("<html>", '<html data-remake="1">', 1)
imap = '<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js"}}</script>'
s = s.replace("<head>", "<head>" + imap, 1)
s = s.replace("'state.json?v='", "'../state.json?v='")
s = s.replace("<title>Motoropolis by TorqueBlueprint</title>", "<title>Motoropolis · New look preview</title>", 1)
banner = ('<div style="position:sticky;top:0;z-index:50;background:#ff7a1a;color:#1d0f02;font:800 14px/1.2 sans-serif;'
          'text-align:center;padding:8px 12px;letter-spacing:.06em">MOTOROPOLIS · DRIVE · REPAIR · GROW — NEW LOOK PREVIEW (not the live city yet)</div>')
s = s.replace("<body>", "<body>" + banner, 1)
open(os.path.join(ROOT, "remake", "index.html"), "w", encoding="utf-8").write(s)
print("remake/index.html built", len(s))
