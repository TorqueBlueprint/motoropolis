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

## Car names

The 30 city cars show their **real make and model as text** (`n` in `src/data/cars/models.json`, e.g. "Nissan Skyline GT-R (R32)"), in the car panel, labels, drag board, challenge cards, shop job cards and news. Rules:

- Names are text only. No logos, badges, emblems or brand symbols on the 3D cars or as images anywhere . Embedded GLB textures that still carry maker marks (to blank or check that they are not mapped to visible faces): `ae86.glb` (Toyota logo and wordmark, materials `lights__env_50_spec`, `misc__env_19_spec`), `rwd24.glb` (Subaru logo, `extras`), `jgt98.glb` (Toyota logo on the wheel texture, `wheel.1`), `awd99.glb` ("SKYLINE" plate, `Material`), `challenger.glb` (SRT cat-head logo, `…LightB_Materia`); supplier marks: BBS (`rearturbo.glb` wheels), Brembo and Enkei (`rwd24.glb`), American Racing (`charger.glb`), Motegi (`evo9.glb`), Goodyear (`viper.glb`), Bridgestone (`ae86.glb`). Badge-shaped details modelled as geometry also appear on several cars (e.g. roundels on `coupe85`/`sedan98`, pony on `fastback65`, GT-R badges on `r32`/`awd99`, horse on `f40`).
- Code never matches a car by its name: the key is always `glb` (homes overrides, shot lists, drag entrants, dealer). Turbo repair jobs use `asp` in `drag_specs.json`; the SUV body uses `suv: true` in `models.json`.
- The footer credits say the names identify the real cars, trademarks belong to their owners, and Motoropolis is not affiliated with any maker.
- `drag_specs.json` is the game's tuning and was not changed with the names. Known differences from the real cars (power, mass, drive, gears) are listed in the car-names report; the biggest: `taxi` (spec 150 hp FWD, the model is a V8 RWD Crown Victoria), `rearturbo` (spec is a 992 Turbo S: 640 hp AWD PDK; the model is a 997 GT2: 530 PS RWD manual), `gt12` (spec is an 812 Superfast: 789 hp; the model is a 599 GTB: 620 PS), `offroad` (spec 278 hp 3.0 V6 diesel, 6 gears; the Ranger Raptor is a 213 PS 2.0 diesel with 10 gears, or a 3.0 V6 petrol in the 2022+ model), `challenger` (spec 717 hp = Hellcat; the model is a Super Stock, 807 hp), `etype` (spec is a 3.8 six; the model is a Series 3 V12).

## Drag Strip (Phase 2C step 1, hidden until 1,000 subscribers)

The Drag Strip (layout feature `dragway`) opens with the Race Track at 1,000 subscribers. Until then the 3D city shows its blueprint board ("DRAG STRIP · OPENS AT 1,000 SUBS" / "N MORE SUBSCRIBERS TO OPEN") and the page shows nothing else about it.

- **Preview:** `?drag=1` opens it on any page (root, world, xmas, rec). On the recorder, `"drag": 1` at the top of a shot list does the same.
- **Physics** (`src/js/sim/drag.js`, specs per car model in `src/data/cars/drag_specs.json`): power curve, clutch launch, traction limit with weight transfer, gear shifts and aero drag, integrated over the quarter mile (402 m). Gives reaction time, 60 ft, 1/8 mile and 1/4 mile times and trap speeds. `node tools/drag_day.js --cars` lists every model.
- **Daily races:** every subscriber car races (Wall of Mechanics names drive theirs, the others are shown by plate). Seeded by the UTC date and `state.json`: everyone sees the same results. Qualifying in pairs, then an 8-car elimination ladder. Heads-up racing: both cars get the green together and the first to the line wins (a red light loses); the dial-in is shown for information only. "Fastest this week" is the raw quickest time since Monday. `node tools/drag_day.js [DATE] [--json]` prints a day.
- **3D:** the strip replays the day's heats in a loop synced to the UTC clock (36 s per heat). The quarter mile is drawn at half scale; times and speeds are the real ones.
- **Panel:** Unlocks → "Drag Strip" (Today, This week, My best). Find my name shows a person's best time once the strip is open.
- **Recorder** (`rec/shots/drag.json` is an example):
  - `"drag": {"heat": "f", "t": 10}` on a shot jumps to a heat (`"f"` final, `"sf1"`, `"qf2"`, or an index) and a time in its 36 s cycle (staging ~7 s, lights ~9 s, the run, the board after ~28 s).
  - `"follow": {"drag": true, "lane": 0, "phi": -2.0, "pitch": 0.28, "dist": 16}` follows a car (lane 0 = left, 1 = right).
  - `"dragCam": "tree"` or `{"from": "overview", "to": "stands", "fromOv": {...}}` uses a camera preset: `overview`, `start`, `tree`, `burnout`, `stands`, `finish`, `board`.
