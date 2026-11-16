// Motoropolis recorder: films a Short from a shot list on the viewer's own GPU.
// rec/?s=<shots file name>  (files live in rec/shots/<name>.json)
(function () {
  const W = 1080, H = 1920, FPS = 30, PI = Math.PI;
  const E = x => x < 0 ? 0 : x > 1 ? 1 : (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const L = (a, b, k) => a + (b - a) * k;
  const qs = new URLSearchParams(location.search), NAME = (qs.get('s') || '').replace(/[^a-z0-9_-]/gi, '');
  const FONT = "'Barlow Condensed','Arial Narrow',sans-serif";
  const css = document.createElement('style');
  css.textContent = `body.recmode{background:#0b0e13!important;overflow:hidden}body.recmode *{visibility:hidden}
  body.recmode #screen,body.recmode #screen *{visibility:visible}body.recmode #screen .viewbar,body.recmode #screen .viewbar *{visibility:hidden!important}
  body.recmode #screen{position:fixed!important;left:12px;top:12px;width:540px!important;height:960px!important;max-width:none!important;aspect-ratio:auto!important;border-radius:6px;border:0;z-index:5}
  #recp,#recp *{visibility:visible!important}#recp{position:fixed;left:572px;top:12px;width:min(420px,calc(100vw - 590px));background:#151a22;color:#eef0f2;border:1px solid #333a45;border-radius:10px;padding:18px;font:15px/1.45 Barlow,system-ui,sans-serif;z-index:9}
  #recp h2{margin:0 0 6px;font:800 26px ${FONT};letter-spacing:.02em}#recp button{font:800 20px ${FONT};padding:12px 20px;border-radius:8px;border:0;cursor:pointer;margin:6px 8px 6px 0}
  #recp .go{background:#e8322a;color:#fff}#recp .pv{background:#262b34;color:#fff;border:1px solid #333a45}#recp .bar{height:10px;background:#262b34;border-radius:5px;overflow:hidden;margin:12px 0 6px}#recp .bar i{display:block;height:100%;width:0;background:#ff7a1a}
  #recp .msg{color:#9aa3ae;font-size:14px}#recp .ok{color:#5cc98a;font-weight:600}#recp .bad{color:#ff5a4f;font-weight:600}`;
  document.head.appendChild(css);
  const P = document.createElement('div'); P.id = 'recp';
  P.innerHTML = `<h2>🎬 MOTOROPOLIS RECORDER</h2><div class="msg" id="rInfo">Loading the city…</div>
  <div><button class="go" id="rGo" disabled>● RECORD</button><button class="pv" id="rPv" disabled>▶ PREVIEW</button></div>
  <div class="bar"><i id="rBar"></i></div><div class="msg" id="rState">Keep this tab in front while it records.</div>`;
  document.body.appendChild(P); document.body.classList.add('recmode');
  const $ = id => document.getElementById(id), info = $('rInfo'), st = $('rState'), bar = $('rBar');
  window.__PR = 2; window.dispatchEvent(new Event('resize'));
  let SH = null;
  const comp = document.createElement('canvas'); comp.width = W; comp.height = H; const cx = comp.getContext('2d');
  const ov = document.createElement('canvas'); ov.width = W; ov.height = H;
  let mini = null;
  const T = (c, txt, x, y, size, col) => { c.font = `800 ${size}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round'; c.lineWidth = size * .16; c.strokeStyle = '#071a2d'; c.strokeText(txt, x, y); c.fillStyle = col; c.fillText(txt, x, y) };
  function overlay(ovs, t, end) {
    const c = ov.getContext('2d'); c.clearRect(0, 0, W, H);
    let g = c.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, 'rgba(7,18,32,.88)'); g.addColorStop(1, 'rgba(7,18,32,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 640);
    g = c.createLinearGradient(0, 1380, 0, H); g.addColorStop(0, 'rgba(7,18,32,0)'); g.addColorStop(1, 'rgba(7,18,32,.85)'); c.fillStyle = g; c.fillRect(0, 1380, W, 540);
    c.font = `800 34px ${FONT}`; c.textAlign = 'center'; c.fillStyle = '#ff7a1a'; c.fillText('MOTOROPOLIS · TORQUEBLUEPRINT', 540, 110);
    for (const o of ovs || []) {
      if (t < o.t0 || (o.until && t > o.until)) continue; const k = Math.min(1, (t - o.t0) / .25), s = .7 + .3 * (1 - Math.pow(1 - k, 3));
      c.save(); c.globalAlpha = Math.min(1, k * 2); c.translate(540, o.y); c.scale(s, s);
      if (o.small) { c.font = `800 58px ${FONT}`; c.fillStyle = 'rgba(7,26,45,.9)'; const w = c.measureText(o.small).width + 60; c.beginPath(); c.roundRect(-w / 2, -56, w, 78, 39); c.fill(); c.fillStyle = '#ffd34d'; c.textAlign = 'center'; c.fillText(o.small, 0, 6) }
      if (o.lines) { let y = 0; for (const [tx, sz, col] of o.lines) { T(c, tx, 0, y, sz * 1.1, col); y += sz * 1.12 } }
      if (o.bubble) { const pu = 1 + .025 * Math.sin(t * 5); c.scale(pu, pu); c.fillStyle = '#fff'; c.beginPath(); c.roundRect(-480, -95, 960, 190, 40); c.fill(); c.beginPath(); c.moveTo(-300, 90); c.lineTo(-360, 170); c.lineTo(-220, 92); c.fill();
        c.textAlign = 'center'; c.fillStyle = '#071a2d'; c.font = `800 44px ${FONT}`; c.fillText(o.bubbleTop || '💬 TELL ME IN THE COMMENTS', 0, -22); c.fillStyle = '#ff7a1a'; c.font = `800 66px ${FONT}`; c.fillText(o.bubble, 0, 54) }
      c.restore()
    }
    if (end && t > .3) {
      const k = Math.min(1, (t - .3) / .5), s = .8 + .2 * (1 - Math.pow(1 - k, 3)); c.save(); c.globalAlpha = k; c.translate(540, 0);
      c.save(); c.translate(0, 1000); c.scale(s, s); const mw = 900, mh = 506; c.fillStyle = '#071a2d'; c.beginPath(); c.roundRect(-mw / 2 - 14, -mh / 2 - 14, mw + 28, mh + 28, 24); c.fill(); c.strokeStyle = '#46c8ff'; c.lineWidth = 4; c.stroke();
      if (mini) { c.save(); c.beginPath(); c.roundRect(-mw / 2, -mh / 2, mw, mh, 14); c.clip(); c.drawImage(mini, -mw / 2, -mh / 2, mw, mh); c.restore() } c.restore();
      T(c, '1 SUB = 1 CAR · JOIN MOTOROPOLIS', 0, 1380, 60, '#ffd34d');
      if (t > .8) { const pu = 1 + .03 * Math.sin(t * 5); c.save(); c.translate(0, 1560); c.scale(pu, pu); c.fillStyle = '#e8322a'; c.beginPath(); c.roundRect(-380, -80, 760, 160, 80); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-300, -36); c.lineTo(-300, 36); c.lineTo(-240, 0); c.fill(); c.textAlign = 'center'; c.font = `800 84px ${FONT}`; c.fillText('SUBSCRIBE', 40, 30); c.restore();
        c.font = `700 40px ${FONT}`; c.fillStyle = '#c9d6e6'; c.textAlign = 'center'; c.fillText('Live city linked on my channel page', 0, 1720) }
      c.restore()
    }
  }
  // camera for a shot: {cam:{from:{tx,tz,yaw,pitch,dist,fov},to:{...},ease:true}} or {follow:{glb,phi,pitch,dist,sweep}}
  function camAt(S, t, st) {
    const u = S.dur ? t / S.dur : 0;
    if (S.follow && st.id != null) { const q = window.__H.pos(st.id); if (q) { const f = S.follow; if (st.ya == null) st.ya = q.a; let da = q.a - st.ya; while (da > PI) da -= 2 * PI; while (da < -PI) da += 2 * PI; st.ya += da * .08; const ph = f.phi + (f.sweep || 0) * (u - .5); return { tx: q.x, tz: q.z, yaw: PI / 2 - (st.ya + ph), pitch: f.pitch || .3, dist: f.dist || 9.5, fov: f.fov || 50 } } }
    const a = S.cam.from, b = S.cam.to || a, k = S.cam.ease === false ? u : E(u); const o = {}; for (const key of ['tx', 'tz', 'yaw', 'pitch', 'dist', 'fov']) o[key] = L(a[key] ?? 50, b[key] ?? a[key] ?? 50, k); return o
  }
  function snapMini() {
    const H2 = window.__H, R = H2.R3(); Object.assign(R.cam, { tx: 96, tz: 72, yaw: PI - .25, pitch: .9, dist: 300 }); R.camera.fov = 40; R.camera.updateProjectionMatrix(); R.frame(1 / 30);
    const src = R.renderer.domElement, sw = src.width, sh = src.width * 9 / 16; const m = document.createElement('canvas'); m.width = 1280; m.height = 720; m.getContext('2d').drawImage(src, 0, (src.height - sh) / 2, sw, sh, 0, 0, 1280, 720); mini = m
  }
  function compose(S, t) {
    const R = window.__H.R3(); cx.fillStyle = '#000'; cx.fillRect(0, 0, W, H); cx.drawImage(R.renderer.domElement, 0, 0, W, H);
    const hud = document.getElementById('hud3d'); if (hud) cx.drawImage(hud, 0, 0, W, H); overlay(S.txt, t, !!S.end); cx.drawImage(ov, 0, 0)
  }
  async function run(record) {
    const H2 = window.__H, R = H2.R3(); $('rGo').disabled = $('rPv').disabled = true;
    H2.trailer(true); H2.hud(false); H2.light(SH.light || 'dia'); window.__MANUAL = true; snapMini();
    const total = SH.shots.reduce((a, s) => a + Math.round(s.dur * FPS), 0); let F = 0, rec = null, chunks = [], track = null, slow = 0;
    const view = document.createElement('canvas'); // what the viewer sees while it records
    if (record) {
      const stream = comp.captureStream(0); track = stream.getVideoTracks()[0];
      const types = ['video/mp4;codecs=avc1.640028', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
      const mime = types.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
      if (!mime) { st.innerHTML = '<span class="bad">This browser cannot record video. Please use Chrome or Edge.</span>'; return }
      rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 24e6 }); rec.ondataavailable = e => e.data.size && chunks.push(e.data); rec.start(1000)
    }
    const used = []; const t0 = performance.now();
    for (const S of SH.shots) {
      const n = Math.round(S.dur * FPS), sst = {};
      if (S.follow) { for (let k = 0; k < 40 && sst.id == null; k++) { const c = H2.pick(S.follow.glb, used); if (c) { sst.id = c.id; used.push(c.id) } else H2.step(2) } }
      for (let k = 0; k < n; k++, F++) {
        const due = t0 + F * 1000 / FPS; const now = performance.now(); if (now < due) await new Promise(r => setTimeout(r, due - now)); else if (now - due > 1000 / FPS) slow++;
        const t = k / FPS; H2.step(1 / FPS); const cam = camAt(S, t, sst); Object.assign(R.cam, { tx: cam.tx, tz: cam.tz, yaw: cam.yaw, pitch: cam.pitch, dist: cam.dist });
        if (cam.fov && R.camera.fov !== cam.fov) { R.camera.fov = cam.fov; R.camera.updateProjectionMatrix() } R.frame(1 / FPS); compose(S, t); if (track && track.requestFrame) track.requestFrame();
        if (F % 6 === 0) { bar.style.width = (100 * F / total).toFixed(1) + '%'; st.textContent = (record ? 'Recording… ' : 'Preview… ') + Math.round(100 * F / total) + '%' }
      }
    }
    bar.style.width = '100%';
    if (rec) {
      await new Promise(r => { rec.onstop = r; rec.stop() }); const blob = new Blob(chunks, { type: rec.mimeType }); const ext = rec.mimeType.includes('mp4') ? 'mp4' : 'webm';
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `motoropolis-${NAME}-${total}f.${ext}`; document.body.appendChild(a); a.click();
      st.innerHTML = `<span class="ok">Done! The video was downloaded (${(blob.size / 1e6).toFixed(1)} MB, ${total} frames).</span> Send it to Claude.` + (slow > total * .1 ? ` <span class="bad">Your PC fell behind on ${slow} frames; that is fine, Claude fixes the timing.</span>` : '')
    } else st.textContent = 'Preview finished.';
    window.__MANUAL = false; $('rGo').disabled = $('rPv').disabled = false
  }
  async function boot() {
    if (!NAME) { info.innerHTML = '<span class="bad">No shot list. Open this page with ?s=NAME.</span>'; return }
    try { SH = await (await fetch('shots/' + NAME + '.json?v=' + Date.now(), { cache: 'no-store' })).json() } catch (e) { info.innerHTML = '<span class="bad">Shot list "' + NAME + '" not found.</span>'; return }
    const dur = SH.shots.reduce((a, s) => a + s.dur, 0);
    info.innerHTML = `<b>${SH.title || NAME}</b><br>${SH.shots.length} shots · ${dur.toFixed(1)} s · 1080×1920 · 30 fps<br>Press RECORD and wait about ${Math.ceil(dur)} seconds. The video downloads by itself.`;
    const wait = () => new Promise(r => { const k = () => window.__H && window.__H.R3() ? r() : setTimeout(k, 300); k() }); await wait();
    window.__H.step(SH.warmup || 40); $('rGo').disabled = $('rPv').disabled = false; $('rGo').onclick = () => run(true); $('rPv').onclick = () => run(false)
  }
  boot()
})();
