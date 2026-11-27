# Motoropolis

A 3D city that grows with the TorqueBlueprint YouTube channel: every subscriber adds a car, every milestone opens a building.

## Update the city
Edit `state.json`: change `subs`, `updated` and the `names` list (Wall of Mechanics), then commit. The site updates in about a minute.

## Automatic updates
A GitHub Action (`.github/workflows/update-state.yml`) runs every 30 minutes. It reads the channel's live subscriber count and the names of everyone who commented WORKSHOP on the latest videos (YouTube Data API v3), and updates `state.json`. It needs a repository secret named `YT_API_KEY`. Names added by hand are kept.

The page checks `state.json` again every 2 minutes, so open pages celebrate new subscribers live.

## Source code and build (city-v2)
The page is built from `src/` (the source of truth); `index.html` and the generated pages are build output.

- `src/page/` — the HTML shell, the stylesheet, the page markup and the fallback state embedded in the page.
- `src/js/` — the page script split by area: `core/`, `data/`, `sim/`, `roads/`, `traffic/`, `buildings/`, `cars/`, `people/`, `events/`, `ui/`, `map2d/` (the 2D map view), `view3d/` (renderer, camera, labels, frame loop, loader), `interiors/` (one file per interior, plus the shared kit, the `INTS` registry and the people inside), `world/`, `xmas/`, `recorder/` (test hooks).
- `src/data/` — data as JSON: `cars/` (models, GLB configs, colours, faults, inspections, parts), `buildings/` (milestones, world milestones, world map), `jobs/` (civic services, job list, job models), `people/` (shirt and skin colours). A partial refers to a file as `@@JSON:cars/models.json@@`; the build inlines it.
- `src/manifest.txt` — the order in which the partials are joined. They are ordered parts of one script (they share its variables), so the order matters.

```
python3 tools/build.py          # src/ -> index.html, world/, remake/, xmas/, rec/, perf/
python3 tools/build.py --check  # fails if index.html or a generated page is out of date
node tools/test_snapshots.js    # screenshots of main vs this branch + pixel diff (see the file header)
```
`tools/xmas_live.py on|off` and `tools/promote_world.py` edit `src/` and rebuild. `tools/split_index.py` re-creates `src/` from a single-file `index.html` (used once for the split; re-runnable if main moves on).

## City layout (Phase 1B, city-v2)

The city is laid out from data: `src/data/world/city_layout.json` (metres; x east, z south; the simulation uses px = metres x 10).

