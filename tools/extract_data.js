#!/usr/bin/env node
/* One-shot migration: move data literals out of src/js partials into src/data/*.json.
 * Each literal `NAME=<literal>` is evaluated (it must be a pure literal: no variables, no functions),
 * written as JSON, and replaced in the partial by `NAME=@@JSON:<file>@@`. tools/build.py puts the JSON
 * back (compact) at build time, so the page gets the same values. Already-migrated names are skipped. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, '..', 'src');
// [partial, name, json file, prefix before the literal (default `const NAME=`)]
const T = [
  ['data/catalog.js', 'MODELS', 'cars/models.json'],
  ['data/catalog.js', 'CAR_GLB', 'cars/car_glb.json'],
  ['data/catalog.js', 'COLORS', 'cars/colors.json'],
  ['data/catalog.js', 'FAULTS', 'cars/faults.json'],
  ['data/catalog.js', 'INSP', 'cars/inspections.json'],
  ['data/catalog.js', 'PARTS', 'cars/parts.json'],
  ['sim/milestones.js', 'MILESTONES', 'buildings/milestones.json'],
  ['sim/milestones.js', 'WORLD_MS', 'buildings/world_milestones.json', 'const WORLD_MS=WORLD?'],
  ['buildings/layout.js', 'WMAP', 'buildings/world_map.json'],
  ['people/jobs.js', 'CIVIC', 'jobs/civic.json'],
  ['people/jobs.js', 'JOB_LIST', 'jobs/job_list.json'],
  ['people/job_models.js', 'JOB_GLB', 'jobs/job_models.json', ' const JOB_GLB='],
  ['people/walkers.js', 'PED_COLS', 'people/shirt_colors.json'],
  ['people/walkers.js', 'SKIN', 'people/skin_tones.json'],
];
function literalEnd(s, i) { // i at '[' or '{'; returns index after the matching bracket
  let d = 0, q = null;
  for (let k = i; k < s.length; k++) {
    const c = s[k];
    if (q) {if (c === '\\') k++; else if (c === q) q = null; continue}
    if (c === '"' || c === "'" || c === '`') q = c;
    else if (c === '[' || c === '{') d++;
    else if (c === ']' || c === '}') {if (--d === 0) return k + 1}
  }
  throw new Error('unbalanced literal');
}
for (const [file, name, out, pre0] of T) {
  const p = path.join(SRC, 'js', file); let s = fs.readFileSync(p, 'utf8');
  const pre = pre0 || `const ${name}=`;
  const i = s.indexOf(pre); if (i < 0) throw new Error(name + ' not found in ' + file);
  const a = i + pre.length;
  if (s.startsWith('@@JSON:', a)) {console.log('skip', name); continue}
  const b = literalEnd(s, a), lit = s.slice(a, b);
  const val = vm.runInNewContext('(' + lit + ')', Object.create(null)); // throws on any free variable
  const json = JSON.stringify(val);
  // the value must survive the JSON round trip exactly
  const back = JSON.parse(json);
  const same = (x, y) => typeof x === typeof y && (x === null || typeof x !== 'object' ? Object.is(x, y) :
    Array.isArray(x) === Array.isArray(y) && Object.keys(x).length === Object.keys(y).length && Object.keys(x).every((k, n) => Object.keys(y)[n] === k && same(x[k], y[k])));
  if (!same(val, back)) throw new Error(name + ' does not survive JSON');
  if (json.includes('</')) throw new Error(name + ' contains </');
  const o = path.join(SRC, 'data', out); fs.mkdirSync(path.dirname(o), {recursive: true});
  fs.writeFileSync(o, JSON.stringify(val, null, 1) + '\n');
  s = s.slice(0, a) + `@@JSON:${out}@@` + s.slice(b);
  fs.writeFileSync(p, s);
  console.log(name, '->', 'src/data/' + out, json.length, 'bytes');
}
