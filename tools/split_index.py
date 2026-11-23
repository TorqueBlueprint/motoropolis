#!/usr/bin/env python3
"""Split a single-file Motoropolis index.html into the src/ tree (the source of truth since city-v2).

  python3 tools/split_index.py [path/to/index.html]     # default: ./index.html -> ./src

Re-runnable: the split points are anchors (the start of a line), searched in order, so a newer index.html
from main (with more code inside the sections) splits the same way. If an anchor is missing the tool stops
and says which one. After splitting, `python3 tools/build.py --check` must report a byte-identical page.

The page script is ONE classic-script closure (`(function(){'use strict'; ... })();`) whose sections share
local variables, and the 3D part is the body of make3D(T,X). The files under src/js are therefore ordered
partials of that closure, concatenated by tools/build.py in the order of src/manifest.txt (not standalone
ES modules). Lines starting with `//@` at the top of a partial are notes for humans and are dropped by the build.
"""
import os, sys, json

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

# (file under src/js, anchor = text the first line of the partial starts with). Order matters.
PARTS = [
    ("core/boot.js", None),
    ("data/catalog.js", "// ---------- data ----------"),
    ("roads/graph.js", "// ---------- road graph ----------"),
    ("buildings/layout.js", "// ---------- buildings ----------"),
    ("sim/milestones.js", "// ---------- subscriber milestones ----------"),
    ("sim/state.js", "// ---------- state ----------"),
    ("traffic/routing.js", "// ---------- routing & driving ----------"),
    ("sim/services.js", "// ---------- services ----------"),
    ("sim/setup.js", "// ---------- setup ----------"),
    ("sim/update.js", "// ---------- update ----------"),
    ("map2d/background.js", "// ---------- background ----------"),
    ("map2d/draw.js", "// ---------- drawing ----------"),
    ("ui/log.js", "// ---------- UI ----------"),
    ("events/crime.js", "// ---------- crime & justice"),
    ("events/world_calls.js", "// ---------- world test page: fire engine"),
    ("ui/news.js", "// ---------- Motoropolis Daily: the city"),
    ("ui/panels.js", "function stateText(c){"),
    ("ui/workshop2d.js", "// ---------- the workshop (inside the repair shop)"),
    ("people/walkers.js", "// ---------- people: the Wall of Mechanics walks"),
    ("people/jobs.js", "// ---------- jobs: the Wall of Mechanics works"),
    ("view3d/boot.js", "// ---------- 3D view (three.js"),
    ("view3d/renderer.js", "function make3D(T,X){"),
    ("roads/ground3d.js", " // ground & roads"),
    ("buildings/lots3d.js", " // lots (sidewalk + pad) and buildings"),
    ("buildings/district3d.js", " // ---------- the new district"),
    ("buildings/kit3d.js", " function shellB("),
    ("buildings/exteriors.js", " const BUILD={"),
    ("buildings/construction.js", " function construction("),
    ("buildings/junk_pile.js", " // junk pile"),
    ("roads/remake_world.js", " // ---------- REMAKE world: canal"),
    ("cars/remake_bodies.js", " // ---------- REMAKE vehicles"),
    ("roads/street_props.js", " // trees, lamps, traffic lights"),
    ("view3d/lights_sky.js", " // lights & sky"),
    ("cars/vehicles3d.js", " // ---------- vehicles ----------"),
    ("people/people3d.js", " // ---------- people ----------"),
    ("people/job_models.js", " // job outfits made in Tripo"),
    ("people/stadium_players.js", " // ---- football: 22 animated"),
    ("people/rig.js", " // swap an interior person"),
    ("view3d/remake_detail.js", " const composer="),
    ("people/pedestrians3d.js", " function personMesh(col,skin,hair){return"),
    ("view3d/particles.js", " // ---------- particles"),
    ("view3d/details.js", " // ---------- dynamic bits"),
    ("view3d/camera.js", " // ---------- camera"),
    ("view3d/labels.js", " // ---------- labels drawn on the HUD"),
    ("interiors/oficina.js", " // ---------- 3D interior: the TorqueBlueprint repair shop"),
    ("interiors/lavagem.js", " // ---------- 3D interior: the car wash"),
    ("interiors/reboques.js", " // ---------- 3D interior: 24h towing depot"),
    ("interiors/_kit.js", " // ---------- 3D interiors: the rest of the city"),
    ("interiors/bomba.js", " // ===== GAS STATION SHOP"),
    ("interiors/pneus.js", " // ===== TIRE SHOP"),
    ("interiors/inspecao.js", " // ===== INSPECTION CENTER"),
    ("interiors/parque.js", " // ===== PARKING GARAGE"),
    ("interiors/pecas.js", " // ===== AUTO PARTS WAREHOUSE"),
    ("interiors/stand.js", " // ===== DEALERSHIP"),
    ("interiors/sucata.js", " // ===== JUNKYARD CRUSHER"),
    ("interiors/fabrica.js", " // ===== CAR FACTORY"),
    ("interiors/pista.js", " // ===== RACE TRACK PIT GARAGE"),
    ("interiors/stadium.js", " // ---- STADIUM interior"),
    ("interiors/market.js", " // ===== SUPERMARKET"),
    ("interiors/_registry.js", " const INTS={"),
    ("interiors/news.js", " // ===== NEWS KIOSK"),
    ("interiors/police.js", " // ===== POLICE STATION"),
    ("interiors/court.js", " // ===== COURTHOUSE"),
    ("interiors/_life.js", " // ---------- people inside the buildings"),
    ("interiors/_staff.js", " // job tags: who works where"),
    ("interiors/_transitions.js", " function enterIn(type){"),
    ("world/world3d.js", " // ---------- WORLD (test page only)"),
    ("world/treeify.js", " // ---------- world: swap the simple trees"),
    ("view3d/resize.js", " // ---------- frame ----------"),
    ("xmas/city.js", " // ---------- CHRISTMAS"),
    ("interiors/santa.js", "  // ===== inside Santa's workshop"),
    ("xmas/sleigh_snow.js", "  // Santa's sleigh flies a loop"),
    ("view3d/frame.js", " function frame(dt){"),
    ("view3d/loader.js", "async function loadR3(){"),
    ("ui/view_controls.js", "const vMsg=$('vMsg')"),
    ("core/main_loop.js", "drawBackground();setup();"),
    ("recorder/hooks.js", "if(location.hostname==='localhost')window.__mtpBuild"),
    ("core/end.js", "})();"),
]

