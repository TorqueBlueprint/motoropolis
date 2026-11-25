#!/usr/bin/env node
/* Motoropolis regression snapshots.
 *
 * Serves two copies of the site (BASE = the live code, CAND = this worktree), opens the same pages in
 * Playwright Chromium (SwiftShader WebGL), drives both with the same seeded Math.random, frozen Date and
 * a virtual animation clock, takes screenshots of fixed camera views (city overview, streets, every interior
 * via window.__R3().enterIn(type)) and writes, per view, a side-by-side image (BASE | CAND | DIFF) plus a
 * pixel-diff score. A metrics mode measures load size, time to first 3D frame, fps and renderer.info.
 *
 *   node tools/test_snapshots.js                       # snapshots of root + world, all interiors
 *   node tools/test_snapshots.js --pages root,xmas,remake,perf,rec --interiors none
 *   node tools/test_snapshots.js --metrics --pages root,world   # size / first frame / fps, no snapshots
 *
 * Options: --base DIR (default /home/claude/motoropolis)  --cand DIR (default: the repo holding this file)
 *          --out DIR  --pages list  --interiors all|none|a,b  --views all|none|a,b  --only base|cand
 *          --query 'lod=cars:250' (appended to every page URL)  --frames N (simulation frames before the shots, default 8)
 *          --verbose  --batch N (interiors per page load, default 6)  --w 1000 --h 700  --three FILE --addons DIR
 * Needs a local copy of three r169 (the CDN is routed to it): --three .../three.module.js, --addons .../examples/jsm
 * (or env THREE_LOCAL / THREE_ADDONS). Fonts from Google are stubbed with empty CSS on both sides.
 * Only the localhost hooks (window.__R3) are used, so nothing in the pages has to change for the test.
 */
'use strict';
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path'), net = require('net'), {spawn} = require('child_process');

const SP = '/tmp/claude-0/-home-claude/0e0cee24-5f09-50f8-8f03-6b022829638d/scratchpad';
const argv = process.argv.slice(2), opt = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]; if (!a.startsWith('--')) continue;
  const k = a.slice(2), v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; opt[k] = v;
}
const BASE = path.resolve(opt.base || '/home/claude/motoropolis');
const CAND = path.resolve(opt.cand || path.join(__dirname, '..'));
const OUT = path.resolve(opt.out || path.join(SP, 'v2', 'snap'));
const THREE = opt.three || process.env.THREE_LOCAL || path.join(SP, 'proto/three.module.js');
const ADDONS = opt.addons || process.env.THREE_ADDONS || path.join(SP, 'proto/tjsrepo/examples/jsm');
const W = +(opt.w || 1000), H = +(opt.h || 700), BATCH = +(opt.batch || 6);
const PAGES = String(opt.pages || 'root,world,xmas,remake,perf,rec').split(',').filter(Boolean);
const SIDES = opt.only ? [opt.only] : ['base', 'cand'];
const METRICS = !!opt.metrics;

const PAGE_URL = {root: '/', world: '/world/', xmas: '/xmas/', remake: '/remake/', perf: '/perf/', rec: '/rec/'};
const INTERIORS = ['oficina', 'lavagem', 'reboques', 'bomba', 'pneus', 'inspecao', 'parque', 'pecas', 'stand', 'sucata',
  'fabrica', 'pista', 'stadium', 'market', 'news', 'police', 'court', 'santa'];
// fixed city cameras (world grid: x 10..354, z 10..190 in 3D units)
const VIEWS = {
  overview: null, // the page's own home camera
  downtown: {tx: 140, tz: 70, yaw: .7, pitch: .55, dist: 150},
  street: {tx: 96, tz: 40, yaw: 2.2, pitch: .32, dist: 55},
  river: {tx: 230, tz: 100, yaw: -.4, pitch: .6, dist: 220},
  xmasStreet: {tx: 60, tz: 100, yaw: .3, pitch: .45, dist: 90},
};
const pick = (v, all) => v === undefined || v === 'all' ? all : v === 'none' ? [] : String(v).split(',');
const VIEW_LIST = pick(opt.views, Object.keys(VIEWS));
const INT_LIST = pick(opt.interiors, INTERIORS);

