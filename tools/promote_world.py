#!/usr/bin/env python3
"""Make the new world the live city: index.html opens in world mode by default.
Safe to run twice (it does nothing the second time)."""
import os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
p = os.path.join(ROOT, "index.html")
s = open(p, encoding="utf-8").read()
OLD = "const WORLD=document.documentElement.dataset.world==='1';"
NEW = "const WORLD=document.documentElement.dataset.world!=='0';"
if NEW in s:
    print("already promoted"); sys.exit(0)
assert s.count(OLD) == 1, "world flag not found"
s = s.replace(OLD, NEW)
s = s.replace(".screen{position:relative;width:100%;max-width:100%;aspect-ratio:1920/1380;",
              ".screen{position:relative;width:100%;max-width:100%;aspect-ratio:3640/1980;", 1)
s = s.replace("all the way to a race track at 1,000.", "all the way to a fire station, an airport and a Grand Prix at 10,000.", 1)
open(p, "w", encoding="utf-8").write(s)
print("promoted: the world is now the live city")