# one-line notes put at the top of each partial (dropped by the build)
SCOPE_TOP = "closure scope (top level of the page IIFE)"
SCOPE_3D = "inside make3D(T,X): uses T (three), X (remake extras), scene, mat, box(), U(), LOT, cam, hctx..."
NOTES = {
    "core/boot.js": "opens the page IIFE; page flags (WORLD, XMAS, PERF, QUAL, REMAKE), grid constants, canvases, helpers",
    "core/end.js": "closes the page IIFE",
    "interiors/_kit.js": "shared interior kit: room(), furnish(), header(), lockedNote(), mirror(), carTags(), holderRow()",
    "interiors/_registry.js": "INTS registry: build/sync/labels/home for every interior (type -> object)",
    "interiors/_life.js": "LIFE: people moving inside each interior (wraps INTS[k].sync/labels)",
    "interiors/_staff.js": "XTRA: job tags and extra staff inside interiors (wraps INTS[k].sync/labels)",
    "interiors/_transitions.js": "enterIn / exitIn / fade between city and interiors",
    "interiors/santa.js": "Santa's workshop; continues the if(XMAS){ block opened in xmas/city.js (registers INTS.santa)",
    "xmas/city.js": "opens if(XMAS){ ... closed at the end of xmas/sleigh_snow.js",
    "xmas/sleigh_snow.js": "continues and closes the if(XMAS){ block",
    "view3d/renderer.js": "opens make3D(T,X) (closed in view3d/frame.js)",
    "view3d/frame.js": "frame()/reset(), returns the R3 object, closes make3D",
    "recorder/hooks.js": "localhost/test hooks (window.__R3, __jam ...); tools/build_rec.py patches this line for the recorder",
}


def main():
    src_html = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "index.html")
    s = open(src_html, encoding="utf-8").read()
    i_css = s.index('<style id="css">') + len('<style id="css">')
    j_css = s.index("</style>", i_css)
    i_app = j_css + len("</style>\n")
    st_tag = '\n<script id="state" type="application/json">'
    j_app = s.index(st_tag, i_app)
    i_st = j_app + len(st_tag)
    j_st = s.index("</script>", i_st)
    sc_tag = "</script>\n<script>"
    assert s[j_st:j_st + len(sc_tag)] == sc_tag
    i_js = j_st + len(sc_tag)
    j_js = s.rindex("</script>")
    shell = s[:i_css] + "@@CSS@@" + s[j_css:i_app] + "@@APP@@" + s[j_app:i_st] + "@@STATE@@" + s[j_st:i_js] + "@@JS@@" + s[j_js:]
    js = s[i_js:j_js]
    lines = js.split("\n")
    # lines[k] (k < len-1) is followed by "\n"; the last element is whatever follows the final newline
    starts = [0]
    k = 0
    for f, a in PARTS[1:]:
        while k < len(lines) and not lines[k].startswith(a):
            k += 1
        if k >= len(lines):
            sys.exit("anchor not found for %s: %r" % (f, a))
        starts.append(k)
        k += 1
    starts.append(len(lines))
    out = os.path.join(ROOT, "src")
    for f, _ in PARTS:
        p = os.path.join(out, "js", f)
        if os.path.exists(p):
            os.remove(p)
    manifest = []
    for n, (f, _) in enumerate(PARTS):
        a, b = starts[n], starts[n + 1]
        chunk = lines[a:b]
        last = b == len(lines)
        body = "\n".join(chunk) + ("" if last else "\n")
        names = [x for x, _ in PARTS]
        scope = SCOPE_3D if names.index("view3d/renderer.js") <= n < names.index("view3d/loader.js") else SCOPE_TOP
        note = "//@ " + f + (" - " + NOTES[f] if f in NOTES else "") + "\n"
        note += "//@ " + scope + ". Ordered partial: see src/manifest.txt; //@ lines are dropped by tools/build.py\n"
        p = os.path.join(out, "js", f)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, "w", encoding="utf-8", newline="").write(note + body)
        manifest.append(f)
    os.makedirs(os.path.join(out, "page"), exist_ok=True)
    open(os.path.join(out, "page", "shell.html"), "w", encoding="utf-8", newline="").write(shell)
    open(os.path.join(out, "page", "style.css"), "w", encoding="utf-8", newline="").write(s[i_css:j_css])
    open(os.path.join(out, "page", "app.html"), "w", encoding="utf-8", newline="").write(s[i_app:j_app])
    open(os.path.join(out, "page", "state.json"), "w", encoding="utf-8", newline="").write(s[i_st:j_st])
    open(os.path.join(out, "manifest.txt"), "w", encoding="utf-8").write(
        "# Order in which tools/build.py concatenates src/js/* into the page script (one classic-script closure).\n"
        "# Moving a line changes the program: declarations must stay before their first top-level use.\n"
        + "\n".join(manifest) + "\n")
    print("split %s into %d partials (%d lines of script)" % (src_html, len(manifest), len(lines)))


if __name__ == "__main__":
    main()