- **Telemetry HUD (Phase 2C step 2, `src/js/world/drag_hud.js`):** while the camera is at the strip (or follows a car on it) both lanes show a compact card on the 3D view: tachometer with 5 shift lights and the gear, speed in km/h and mph, boost in bar and psi, intake air (IAT) and exhaust gas (EGT) temperatures in °C and °F, a throttle bar and a wheelspin tag, the car's hp and kW, and the live timing ladder (R/T, 60 ft · 18 m, 330 ft · 101 m, 1/8 · 201 m with its speed, 1000 ft · 305 m, 1/4 · 402 m = ET with the trap speed in mph and km/h). At the finish the winner gets WIN ▲ and the other lane its margin in seconds. A commentary line above follows the race ("KaneAills leads by 5.6 m / 18 ft", "… WINS by 0.142 s · 6.3 m / 21 ft"); hidden names (`window.__HIDE`) show the plate. The **▾ TELEMETRY** button collapses the cards to one line per lane (default: full cards on a computer, one line per lane on a phone; the choice is remembered per viewer in `localStorage`, `mtp-drag-tel`). While it shows, the page HUD leaves out its bottom panels (news ticker, subscribe banner) so nothing overlaps. It is drawn on the HUD canvas, so the recorder films it (there it sits 17 % above the bottom, clear of the Shorts caption area).
  - **Where the numbers come from:** `DRAG.run(o, true)` returns `tel`, a 0.05 s time-series read from the integrator itself: speed, gear, rpm (road speed / gear speed, the clutch-slip launch rpm, the drop while shifting) x the rev limiter, throttle (lifted while a manual shifts; flat shifts with a cut for gearboxes quicker than 0.2 s), wheelspin (the share of the drive above the traction limit), boost (turbo: spools with rpm and load through a lag, dumps on a lift; supercharged: instant; NA: 0), IAT (ambient + heat soak + what the intercooler leaves of the compressor heat), EGT and diesel soot. The telemetry never feeds back into the integrator: every time is identical with or without it. The new spec fields (`rpm`, `asp`, `fuel`, `boost`, `spool`, `lag` in `drag_specs.json`) are used only by the telemetry. The day's air temperature comes from its air density (`DRAG.ambOf`). Before the green: idle, the burnout, then a short launch-control rev on the limiter from 8.2 s (turbo petrol cars on a 2-step build some boost and crackle).
  - **Effects:** one instanced mesh for all the smoke and one for the exhaust flames (2 draw calls, 0 when nothing is alive; fixed pools, no allocation per frame): tyre smoke in the burnout and while the tyres spin at the launch, black smoke from diesels while the fuel is ahead of the air (the launch, every shift), flames on every upshift for petrol cars of 450 hp and more, 2-step pops before the green; the cars shake on the launch-control limiter. The jitter uses its own small generator (no `Math.random`, nothing to do with the results).