// ---------- deterministic page environment (installed before any page script) ----------
const INIT = `(()=>{
 // seeded Math.random; three.js object UUIDs (generateUUID) draw from their own stream, so creating more or fewer
 // meshes (instancing, batching) does not shift the random numbers the city itself uses
 const mk=s=>()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const rA=mk(0x5eed),rU=mk(0xbeef);
 Math.random=()=>{const L=Error.stackTraceLimit;Error.stackTraceLimit=2;const st=new Error().stack;Error.stackTraceLimit=L;return st.includes('generateUUID')?rU():rA()};
 const FIX=Date.UTC(2026,11,10,15,0,0),RD=Date;
 class D extends RD{constructor(...a){if(a.length)super(...a);else super(FIX)}static now(){return FIX}}
 window.Date=D;
 let vt=0;const realNow=performance.now.bind(performance);performance.now=()=>vt;
 const q=[],tm=[];let tid=1e6;
 window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 const st=window.setTimeout.bind(window);
 window.setTimeout=(f,ms,...a)=>{if((ms|0)>=1000){const id=++tid;tm.push({id,at:vt+ms,f,a});return id}return st(f,ms,...a)};
 const ct=window.clearTimeout.bind(window);window.clearTimeout=id=>{const i=tm.findIndex(t=>t.id===id);if(i>=0)tm.splice(i,1);else ct(id)};
 const si=window.setInterval.bind(window);window.setInterval=(f,ms,...a)=>(ms|0)>=1000?0:si(f,ms,...a);
 window.__pump=(n,dt)=>{for(let i=0;i<n;i++){vt+=dt*1000;for(let j=0;j<tm.length;j++){if(tm[j].at<=vt){const t=tm.splice(j--,1)[0];try{t.f(...t.a)}catch(e){console.error(e)}}}const cbs=q.splice(0);for(const cb of cbs)cb(vt)}};
 let inflight=0,lastNet=realNow();const of=window.fetch.bind(window);
 window.fetch=(...a)=>{inflight++;lastNet=realNow();return of(...a).then(r=>{const b=r.clone();b.arrayBuffer().catch(()=>{}).finally(()=>{inflight--;lastNet=realNow()});return r},e=>{inflight--;lastNet=realNow();throw e})};
 window.__inf=()=>inflight;window.__netIdle=ms=>inflight===0&&realNow()-lastNet>ms;
 window.__MANUAL=false; // set to true only for the capture frames (forces a shadow-map update)
 try{localStorage.setItem('mtp-view','3d');localStorage.removeItem('mtp-quality')}catch(e){}
})();`;
// metrics mode: real clock, only count frames
const INIT_METRICS = `(()=>{
 let s=0x5eed;Math.random=()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const raf=window.requestAnimationFrame.bind(window);window.__frames=0;window.__first3d=0;
 window.requestAnimationFrame=cb=>raf(ts=>{window.__frames++;cb(ts);if(!window.__first3d&&window.__R3&&window.__R3()){window.__first3d=performance.now()}});
 let inflight=0,lastNet=performance.now();const of=window.fetch.bind(window);
 window.fetch=(...a)=>{inflight++;lastNet=performance.now();return of(...a).then(r=>{const b=r.clone();b.arrayBuffer().catch(()=>{}).finally(()=>{inflight--;lastNet=performance.now()});return r},e=>{inflight--;lastNet=performance.now();throw e})};
 window.__inf=()=>inflight;window.__netIdle=ms=>inflight===0&&performance.now()-lastNet>ms;
 try{localStorage.setItem('mtp-view','3d');localStorage.removeItem('mtp-quality')}catch(e){}
})();`;

// ---------- helpers ----------
const freePort = () => new Promise(r => {const s = net.createServer(); s.listen(0, '127.0.0.1', () => {const p = s.address().port; s.close(() => r(p))})});
async function serve(dir) {
  const port = await freePort();
  const p = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', dir], {stdio: 'ignore'});
  for (let i = 0; i < 50; i++) {
    const ok = await new Promise(r => {const c = net.connect(port, '127.0.0.1', () => {c.end(); r(true)}); c.on('error', () => r(false))});
    if (ok) break; await new Promise(r => setTimeout(r, 100));
  }
  return {port, stop: () => p.kill()};
}
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const launch = () => chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});

