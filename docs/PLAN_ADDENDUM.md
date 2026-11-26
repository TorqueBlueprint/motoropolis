# Motoropolis v2 — plan addendum (user-approved additions)

Recorded on the `city-v2` branch. These are planned phases; nothing here is built yet.
Standing rules: never show the subscriber count; show both units everywhere (km/h and mph, m and ft); no real money.

## Phase 2C — Drag racing

### Viewer predictions ("palpites")
- Viewers predict race results using **Torque Coins**, a city-only currency.
- No real money is involved and nothing can be purchased.
- Coins are earned by being in the city, having a job and commenting.
- A prediction is placed by comment: `BET <name> <amount>`.
- A **best predictors** ranking is shown.
- Coins only buy cosmetic or city items: paint, a custom plate or a small upgrade.

### Daily automatic races
- Every subscriber's car takes part in daily automatic races.
- The race times feed a **weekly time ranking**.

### Tunes
- Pilots choose a tune by comment: `TUNE launch` or `TUNE topspeed`.
- The tune affects the race physics. Neither choice should be dominant.

## Phase 7 — Weekly Drag Night

- An 8-car bracket made up of:
  - the top 4 weekly times;
  - 3 random draws among those who commented `DRAG` that week;
  - the defending champion (king of the hill).
- Each Drag Night is recorded as a Short.
- The Short ends with "Comment DRAG to enter next week".

## Economy — Phases 3 and 5

Torque Coins are used across the whole city. They can **never** be bought with real money.

### Earning
- Job salary, scaled by career level.
- A bonus for commenting.
- Drag prizes.
- Correct predictions.
- Employee of the month.

### Spending
- Fuel.
- Workshop repairs. The Phase 3 PAGO invoice debits the owner and credits the workshop or the city till.
- Wash and inspection.
- Parts and upgrades.
- Paint and a custom plate.

Regular costs such as fuel and breakdowns keep coins flowing out, so the currency doesn't inflate.

### How it works
- The economy is computed deterministically by the existing comment-reading job (the `update_state.py` flow).
- Results go into a **separate economy JSON** file. There is no always-on server.
- Viewers act through YouTube comments (`BET`, `TUNE`, `BUY`), so a viewer's identity is the comment author.
- This must not break `state.json`, its roles or its locked jobs; their format stays unchanged.

## Phase 6 — Personal menu

- Search for your name, or open the page with `?me=<name>`.
- It shows your car, coins, transactions, job and level, drag times and predictions.
- It is read-only and needs no login.

## Phase 1B — Organic city layout

To be done after the performance work and before Phase 2. Seen from above, the city looks like a rectangle of blocks; this phase makes it look organic.

- **Curved roads:** a riverside and coast road, winding roads up the hills, and a diagonal avenue cutting through the grid.
- **Districts with their own street shapes:**
  - Old Town: crooked, narrow streets.
  - Residential: curved streets and cul-de-sacs.
  - Downtown: a grid.
- **Edges that fade out** instead of a straight boundary: suburbs, farms and fields, a highway leaving to the horizon, and industry by the port.
- **An irregular coast:** beaches, a bay, and a cape with the lighthouse.
- **The city visibly grows outward** with each unlock.
- **Must keep working:** traffic, lots, milestones, `state.json`, roles and locked jobs.
- **Static-geometry merging stays a load-time step** driven by the city data (chunked). There are no hand-baked merged files, so it keeps working when the layout changes.
- **Status (step 1, layout for approval):** the grid is gone. The layout is data (`src/data/world/city_layout.json`, see the README): a round plaza with a roundabout and a ring road, curved roads out to the districts (old town and harbour on the bay, the village across the river with two bridges, the hills, the suburbs, industry with the dragway, the stadium), the coast road, the riverside road, farms, forests and the reserved airport area in the east. Traffic and lots follow the new roads; polishing traffic and lots is step 2.
- **Status (step 2, polish):** roundabout give-way, STOP / give-way at the junctions without lights, turning bulbs at the dead ends, cars that follow the lane curves and pitch on the hills and bridge ramps, lots turned to follow their road, looser plaza and suburbs, taller shaded hills and smaller far hills, pedestrians on the sidewalks, and the 2D map showing the whole city.