- **One-off races (API for the "Challenge to a drag race" button):** `window.__DRAG.race(a, b, opts)` runs a heads-up race between two cars and plays it on the strip (one 36 s cycle: staging, launch control, the run, the board), then the daily loop carries on.
  - `a`, `b`: a Wall of Mechanics name (their own car, as in the daily races) or `{glb, name?, plate?, color?}` (`glb` = a car model id from `src/data/cars/models.json`).
  - `opts`: `seed` (string mixed into the seed: the same cars + seed + UTC day give the same race for every viewer), `label` (default `"Challenge"`, shown on the board and the tree), `play: false` (compute only), `t` (start that many seconds into the cycle: 7 = just before the launch-control rev, 9 = the tree), `onEnd(summary)` (called when the cycle ends), `date` (`YYYY-MM-DD`, default today UTC).
  - Returns at once `{id, label, date, win: 0|1, margin (s, null for a red light), winner, played, lanes: [{who, name, plate, model, glb, color, rt, red, t60, t8, v8, et, vt, mph, kmh}, …]}` (`who` = the name, or the plate when hidden). `played` is false while the strip is closed (before 1,000 subscribers without `?drag=1`): check `__DRAG.open()` before offering the button.
  - `__DRAG.racing()` → `{t, cycle, heat}` or null; `__DRAG.stopRace()`; camera presets `__DRAG.cam('start' | 'tree' | 'stands' | 'finish' | 'board' | …)` and `__DRAG.pos(lane)` to follow a car. The same race in plain code: `DRAG.heads(a, b, opts)` (page scope and `tools/drag_day.js`).
  - Checks: `__DRAG.tel()` (both lanes' telemetry now), `__DRAG.fx()` (live smoke and flame particles), `__DRAG.hud(null | false | 'full' | 'mini')`.
- **Recorder and the HUD:** a shot with `"telemetry": true` (or `"full"`, or `"mini"` for one line per lane) shows the HUD; shots without it don't (as before). `rec/rec.js` calls `__DRAG.hud(...)` at the start of every shot and `__DRAG.hud(null)` at the end. `rec/shots/drag.json` uses it on the tree (mini) and the run (full).
- **Next step (needs the comment job):** `STATE.drag.tunes = {"<name>": "launch"|"topspeed"}` is already read by the physics. Bets (`BET name amount`) can be settled with `node tools/drag_day.js DATE --json` (the final's winner).

## Homes (Riverside Heights, every subscriber)

Launch gate: `HOMES_AT` at the top of `src/js/interiors/home.js` (UTC milliseconds, `0` = not live yet). Before that moment the homes are off on the public pages; preview with `?homes=1` (always on in the recorder and on localhost).

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

## Repair Shop as a business (Phase 3 step 1)

The TorqueBlueprint Repair Shop interior runs a **job timetable** for its 6 lifts: `src/js/sim/shopjobs.js` (`SHOP`), drawn by `src/js/interiors/oficina.js`.

- **Seeded and shared:** jobs come only from the UTC clock and `state.json` names (no `Math.random`), so everyone sees the same jobs at the same time. A new job starts every 12 min (720 s); job `g` goes on lift `g % 5` (lift 6 waits for a 6th mechanic; each lift has a 60 min window) and is numbered `J-` + `1000 + g % 9000`. The city's own breakdown → tow → repair loop (`sim/services.js`) is unchanged.
- **A job:** plate, owner (a Wall of Mechanics resident with their own home-garage car, or a car shown by plate; never the same resident on two lifts at once), fault (weighted like the city's breakdowns; a turbo job only on a turbo car), service, parts (SKU, TC each, qty), labour hours, quote in Torque Coins (parts × price class of the car + labour × rate). **TC is display-only:** nothing is saved, there is no economy yet.
- **Stages** (40–55 min per job): ARRIVED (rolls onto the lift) → DIAGNOSIS (lift half up) → QUOTE (the customer approves at reception) → APPROVED (parts from the counter) → REPAIR (lift up; for brakes, tyres, shocks and clutch the wheels stay on the floor and the discs show) → INSPECTION → READY (the customer pays at the invoice desk) → HANDED OVER (the car backs out).
- **Mechanics:** job `g` belongs to `staffOf('oficina','Mechanic', g % 5)`; an empty post shows "MECHANIC · JOB OPEN · Comment WORKSHOP MECHANIC". The panel line at the bottom says "<Mechanic> is changing the brakes on <Owner>'s car · J-2148 · 4 min left" (hover or click a car or a mechanic; otherwise it cycles through the jobs).
- **Boards:** a job card on every lift, the JOB BOARD kanban (left wall), PARTS · STOCK & ORDERS (back wall right; ordered parts come with the parts van when the Auto Parts store is open), THE TILL (back wall left: today's jobs and TC since 00:00 UTC and the latest invoices), the latest invoice with its PAID stamp on the invoice desk. All on one atlas canvas, redrawn only when what they show changes.
- **Outside:** under "CLICK TO STEP INSIDE" the shop shows "SERVICE IN PROGRESS · n/6 LIFTS BUSY".
- `node` can run the timetable alone (it only needs `FAULTS`, `MODELS`, `COLORS`, `L2`, `CAR_GLB`, `STATE`, `WALL`, `staffOf`): `SHOP.lifts(t)`, `SHOP.invoices(t, n)`, `SHOP.today(t)`, `SHOP.job(g)`.

## Tire shop, car wash and inspection as businesses (Phase 3 step 2)

One seeded job engine runs every shop: `SHOPS.make(cfg)` in `src/js/sim/shopjobs.js`. `SHOP` (repair shop, unchanged results), `TYREJOBS`, `WASHJOBS` and `INSPJOBS` are made with it; the shared 3D kit is `src/js/interiors/_bizkit.js` (merged geometry `OFG`, materials `OFM`, the car re-baker `OFC`, one atlas per shop `bizAtlas`, painters `BIZP.card / board / till / invoice / stamp`, `bizPanelLine`, `bizPointer`, `bizHit`, `bizMove`, `bizStaffTag`, `bizLine`, `bizCar`, `bizExtPill`).

- **Same rules as the repair shop:** jobs only from the UTC clock and `state.json` names (no `Math.random`), customers are Wall residents with their home-garage car (or a car by plate), staff are the residents with that job (`staffOf`), hidden names show the plate or "The … crew", TC is display-only, the city's own service loops are untouched. A shop that is not open yet has no jobs.
- **Tire shop** (`interiors/pneus.js`): 4 bays, 3 Tire Technicians (bay 4 shows "NO TIRE TECHNICIAN · JOB OPEN · Comment WORKSHOP TIRE TECHNICIAN"), a job every 11 min, 16–32 min each: puncture, new tyres ×2 / ×4 (sometimes with an alignment), balancing, alignment, seasonal swap (winter set from October to March). Stages ARRIVED → LIFT UP → WHEELS OFF → TYRE CHANGER → BALANCER → REFIT · TORQUE → ALIGNMENT → READY → DRIVEN OFF (a service skips the stages it does not need). Cards show size, DOT code, tread mm / 32nds in, pressure bar / psi, wheel-nut torque N·m / lb·ft. Tyre rack with size labels, TYRES IN STOCK, PRICES, the alignment screen, balancer displays (g / oz), job board, till, invoice.
- **Car wash** (`interiors/lavagem.js`): 2 lanes, 2 Wash Attendants, a car every 9 min, 7.5–17 min: QUEUE (pay at the kiosk) → PRE-WASH → FOAM (snow-foam blanket + foam particles) → BRUSHES · RINSE → DRY → VACUUM · VALET (Premium / Full valet) → READY → DRIVEN OFF. Menu board (Basic 12 TC, Premium 24 TC, Full valet 48 TC + add-ons), receipt with PAID stamp (water L / gal, foam L / qt, °C / °F). Particles use a seeded generator.
- **Inspection** (`interiors/inspecao.js`): 2 lanes, 2 Inspectors, a car every 10 min, 14–19 min: CHECK-IN → LIGHTS (aim %) → BRAKES (roller brake tester, front then rear axle: kN / lbf per wheel, efficiency %, imbalance %) → EMISSIONS (CO % / HC ppm / λ, or smoke opacity k m⁻¹ for the diesel pickup) → SUSPENSION · TYRES (tread mm / 32nds) → RESULT. About 1 in 4 fail (the failed reading is the one over its limit); retests cost 12 TC. Station screen per lane, result lamp, certificate with a green PASS or red FAIL stamp (failed item + retest), PASS LIMITS board, till with PASS / FAIL tags.
- **Outside:** under each STEP INSIDE board, "SERVICE IN PROGRESS · n/N BAYS BUSY" (LANES for the wash and inspection).
- **New shop** (tow yard, scrapyard, dealership…): `const X = SHOPS.make({b, role, bays, act, step, out, seed, prefix, nameOff, crew, open, stages, split, fill(r, ctx), doing(j, s, who), ready, done})` (see the comment above `make`), then an interior built like `pneus.js`: `bizAtlas` regions, `BIZP.card/board/till/invoice` with the shop's words, `bizCar` per bay, `bizStaffJobs` + `bizMove` for the staff, `bizLine` + `bizPanelLine`, and an entry in `BIZ_EXT` for the outside pill. `node` can run the engines alone (they need `FAULTS`, `MODELS`, `COLORS`, `L2`, `CAR_GLB`, `STATE`, `WALL`, `staffOf`, `isOpen`).

## Car dealership as a business (Phase 3 step 3)

**MOTOROPOLIS MOTORS** (building `stand`, unlocks at its milestone). Engine `DEALJOBS = SHOPS.make({...})` in `src/js/sim/dealer.js`; interior `src/js/interiors/stand.js`; exterior `src/js/buildings/stand_ext.js` (`BUILD.stand` calls `standExt`).

- **Deals** (seeded like the other shops, same for everyone, TC display-only): a deal every 25 min, 38–48 min each, on 3 sales desks: desks 1–2 belong to `staffOf('stand','Car Salesman',k)`, desk 3 shows "JOB OPEN · Comment WORKSHOP CAR SALESMAN". Stages BROWSING → TEST DRIVE (the car leaves through its roller door and comes back) → OFFER → FINANCE → SOLD → PREP · VALET → READY FOR COLLECTION (red ribbon, "READY FOR COLLECTION: <buyer>", the key leaves the key cabinet) → DRIVEN HOME. A deal: buyer (a Wall resident, whose home-garage car is the trade-in when it is worth less than the new one, or a walk-in customer), the car (any model with a 3D car except the taxi, cheaper cars more often; 30 % approved used with km / mi), list price (= the model's price), discount, fees (registration, delivery prep, sometimes paint protection / extended warranty), trade-in value, cash or finance (deposit, 36/48/60 months, APR, monthly). Panel line: "<Salesman> is selling the <model> to <buyer> · deal D-1042 · 12 min left".
- **Showroom:** 5 cars on display (`DEALJOBS.display(t)`: a new set every UTC day, the first one on the turntable), a spec stand by each (model name from `MODELS` at run time, hp / kW, 0-100 km/h and 0-60 mph from one `DRAG.run` launch, kg / lb, top speed km/h / mph, drivetrain, km / mi, price TC), SOLD board (latest 8 deals with their SOLD stamp), SALES LEADERBOARD (today / 7 days / TC per salesman), SALES · TODAY ("TODAY: n CARS SOLD · X TC"), the manager's glass office (today's target), the customer lounge (TV, coffee bar), the finance desk with the latest sales contract (SOLD stamp), the key cabinet and the delivery bay behind glass. About 25–30 draw calls (cars re-baked by `OFC` with the wheels merged into the body).
- **Outside:** glass showroom (lit at night), steel canopy, sign and pylon (no car brands), the turntable car visible through the glass, forecourt with a hero car on a display ramp and three cars with windscreen price boards (TC, km / mi), flags and bunting, planters, lamp posts, customer bays, the service · delivery building, and the **NEW ARRIVALS** bays: the city's 4 dealership slots now sit beside the drive-in (`buildings/layout.js`), where the factory's new cars park as before. Under STEP INSIDE: "OPEN · n CARS ON DISPLAY · n SALES IN PROGRESS" (`BIZ_EXT.stand`). Locked: the blueprint ghost (box edges, no cars) or, as the next milestone, the construction site with "N MORE SUBSCRIBERS TO OPEN"; on unlock the usual construction → ready flow.
- **Preview** (localhost): `window.__SUBS(160)` opens it (construction for 40 s of city time, then the building), `__SUBS(100)` shows the blueprint; or serve a copy of `state.json` with another `subs` (e.g. `node tools/test_snapshots.js --state /tmp/state160.json --interiors stand`). `__LIGHT('noite')` for night.

## GO TO menu and deep links

The **📍 Go to** button (viewbar on computers, "Go to" in the phone bottom nav) opens a panel (side panel on computers, bottom sheet on phones) so a viewer can jump straight to a place instead of searching the city by hand. Code: `src/js/ui/goto.js`. Hidden on the recorder page and in trailer mode; Esc closes it.

- **Places:** the open buildings that have an interior on this page (it checks `R3.ints()` and `isOpen`): repair shop, supermarket, towing, gas station, tire shop, car wash, inspection, parking, auto parts, dealership, junkyard, factory, race track, police, courthouse, Motoropolis Daily, fire station, City Hall (Mayor's office), hospital (when open, or with `?hosp=1`) and Santa's workshop (Christmas pages). A tap flies the camera there and shows a **STEP INSIDE ▶** bar; **Inside ▶** goes straight in. Then landmarks (park, stadium, Drag Strip, …) and districts (from `CITY.P0`, `CITY.F` and `CITY.districts`), camera only. "Coming soon" lists the locked milestones with "N more subscribers to open" (never the total).
- **Jobs:** every job in the city with the residents who hold it, read from the city's own assignment (`JOBS` / `staffOf`). A name flies to that person and follows them (drivers by their vehicle); **AT WORK ▶** steps into their workplace, where the staff tags show them. Empty posts say "JOB OPEN · Comment WORKSHOP <JOB>" (every job title is a valid `WORKSHOP <job>` comment for `scripts/update_state.py`).
- **People:** one search over names, places and jobs; residents get "Home ▶" (`UIX.homeOf`). Find my name is unchanged.

- **🎩 Tour the city:** a guided camera flight (about 75 s) through the highlights with Mayor TorqueBlueprint's speech bubble: City Hall, downtown, the repair shop (Wall of Mechanics), police and courthouse, fire station, Riverside Heights (once the homes are live), the old town and harbour, the next locked milestone ("N more subscribers to open") and back to City Hall. Skip ▶, Stop ✕, Esc, or any drag or zoom on the city ends it. With `?mayor=0` there is no City Hall stop and the bubble says "City guide". Lines are in `tourStops()` in `src/js/ui/goto.js`.
- **🎲 Surprise me:** goes to a random open place, landmark or resident (never a hidden name). It uses `crypto.getRandomValues`, so the city's own random numbers are not touched.
- **What's new** (top of Places): `src/data/ui/whats_new.json`, one line per item: `{"date": "2026-11-28", "text": "…", "go": "<place key>" | "tour" | "surprise", "need": "<interior>"}` (`need` is optional: the item only shows when that interior is registered, e.g. `"home"` once the homes are live). Items whose place is not open on the page are skipped; the newest 5 show. A red dot on the Go to button marks an item the viewer has not seen yet (remembered in `localStorage`, `mtp-goto-news`).

**Deep links** (applied once the 3D city has loaded; unknown values are ignored):

| link | opens |
|---|---|
| `?go=police` | flies to a place: a building (`oficina`/`repair`, `market`, `reboques`/`tow`, `bomba`/`gas`, `pneus`/`tires`, `lavagem`/`wash`, `inspecao`/`inspection`, `parque`/`parking`, `pecas`/`parts`, `stand`/`dealership`, `sucata`/`junkyard`, `fabrica`/`factory`, `pista`/`track`, `police`, `court`, `news`, `fire`, `mayor`/`cityhall`, `hosp`/`hospital`, `santa`), a landmark (`park`, `stadium`, `drag`, `mall`, `train`, `arena`, `air`, `port`, `tvtower`, `lighthouse`) or a district (`roundabout`, `downtown`, `oldtown`, `harbour`, `riverside`, `maple`, `hills`, `industrial`, `automotive`, `farms`) |
| `?home=<name>` | steps into that resident's home |
| `?find=<name>` | opens the People search with the name and flies to the person |
| `?tour=1` | starts the Mayor's tour |

They combine with the other switches (`?hosp=1`, `?drag=1`, `?mayor=0`, …), e.g. `?hosp=1&go=hospital`.

## Car panel: Follow, Drive, Drag race (Phase 2D)

Click a car in the 3D city: a bar over the city (and the "Car details" card below it) offers **Follow** (the camera stays on the car for 45 s; a drag or zoom stops it), **Drive ▶** and **Drag race ⚑**. The GO TO person bar has **DRIVE ▶** (when the resident's car is on the road) and **RACE ⚑** next to AT WORK ▶ / HOME ▶. Code: `src/js/cars/drive.js` (drive, follow, the car actions) and `src/js/ui/challenge.js`.

**Drive** (root, world, xmas, remake, perf; off on the recorder page and in trailer mode):

- Third-person chase camera (56° field of view while driving). The car leaves the AI traffic (`state: 'drive'`: `sim/update.js` skips it; `traffic/routing.js` `gapAhead()` treats it as an obstacle, so the AI cars stop behind or in front of it; a car blocked for more than 25 s still ghosts past, as for any jam). On exit it rejoins the AI on the nearest lane of the road whose direction is closest to its heading, in a free spot, and keeps its errand.
- Controls: computer `W`/`↑` gas, `S`/`↓` brake (hold it when stopped to reverse), `A` `D` / `←` `→` steer, `Space` handbrake, `Esc` exit. Touch screens: ◀ ▶ steering, GAS, BRAKE and HANDBRAKE pedals (all at least 44 px), Exit button top right; on a phone the city goes full window while driving.
- Physics (fixed 120 Hz step, no allocations): the car's real numbers from `src/data/cars/drag_specs.json` (power, kerb mass + driver, FWD/RWD/AWD, number of gears, speed at the limiter in 1st and top, drag, grip) with the drag sim's power curve, launch slip, traction limit with weight transfer and an automatic gearbox; brakes, light drift (handbrake, or RWD wheelspin), bumps off the kerbs and other cars, no damage. The car may go on the roads and 1.2 m of kerb, the service lots and the turning bulbs (a 1 m occupancy mask built on the first drive).
- World scale: 1 m/s of physics moves the car 6.05 px/s (0.6 m/s on the map), the same scale the car card uses for the AI cars, so speeds in the HUD and the card agree. The rpm bar uses a generic 7,000 rpm limiter (the specs give speeds per gear, not revs).
- HUD: speed in km/h and mph, gear, rpm bar, the owner (★ name, or the plate; names in `window.__HIDE` show as "A resident") and the model with hp · kW, kg · lb and drive.
- Entering an interior (a click on a building, GO TO, Find my name, a home) ends the drive first; so does switching to the 2D map.
- Deep link `?drive=<name>` drives that resident's car once the city has loaded (it waits while the car is at a shop; unknown names are ignored).

**Drag race** (heads-up, 1/4 mile · 402 m): pick an opponent (search the residents, or 🎲 random) and get the result card: reaction time, 60 ft · 18 m, 1/4 mile elapsed time, trap speed in mph and km/h, power hp · kW, weight kg · lb, the winner and the margin (seconds, metres and feet). It is seeded from the two entrants and the UTC date (`sim/drag.js` `run()` with a pass like the daily heats), so everyone sees the same result for the same pair on the same day; nothing is saved. Residents race their Drag Strip car (the one the strip gives them, the same in every browser); a car without a driver races as itself, by plate. **Watch on the strip ▶** appears only when the strip is open on the page (or `?drag=1`) and the strip exposes its heads-up API: `RACE1V1` at the top of `src/js/ui/challenge.js` is the one adapter to point at it (`window.__DRAG.headsUp(a, b, res)` expected).

| link | opens |
|---|---|
| `?drive=<name>` | drives that resident's car |