- `nodes` are the named junctions; `roads` are curves through named nodes and shape points (Catmull-Rom, or `arc` for the plaza ring), split into graph edges at the named nodes. `k` is the road kind (`main`, `street`, `lane` = cobbled, `hwy`); `amb: true` marks a country road out of the map that only ambient traffic drives.
- `lots` puts each service building on the road along its door side (`e` = the edge, `x` = the lot centre); the lot keeps its size, so slots, exteriors and interiors are unchanged.
- `water` (coast with the bay and the cape, river), `hills`, `forests`, `fields`, `rail`, `hwy`, `airport` (the reserved, empty airport area), `features` (where each unlock and landmark stands), `districts` (labels), `busLoop`.
- `lots` turn to follow their road: each lot gets `rot` (the road's angle at the lot) and is pushed off curved roads. Slots, exteriors, interiors and the 2D drawing are built in the lot's own axes (`ux`/`uy` on slots and doors) and turned round the lot centre as a whole (`lotWrap`/`lotP3` in 3D, `lotT` in 2D, `lotPt`/`lotLocal`/`inLotB` in the simulation).
- Dead ends of the simulation graph get a turning bulb (`CITY.bulbs`): cars go round it instead of turning on the spot.
- `src/js/roads/layout.js` turns it into `CITY`: the simulation graph (curved edges), the lots, the decorative buildings along the roads, the house and shed slots that fill up as the channel grows, bridges, hill heights. Everything else reads `CITY`.

## Traffic rules (city-v2, Phase 1B step 2)

`src/js/traffic/routing.js`: cars follow the curve of their lane; four-way junctions have lights; at junctions without lights the narrower road has a STOP (full stop, then give way) and equal roads give way to the right; a car only enters a junction when its path cannot cross a car already in it and there is room for it on the road it turns into; the roundabout gives way to the cars already going round (anticlockwise); every wait has a time-out, so the town never freezes. Pedestrians walk the sidewalks of the town roads and cross at the junctions (`src/js/people/walkers.js`).

## Mayor TorqueBlueprint (city mascot)

`src/js/world/mayor.js` (inside the world block, after the landmarks): the Mayor (design A) stands at the top of the City Hall steps on the Old Town square, every ~70 s strolls an arc across the square, stops to wave at the fountain and walks back; he waves at the door now and then too. The loop is timed by the world clock only (no random numbers). A "MAYOR'S OFFICE" sign stands beside the steps, and his gold name tag is drawn with the people tags (`W3.tags`, asked by `view3d/labels.js`). He is 8 meshes / 3 materials (the static body is one vertex-coloured mesh), marked `userData.nm`, and stops animating beyond the people LOD distance. Off with `?mayor=0`.

The builder between the `/*MAYOR-BUILD*/` markers only uses `T` (three), so a stand-alone page can load the same code (the reference sheet does).

**Filming him (recorder):** on the recorder page and on localhost, `window.__MAYOR` has `pos()` (`{x, z, y, a, state, t}`; `a` is the heading like the cars), `seek(t)` (jump to `t` seconds into his loop), `cycle`, `times` (`idle`, `walkOut`, `waveSquare`, `walkBack` as `[start, end]` seconds) and `g()`. In a shot list use `"follow": {"mayor": true, "phi": 0, "pitch": 0.2, "dist": 7, "at": 50}` (`at` = seconds into his loop when the shot starts; the camera target follows his height up the steps).

## Performance switches (city-v2)

- **Run-time merging:** static meshes are merged into one mesh per material and per 120 m chunk, 12 s after they stop changing (`src/js/view3d/merge.js`). Turn it off with `?merge=0`.
  - Code that changes a mesh only rarely must mark it `userData.nm = 1`, so it is never merged.
  - A group that the code replaces as a whole must set `userData.mergeRoot = 1`.
- **Level of detail:** by default, cars beyond 150 m are drawn as boxes in one instanced draw call, people beyond 100 m stop animating, and cars beyond 150 m cast no shadow. Change it with `?lod=cars:250,people:120,shadow:300`, or turn it off with `?lod=off`.
- **Shadows** follow the camera target when you are close up.
- The **HUD** canvas is drawn at display resolution.
- The **recorder page** (`data-rec`) and `?eager` keep full detail.

## Drag Strip (Phase 2C step 1, hidden until 1,000 subscribers)

The Drag Strip (layout feature `dragway`) opens with the Race Track at 1,000 subscribers. Until then the 3D city shows its blueprint board ("DRAG STRIP · OPENS AT 1,000 SUBS" / "N MORE SUBSCRIBERS TO OPEN") and the page shows nothing else about it.

- **Preview:** `?drag=1` opens it on any page (root, world, xmas, rec). On the recorder, `"drag": 1` at the top of a shot list does the same.
- **Physics** (`src/js/sim/drag.js`, specs per car model in `src/data/cars/drag_specs.json`): power curve, clutch launch, traction limit with weight transfer, gear shifts and aero drag, integrated over the quarter mile (402 m). Gives reaction time, 60 ft, 1/8 mile and 1/4 mile times and trap speeds. `node tools/drag_day.js --cars` lists every model.
- **Daily races:** every subscriber car races (Wall of Mechanics names drive theirs, the others are shown by plate). Seeded by the UTC date and `state.json`: everyone sees the same results. Qualifying in pairs, then an 8-car elimination ladder. It is bracket racing (dial-ins, the slower car starts first), so any car can win. "Fastest this week" is the raw quickest time since Monday. `node tools/drag_day.js [DATE] [--json]` prints a day.
- **3D:** the strip replays the day's heats in a loop synced to the UTC clock (36 s per heat). The quarter mile is drawn at half scale; times and speeds are the real ones.
- **Panel:** Unlocks → "Drag Strip" (Today, This week, My best). Find my name shows a person's best time once the strip is open.
- **Recorder** (`rec/shots/drag.json` is an example):
  - `"drag": {"heat": "f", "t": 10}` on a shot jumps to a heat (`"f"` final, `"sf1"`, `"qf2"`, or an index) and a time in its 36 s cycle (staging ~7 s, lights ~9 s, the run, the board after ~28 s).
  - `"follow": {"drag": true, "lane": 0, "phi": -2.0, "pitch": 0.28, "dist": 16}` follows a car (lane 0 = left, 1 = right).
  - `"dragCam": "tree"` or `{"from": "overview", "to": "stands", "fromOv": {...}}` uses a camera preset: `overview`, `start`, `tree`, `burnout`, `stands`, `finish`, `board`.
- **Next step (needs the comment job):** `STATE.drag.tunes = {"<name>": "launch"|"topspeed"}` is already read by the physics. Bets (`BET name amount`) can be settled with `node tools/drag_day.js DATE --json` (the final's winner).

## Homes (Riverside Heights, every subscriber)

Every name on the Wall (`state.json` `names`) has a home once Riverside Heights is open (100 subscribers). Click a house in Riverside Heights (or a Maple Grove apartment block) to step inside, or use Find my name → "Go to my home". Code: `src/js/interiors/home.js`.

- **Who lives where** (stable, no state needed): names are taken in `names` order (the update job only appends) and each takes the first free slot starting from a hash of the lower-cased name, so a newcomer never moves anyone. 1) the first 40 Riverside Heights houses (always built once the district opens), 2) 48 flats in the three Maple Grove apartment blocks ("FLAT 3B · MAPLE GROVE COURT 2": floors 1-4, flats A-D), 3) the remaining Riverside Heights house slots (shown as "being built" until the district grows that far; the interior is open already).
- **Inside:** one template (living room, kitchen, desk, model-car shelves, garage with the resident's car), different per person: seeded defaults from the name, then the overrides below.
- **Overrides (read only by the page; the comment job that writes them comes later):**

```json
"homes": {
  "<name exactly as in names>": {"wall": "mint", "sofa": "#7a2a22", "rug": "navy", "curtains": "orange", "kitchen": "white", "car": "red", "poster": "drag", "model": "r32"}
}
```

| key | allowed values |
|---|---|
| `wall`, `sofa`, `rug`, `curtains`, `kitchen`, `car` | a palette name (`red orange yellow green mint teal blue navy purple pink brown black grey white cream beige`) or a hex colour `#rrggbb` |
| `poster` | `kestrel`, `rally`, `drag` (the big poster by the TV) |
| `model` | the resident's car: `hothatch sport3 saloon90 coupe85 jgt98 rwd24 r32 challenger evo9` (the `glb` ids of the everyday models in `src/data/cars/models.json` that take a paint colour: price up to 90,000, not `keep` in `car_glb.json`) |

The name is matched exactly, then case-insensitively. Unknown keys and invalid values are ignored (the default stays); nothing from `homes` is ever shown as text. Palette names are case-insensitive.

## GO TO menu and deep links

The **📍 Go to** button (viewbar on computers, "Go to" in the phone bottom nav) opens a panel (side panel on computers, bottom sheet on phones) so a viewer can jump straight to a place instead of searching the city by hand. Code: `src/js/ui/goto.js`. Hidden on the recorder page and in trailer mode; Esc closes it.

- **Places:** the open buildings that have an interior on this page (it checks `R3.ints()` and `isOpen`): repair shop, supermarket, towing, gas station, tire shop, car wash, inspection, parking, auto parts, dealership, junkyard, factory, race track, police, courthouse, Motoropolis Daily, fire station, City Hall (Mayor's office), hospital (when open, or with `?hosp=1`) and Santa's workshop (Christmas pages). A tap flies the camera there and shows a **STEP INSIDE ▶** bar; **Inside ▶** goes straight in. Then landmarks (park, stadium, Drag Strip, …) and districts (from `CITY.P0`, `CITY.F` and `CITY.districts`), camera only. "Coming soon" lists the locked milestones with "N more subscribers to open" (never the total).
- **Jobs:** every job in the city with the residents who hold it, read from the city's own assignment (`JOBS` / `staffOf`). A name flies to that person and follows them (drivers by their vehicle); **AT WORK ▶** steps into their workplace, where the staff tags show them. Empty posts say "JOB OPEN · Comment WORKSHOP <JOB>" (every job title is a valid `WORKSHOP <job>` comment for `scripts/update_state.py`).
- **People:** one search over names, places and jobs; residents get "Home ▶" (`UIX.homeOf`). Find my name is unchanged.

**Deep links** (applied once the 3D city has loaded; unknown values are ignored):

| link | opens |
|---|---|
| `?go=police` | flies to a place: a building (`oficina`/`repair`, `market`, `reboques`/`tow`, `bomba`/`gas`, `pneus`/`tires`, `lavagem`/`wash`, `inspecao`/`inspection`, `parque`/`parking`, `pecas`/`parts`, `stand`/`dealership`, `sucata`/`junkyard`, `fabrica`/`factory`, `pista`/`track`, `police`, `court`, `news`, `fire`, `mayor`/`cityhall`, `hosp`/`hospital`, `santa`), a landmark (`park`, `stadium`, `drag`, `mall`, `train`, `arena`, `air`, `port`, `tvtower`, `lighthouse`) or a district (`roundabout`, `downtown`, `oldtown`, `harbour`, `riverside`, `maple`, `hills`, `industrial`, `automotive`, `farms`) |
| `?home=<name>` | steps into that resident's home |
| `?find=<name>` | opens the People search with the name and flies to the person |

They combine with the other switches (`?hosp=1`, `?drag=1`, `?mayor=0`, …), e.g. `?hosp=1&go=hospital`.