async function openPage(browser, port, pageKey, metrics) {
  const ctx = await browser.newContext({viewport: {width: W, height: H}, deviceScaleFactor: 1});
  const p = await ctx.newPage();
  const errs = [], net = {local: 0, cdn: 0, n: 0};
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('crash', () => log('  PAGE CRASHED (out of memory?)'));
  p.on('console', m => {if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 200))});
  if (metrics) { // bytes on the wire for the local server (CDP), CDN files are counted where they are routed
    const cdp = await ctx.newCDPSession(p); await cdp.send('Network.enable'); const urls = {};
    cdp.on('Network.responseReceived', e => {urls[e.requestId] = e.response.url});
    cdp.on('Network.loadingFinished', e => {const u = urls[e.requestId] || ''; if (u.startsWith('http://localhost:')) {net.local += e.encodedDataLength; net.n++}});
  }
  await p.addInitScript(metrics ? INIT_METRICS : INIT);
  await p.route('https://cdn.jsdelivr.net/**', r => {
    const u = r.request().url(); let f;
    if (u.includes('/build/three.module.js')) f = THREE; else {const i = u.indexOf('/examples/jsm/'); f = path.join(ADDONS, u.slice(i + 14))}
    const body = fs.readFileSync(f); net.cdn += body.length;
    r.fulfill({status: 200, contentType: 'application/javascript', headers: {'access-control-allow-origin': '*'}, body});
  });
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({status: 200, contentType: 'text/css', body: ''}));
  const t0 = Date.now();
  await p.goto(`http://localhost:${port}${PAGE_URL[pageKey]}${opt.query ? '?' + opt.query : ''}`, {waitUntil: 'load', timeout: 300000});
  await p.waitForFunction(() => window.__R3 && window.__R3(), null, {timeout: 900000, polling: 500});
  const tR3 = Date.now() - t0;
  await waitIdle(p);
  return {ctx, p, errs, net, tR3, t0};
}
async function pump(p, n) {
  const t0 = Date.now();
  const ft = [];
  for (let i = 0; i < n; i++) {const t = Date.now(); await p.evaluate(() => window.__pump(1, .05)); ft.push(((Date.now() - t) / 1000).toFixed(1))}
  if (opt.verbose) log(`  pumped ${n} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s [${ft.join(' ')}]`);
}
async function waitIdle(p, ms = 1500) {
  const t0 = Date.now();
  await p.waitForFunction(ms => window.__netIdle(ms), ms, {timeout: 600000, polling: 300}).catch(() => log('  (network not idle, continuing)'));
  if (opt.verbose) log(`  network idle after ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
// render one frame (shadow map forced fresh) and grab the 3D canvas + HUD overlay in the same task (the WebGL
// buffer is not preserved between tasks). The HUD panels with the channel numbers (top-left milestone card,
// top-right counters) are blanked: they are not part of the city and must not appear in shared images.
async function grab(p, view, interior) {
  const url = await p.evaluate(([v, interior]) => {
    const R = window.__R3(); R.reset(); if (v) Object.assign(R.cam, v);
    window.__MANUAL = true; R.frame(1e-4); window.__MANUAL = false;
    const c3 = R.renderer.domElement, hud = document.getElementById('hud3d');
    const x = document.createElement('canvas'); x.width = c3.width; x.height = c3.height; const g = x.getContext('2d');
    g.drawImage(c3, 0, 0); if (hud && !hud.hidden) g.drawImage(hud, 0, 0, x.width, x.height);
    if (!interior) {g.fillStyle = '#000'; g.fillRect(x.width * .69, 0, x.width * .31, x.height * .095); g.fillRect(0, 0, x.width * .27, x.height * .245)}
    return x.toDataURL('image/png');
  }, [view || null, !!interior]);
  return Buffer.from(url.split(',')[1], 'base64');
}
async function shootCity(p, view) {return grab(p, view, false)}
async function shootInterior(p, type) {
  // enter: one frame of 0.71 s completes the fade (stepFade: fade += dt/.35), no simulation step in between
  const ok = await p.evaluate(t => {const R = window.__R3(); if (R.mode() === 'in') return false; R.enterIn(t); R.frame(.71); return R.mode() === 'in'}, type);
  if (!ok) return null;
  await waitIdle(p, 1200);                                   // on-demand models for the people inside
  await p.evaluate(() => {const R = window.__R3(); for (let k = 0; k < 2; k++) R.frame(.05)});
  await waitIdle(p, 800);
  const buf = await grab(p, null, true);
  await p.evaluate(() => {const R = window.__R3(); R.exitIn(); R.frame(.71)});
  return buf;
}

async function runSide(side, dir) {
  const srv = await serve(dir); const res = {};
  log(`[${side}] serving ${dir} on ${srv.port}`);
  try {
    for (const pg of PAGES) {
      const outDir = path.join(OUT, side); fs.mkdirSync(outDir, {recursive: true});
      const jobs = [];
      const ints = pg === 'root' ? INT_LIST : []; // the other pages run the same interior code
      const views = pg === 'root' || pg === 'world' ? VIEW_LIST : VIEW_LIST.slice(0, 1);
      jobs.push(['city', views]);
      for (let i = 0; i < ints.length; i += BATCH) jobs.push(['int', ints.slice(i, i + BATCH)]);
      for (const [kind, list] of jobs) {
        if (!list.length) continue;
        const browser = await launch();
        try {
          log(`[${side}] ${pg}: loading for ${kind} ${list.join(',')}`);
          const {p, errs, tR3} = await openPage(browser, srv.port, pg, false);
          log(`[${side}] ${pg}: 3D ready in ${(tR3 / 1000).toFixed(1)}s`);
          await pump(p, +(opt.frames || 8)); // simulated time, same on both sides
          await waitIdle(p);
          if (pg === 'rec') res[pg + '_hooks'] = await p.evaluate(() => ({H: !!window.__H, R3: !!window.__R3, PEDH: !!window.__PEDH, XMS: !!window.__XMS}));
          for (const name of list) {
            const buf = kind === 'city' ? await shootCity(p, VIEWS[name]) : await shootInterior(p, name);
            const key = `${pg}_${kind === 'city' ? name : 'in_' + name}`;
            if (!buf) {log(`[${side}]   ${key}: skipped (not available)`); res[key] = null; continue}
            fs.writeFileSync(path.join(outDir, key + '.png'), buf); res[key] = 'ok';
            log(`[${side}]   ${key}`);
          }
          res[`${pg}_${kind}_errors_${list[0]}`] = errs.filter(e => !/GPU stall|swiftshader|WebGL|fonts/i.test(e)).slice(0, 20);
        } catch (e) {log(`[${side}] ${pg} ${kind} FAILED: ${e.message.split('\n')[0]}`); res[`${pg}_${kind}_fail_${list[0]}`] = e.message.split('\n')[0]}
        finally {await browser.close()}
      }
    }
  } finally {srv.stop()}
  return res;
}

async function runMetrics(side, dir) {
  const srv = await serve(dir); const res = {};
  try {
    for (const pg of PAGES) {
      const browser = await launch();
      try {
        const {p, net, tR3, errs} = await openPage(browser, srv.port, pg, true);
        const m = await p.evaluate(async () => {
          const R = window.__R3(); const nav = performance.getEntriesByType('navigation')[0];
          await new Promise(r => setTimeout(r, 3000));
          const f0 = window.__frames, t0 = performance.now(); await new Promise(r => setTimeout(r, 15000));
          const fps = (window.__frames - f0) / ((performance.now() - t0) / 1000);
          const gl = R.renderer.getContext(); const ft = [];
          for (let k = 0; k < 4; k++) {const t = performance.now(); R.frame(1 / 60); gl.finish(); ft.push(performance.now() - t)}
          for (let k = 0; k < 4; k++) {const t = performance.now(); R.frame(1 / 60); gl.finish(); ft.push(performance.now() - t)}
          ft.shift(); // frames with and without a shadow-map update alternate (adaptive shadow throttling)
          const frameMs = {min: Math.round(Math.min(...ft)), max: Math.round(Math.max(...ft)), avg: Math.round(ft.reduce((a, b) => a + b, 0) / ft.length)};
          const i = R.renderer.info;
          return {frameMs, firstFrameMs: Math.round(window.__first3d), domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd), fps: +fps.toFixed(2),
            calls: i.render.calls, triangles: i.render.triangles, geometries: i.memory.geometries, textures: i.memory.textures, programs: (i.programs || []).length,
            shadowCasters: (() => {let n = 0; R.scene.traverse(o => {if (o.castShadow && (o.isMesh || o.isInstancedMesh)) n++}); return n})(),
            meshes: (() => {let n = 0; R.scene.traverse(o => {if (o.isMesh) n++}); return n})()};
        });
        res[pg] = {...m, readyMs: tR3, localMB: +(net.local / 1048576).toFixed(2), cdnMB: +(net.cdn / 1048576).toFixed(2), requests: net.n, errors: errs.length};
        log(`[${side}] metrics ${pg}`, JSON.stringify(res[pg]));
      } catch (e) {log(`[${side}] metrics ${pg} FAILED ${e.message.split('\n')[0]}`); res[pg] = {error: e.message.split('\n')[0]}}
      finally {await browser.close()}
    }
  } finally {srv.stop()}
  return res;
}

// ---------- comparison: BASE | CAND | DIFF, scored in the browser (no extra packages) ----------
async function compare() {
  const bd = path.join(OUT, 'base'), cd = path.join(OUT, 'cand'), sd = path.join(OUT, 'side');
  fs.mkdirSync(sd, {recursive: true});
  const names = fs.existsSync(bd) ? fs.readdirSync(bd).filter(f => f.endsWith('.png') && fs.existsSync(path.join(cd, f))).sort() : [];
  const browser = await chromium.launch(); const p = await browser.newPage(); const scores = {};
  for (const f of names) {
    const a = 'data:image/png;base64,' + fs.readFileSync(path.join(bd, f)).toString('base64');
    const b = 'data:image/png;base64,' + fs.readFileSync(path.join(cd, f)).toString('base64');
    const r = await p.evaluate(async ([a, b, label]) => {
      const load = s => new Promise(r => {const i = new Image(); i.onload = () => r(i); i.src = s});
      const [A, B] = await Promise.all([load(a), load(b)]); const w = A.width, h = A.height;
      const get = I => {const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(I, 0, 0); return g.getImageData(0, 0, w, h)};
      const da = get(A), db = get(B), out = new ImageData(w, h); let sum = 0, bad = 0;
      for (let i = 0; i < da.data.length; i += 4) {
        const d = (Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2])) / 3;
        sum += d; if (d > 16) bad++;
        const v = Math.min(255, d * 4), gy = (da.data[i] + da.data[i + 1] + da.data[i + 2]) / 12;
        out.data[i] = Math.max(gy, v); out.data[i + 1] = gy; out.data[i + 2] = gy; out.data[i + 3] = 255;
      }
      const n = w * h, s = document.createElement('canvas'); s.width = w * 3; s.height = h + 28; const g = s.getContext('2d');
      g.fillStyle = '#111'; g.fillRect(0, 0, s.width, s.height); g.drawImage(A, 0, 28); g.drawImage(B, w, 28); g.putImageData(out, w * 2, 28);
      g.fillStyle = '#fff'; g.font = 'bold 16px sans-serif';
      const meanAbs = sum / n, pct = 100 * bad / n;
      g.fillText(`${label}   BASE (main)`, 8, 19); g.fillText('CAND (city-v2)', w + 8, 19);
      g.fillText(`DIFF  mean ${meanAbs.toFixed(3)}  changed px ${pct.toFixed(3)}%`, 2 * w + 8, 19);
      return {meanAbs: +meanAbs.toFixed(4), changedPct: +pct.toFixed(4), png: s.toDataURL('image/png')};
    }, [a, b, f.replace('.png', '')]);
    fs.writeFileSync(path.join(sd, f), Buffer.from(r.png.split(',')[1], 'base64'));
    scores[f.replace('.png', '')] = {meanAbs: r.meanAbs, changedPct: r.changedPct};
  }
  await browser.close();
  return scores;
}

(async () => {
  fs.mkdirSync(OUT, {recursive: true});
  if (METRICS) {
    const all = {};
    for (const s of SIDES) all[s] = await runMetrics(s, s === 'base' ? BASE : CAND);
    fs.writeFileSync(path.join(OUT, 'metrics.json'), JSON.stringify(all, null, 1));
    log('metrics written to', path.join(OUT, 'metrics.json')); return;
  }
  const report = {base: BASE, cand: CAND, pages: PAGES, when: new Date().toISOString()};
  if (!opt['compare-only']) for (const s of SIDES) report[s] = await runSide(s, s === 'base' ? BASE : CAND);
  report.scores = await compare();
  const worst = Object.entries(report.scores).sort((a, b) => b[1].changedPct - a[1].changedPct);
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  log('side-by-side images in', path.join(OUT, 'side'));
  for (const [k, v] of worst) log(`  ${k.padEnd(28)} mean ${v.meanAbs.toFixed(3).padStart(7)}  changed ${v.changedPct.toFixed(3).padStart(7)}%`);
})().catch(e => {console.error(e); process.exit(1)});
