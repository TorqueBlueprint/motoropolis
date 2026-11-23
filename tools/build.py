#!/usr/bin/env python3
"""Build every page from src/ (the source of truth).

  python3 tools/build.py            # src/ -> index.html, then world/ remake/ xmas/ rec/ perf/
  python3 tools/build.py --check    # exit 1 if index.html or a generated page is not what src/ builds

src/page/shell.html  the HTML around the page (placeholders @@CSS@@ @@APP@@ @@STATE@@ @@JS@@)
src/page/style.css   the page stylesheet          src/page/app.html   the page markup (#app)
src/page/state.json  the fallback state embedded in the page (the live numbers come from /state.json)
src/manifest.txt     the order of the script partials in src/js/ (one classic-script closure, inlined)

The page stays a single self-contained index.html with one inline <script> (the page rebuilds itself from
document.currentScript, and the recorder build patches it), so GitHub Pages serves exactly what it served
before. The other pages are still made by tools/build_<page>.py from the root index.html.
"""
import os, sys, subprocess

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "src")
PAGES = ["world", "remake", "xmas", "rec", "perf"]


def rd(*p):
    return open(os.path.join(SRC, *p), encoding="utf-8", newline="").read()


def partial(name):
    t = rd("js", name)
    # drop the leading //@ note lines
    while t.startswith("//@"):
        t = t[t.index("\n") + 1:] if "\n" in t else ""
    return t


def assemble():
    order = [l.strip() for l in rd("manifest.txt").split("\n") if l.strip() and not l.lstrip().startswith("#")]
    js = "".join(partial(n) for n in order)
    shell = rd("page", "shell.html")
    for k in ("@@CSS@@", "@@APP@@", "@@STATE@@", "@@JS@@"):
        assert shell.count(k) == 1, k
    # @@JS@@ last: the script may legitimately contain the other markers as text
    out = shell.replace("@@CSS@@", rd("page", "style.css")).replace("@@APP@@", rd("page", "app.html")).replace("@@STATE@@", rd("page", "state.json"))
    return out.replace("@@JS@@", js)


def main():
    check = "--check" in sys.argv
    page = assemble()
    idx = os.path.join(ROOT, "index.html")
    if check:
        cur = open(idx, encoding="utf-8", newline="").read()
        ok = cur == page
        print("index.html", "up to date" if ok else "DIFFERS from src/ (edit src/ and run tools/build.py)")
        if not ok:
            sys.exit(1)
        # the generated pages: rebuild into memory by running the builders on a temp copy would rewrite files,
        # so compare by building and diffing with git instead
        before = {p: open(os.path.join(ROOT, p, "index.html"), encoding="utf-8", newline="").read() for p in PAGES}
        for p in PAGES:
            subprocess.run([sys.executable, os.path.join(ROOT, "tools", "build_%s.py" % p)], check=True, stdout=subprocess.DEVNULL)
        bad = [p for p in PAGES if open(os.path.join(ROOT, p, "index.html"), encoding="utf-8", newline="").read() != before[p]]
        print("generated pages", "up to date" if not bad else "were stale and have been rebuilt: " + ", ".join(bad))
        sys.exit(1 if bad else 0)
    open(idx, "w", encoding="utf-8", newline="").write(page)
    print("index.html built", len(page))
    for p in PAGES:
        subprocess.run([sys.executable, os.path.join(ROOT, "tools", "build_%s.py" % p)], check=True)


if __name__ == "__main__":
    main()
