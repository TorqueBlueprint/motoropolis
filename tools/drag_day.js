#!/usr/bin/env node
/* Motoropolis Drag Strip in node: the same code as the page (src/js/sim/drag.js), so the results are the same.
 *
 *   node tools/drag_day.js                 # today's (UTC) races from state.json: final, eliminations, top qualifiers, week
 *   node tools/drag_day.js 2026-11-26      # another day
 *   node tools/drag_day.js --cars          # every car model's quarter mile (stock, launch and topspeed tunes)
 *   node tools/drag_day.js --json DATE     # the day as JSON (for the comment job: settle predictions on the final)
 *   node tools/drag_day.js --race A B [DATE] [--seed S]   # a one-off heads-up race (A, B = a Wall name or a car model id)
 *
 * The comment job (update_state.py) can call this to settle bets once predictions and tunes exist (next step).
 */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), SRC = path.join(ROOT, 'src');
function load(state) {
  let t = fs.readFileSync(path.join(SRC, 'js/sim/drag.js'), 'utf8').split('\n').filter(l => !l.startsWith('//@')).join('\n');
  t = t.replace(/@@JSON:([A-Za-z0-9_/.-]+)@@/g, (_, rel) => JSON.stringify(JSON.parse(fs.readFileSync(path.join(SRC, 'data', rel), 'utf8'))));
  const J = rel => JSON.parse(fs.readFileSync(path.join(SRC, 'data', rel), 'utf8'));
  const WALL = []; for (const raw of (Array.isArray(state.names) ? state.names : [])) {const n = String(raw).trim().slice(0, 24); if (n && !WALL.some(x => x.toLowerCase() === n.toLowerCase())) WALL.push(n)}
  const MS = {}; for (const m of J('buildings/milestones.json')) MS[m.type] = m;
  const f = new Function('MODELS', 'COLORS', 'L2', 'WALL', 'STATE', 'subs', 'MS', 'MAXCARS', t + '\nreturn DRAG;');
  return f(J('cars/models.json'), J('cars/colors.json'), 'ABCDEFGHJKLMNPRSTUVWXYZ', WALL, state, state.subs || 0, MS, 400);
}
const args = process.argv.slice(2), state = JSON.parse(fs.readFileSync(path.join(ROOT, 'state.json'), 'utf8'));
const D = load(state), F = D.fmt, date = args.find(a => /^\d{4}-\d\d-\d\d$/.test(a)) || D.today();
const mods = JSON.parse(fs.readFileSync(path.join(SRC, 'data/cars/models.json'), 'utf8'));
if (args.includes('--cars')) {
  const rows = [];
  for (const m of mods) {const r = {}; for (const tu of ['stock', 'launch', 'topspeed']) r[tu] = D.run({glb: m.glb, tune: tu}); rows.push([m, r])}
  rows.sort((a, b) => a[1].stock.et - b[1].stock.et);
  for (const [m, r] of rows) {const s = r.stock;
    console.log(`${m.n.padEnd(42)} 60ft ${s.t60.toFixed(2)}  1/8 ${s.t8.toFixed(2)} @ ${(s.v8 * 2.236936).toFixed(0)} mph  1/4 ${F.et(s.et).padStart(8)} @ ${F.spd(s.vt).padEnd(26)} | launch ${r.launch.et.toFixed(3)} @ ${(r.launch.vt * 3.6).toFixed(0)}  topspeed ${r.topspeed.et.toFixed(3)} @ ${(r.topspeed.vt * 3.6).toFixed(0)} km/h`)}
  process.exit(0);
}
if (args.includes('--race')) {
  const i = args.indexOf('--race'), car = a => mods.some(m => m.glb === a) ? {glb: a} : a, si = args.indexOf('--seed');
  const h = D.heads(car(args[i + 1]), car(args[i + 2]), {date, seed: si >= 0 ? args[si + 1] : ''});
  if (!h) {console.error('usage: --race A B'); process.exit(1)}
  for (const l of h.lanes) console.log(`${F.who(l.e).padEnd(20)} ${l.e.model.padEnd(40)} RT ${l.rt.toFixed(3)}${l.red ? ' RED' : ''}  60ft ${l.t60.toFixed(3)}  1/8 ${l.t8.toFixed(3)} @ ${F.spd(l.v8)}  ET ${F.et(l.et)} @ ${F.spd(l.vt)}`);
  console.log(`-> ${F.who(h.lanes[h.win].e)} wins${h.margin != null ? ' by ' + h.margin.toFixed(3) + ' s' : ' (red light)'}`);
  process.exit(0);
}
const t0 = Date.now(), d = D.day(date), t1 = Date.now(), wk = D.week(date), t2 = Date.now();
const lane = l => l ? `${F.who(l.e)} (${l.e.model}) dial ${l.dial.toFixed(2)} RT ${l.rt.toFixed(3)}${l.red ? ' RED' : ''} ET ${F.et(l.et)} @ ${F.spd(l.vt)}` : '(bye)';
if (args.includes('--json')) {
  const strip = l => l && {who: F.who(l.e), name: l.e.name, plate: l.e.plate, model: l.e.model, tune: l.tune, dial: l.dial, rt: l.rt, red: l.red, t60: +l.t60.toFixed(3), t8: +l.t8.toFixed(3), et: +l.et.toFixed(3), vt_mph: +(l.vt * 2.236936).toFixed(1), vt_kmh: +(l.vt * 3.6).toFixed(1)};
  console.log(JSON.stringify({date, heats: d.heats.map(h => ({id: h.id, label: h.label, win: h.win, lanes: h.lanes.map(strip)})), champion: d.champ && F.who(d.champ)}, null, 1));
  process.exit(0);
}
console.log(`Drag Strip · ${date} · ${d.heats.length} heats (computed in ${t1 - t0} ms, week in ${t2 - t1} ms)`);
for (const h of d.heats.filter(h => h.round !== 'q')) console.log(`${h.label.padEnd(16)} ${lane(h.lanes[0])}\n${''.padEnd(16)} ${lane(h.lanes[1])}  -> ${h.lanes[h.win] ? F.who(h.lanes[h.win].e) : ''}`);
console.log('Top qualifiers (package):'); d.quali.slice(0, 10).forEach((l, k) => console.log(`${String(k + 1).padStart(2)}. ${lane(l)}`));
console.log('Quickest today:'); d.fast.slice(0, 5).forEach((l, k) => console.log(`${String(k + 1).padStart(2)}. ${lane(l)}`));
console.log('Fastest this week:'); wk.slice(0, 10).forEach((l, k) => console.log(`${String(k + 1).padStart(2)}. ${l.date} ${lane(l)}`));
