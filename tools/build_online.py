#!/usr/bin/env python3
"""Build online/index.html: Motoropolis Online (Season 1) - the same city as the live page, plus YouTube sign-in,
a wallet, junior jobs and a daily salary (Supabase). Made from the root index.html like the other pages; the
account code lives in src/online/ (online.css, online.html, online.js) and is added as a second <script>.
No subscriber totals are shown on this page. ?mock=1 shows the account panel with fake local data."""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "src", "online")


def rd(name):
    return open(os.path.join(SRC, name), encoding="utf-8").read()


def sub(s, old, new):
    # first occurrence, like the other page builders (the city script holds a few of these strings as text too)
    assert old in s, old[:60]
    return s.replace(old, new, 1)


s = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
i = s.index("<html")  # the page's own <html> tag (the first one; the city script holds "<html>" as text further down)
assert i < 40, i
s = s[:i] + '<html data-online="1"' + s[i + 5:]
s = s.replace("'state.json?v='", "'../state.json?v='")
s = sub(s, "<title>Motoropolis by TorqueBlueprint</title>", "<title>Motoropolis Online · Season 1</title>")
# models and textures live in ../assets/ from this folder
s = sub(s, "const ASSET_BASE=/\\/(world|remake|xmas|perf)\\//.test(location.pathname)?'../':'';",
        "const ASSET_BASE=/\\/(world|remake|xmas|perf|online)\\//.test(location.pathname)?'../':'';")
# the 3D HUD canvas (counters over the city) is not drawn on this page
s = sub(s, "function drawHUD(){", "function drawHUD(){if(document.documentElement.dataset.online)return;")
# hero: name, tagline and the account button (top right)
s = sub(s, "<h1>Motor<span>o</span>polis</h1>", '<h1>Motor<span>o</span>polis<span class="on-h1">Online</span></h1>')
s = sub(s, '<p class="tag">A city that runs on cars and grows with the channel.',
        '<p class="tag">Season 1. Sign in with your YouTube channel, take a junior job and earn your way up. '
        'Everyone starts equal: $0, no house, no job.</p><p hidden>')
s = sub(s, '<header class="hero">', '<header class="hero"><div class="on-top" id="onTop"></div>')
# welcome screen text
s = sub(s, "Welcome to<br><span>Motoropolis</span>", "Welcome to<br><span>Motoropolis Online</span>")
s = sub(s, "A 3D city that grows with the TorqueBlueprint channel. Every car, every worker, every name here is a real subscriber.",
        "Season 1 is open. Sign in with YouTube, start at $0, get a junior job and collect your salary every day.")
s = sub(s, "Tip: comment <b>WORKSHOP</b> on any video to move in and get a job.", "Tip: the <b>Sign in with YouTube</b> button is at the top right.")
banner = ('<div class="on-banner" role="note">Season 1 — everyone starts at $0'
          '<small>Motoropolis Online · early test</small></div>')
s = sub(s, "<body>", "<body>" + banner)
s = sub(s, '<style id="css">', '<style id="online-css">' + rd("online.css") + '</style><style id="css">')
js = rd("online.js")
assert "</script" not in js.lower()
assert s.endswith("</script></body></html>")  # the city script text also contains "</body></html>": append at the very end
s = s[:-len("</body></html>")] + rd("online.html") + "<script>" + js + "</script></body></html>"
os.makedirs(os.path.join(ROOT, "online"), exist_ok=True)
open(os.path.join(ROOT, "online", "index.html"), "w", encoding="utf-8").write(s)
print("online/index.html built", len(s))
