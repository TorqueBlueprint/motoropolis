/* Motoropolis Online, phase 1: YouTube sign-in, wallet, junior jobs, daily salary.
   Injected by tools/build_online.py as a second classic <script> after the city script.
   All money moves on the server (Supabase RPCs apply_job / claim_salary, edge function link-youtube);
   the page only reads the signed-in user's own rows (RLS). ?mock=1 renders the panel with fake local data
   and makes no network calls to Supabase. */
(function () {
  'use strict';
  var SB_URL = 'https://bxjitnmvmjbampgyrsxf.supabase.co';
  // public anon key (safe in client code: Row Level Security decides what it can read; it cannot move money)
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aml0bm12bWpiYW1wZ3lyc3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU4ODI4ODcsImV4cCI6MjExMTQ1ODg4N30.n4Zp4aOWve9Vv-fndRAXEB-EvO4izIjpxVB6aMLA9lE';
  var SB_LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
  var YT_SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';
  var qs = new URLSearchParams(location.search);
  var MOCK = qs.get('mock') === '1';

  var PLACES = {oficina: 'Repair shop', stand: 'Car dealership', inspecao: 'Inspection centre', reboques: 'Tow company',
    pneus: 'Tyre shop', fabrica: 'Car factory', taxi: 'Taxi rank', bus: 'Bus depot', pecas: 'Parts store',
    sucata: 'Scrapyard', lavagem: 'Car wash', bomba: 'Gas station', market: 'Supermarket', sanit: 'City sanitation',
    parque: 'Parking garage', news: 'Newspaper'};

  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function money(n) { n = Number(n) || 0; return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US'); }
  function lisbonParts(d) {
    var f = new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'});
    var o = {}; f.formatToParts(d || new Date()).forEach(function (p) { o[p.type] = p.value; }); return o;
  }
  function lisbonToday() { var p = lisbonParts(); return p.year + '-' + p.month + '-' + p.day; }
  function untilNextDay() {
    var p = lisbonParts(), s = 86400 - ((+p.hour) * 3600 + (+p.minute) * 60 + (+p.second));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h > 0 ? h + 'h ' + m + 'm' : Math.max(1, m) + 'm';
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleString('en-GB', {timeZone: 'Europe/Lisbon', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'}); } catch (e) { return ''; }
  }
  function safeImg(url) { return typeof url === 'string' && /^https:\/\//.test(url) ? url : ''; }
  function initials(s) { return (String(s || '?').replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2) || '?').toUpperCase(); }

  // ---------------------------------------------------------------- state
  var S = {ready: false, user: null, profile: null, balance: 0, job: null, ledger: [], claimedToday: false, jobs: [], busy: false};
  var sb = null;

  function mockState() {
    var today = lisbonToday();
    S.user = {id: 'mock'}; S.profile = {yt_title: 'Demo Driver', avatar_url: '', founder: false};
    S.jobs = [
      ['oficina.mechanic', 'oficina', 'Mechanic', 150, 30, 12], ['stand.salesman', 'stand', 'Car Salesman', 140, 10, 10],
      ['inspecao.inspector', 'inspecao', 'Inspector', 130, 10, 3], ['reboques.driver', 'reboques', 'Tow Truck Driver', 125, 15, 6],
      ['pneus.technician', 'pneus', 'Tire Technician', 115, 15, 2], ['lavagem.attendant', 'lavagem', 'Wash Attendant', 90, 10, 4],
      ['bomba.fuel', 'bomba', 'Fuel Attendant', 90, 5, 1], ['parque.attendant', 'parque', 'Parking Attendant', 80, 5, 0]
    ].map(function (r) { return {code: r[0], business: r[1], title: r[2], tier: 1, daily_salary: r[3], seats: r[4], taken: r[5]}; });
    S.job = {job_code: 'oficina.mechanic', since: new Date(Date.now() - 3 * 864e5).toISOString()};
    S.ledger = [3, 2, 1].map(function (d) {
      var t = new Date(Date.now() - d * 864e5); return {amount: 150, kind: 'salary', ref: 'oficina.mechanic:' + t.toISOString().slice(0, 10), created_at: t.toISOString()};
    }).reverse();
    S.balance = 450; S.claimedToday = false; S.ready = true; S.mockDay = today;
  }

  // ---------------------------------------------------------------- UI
  var panel, body, msgEl, top;
  function say(text, kind) {
    if (!msgEl) return;
    if (!text) { msgEl.hidden = true; msgEl.textContent = ''; return; }
    msgEl.hidden = false; msgEl.textContent = text; msgEl.className = 'on-msg' + (kind ? ' ' + kind : '');
  }
  function openPanel() { panel.hidden = false; render(); var x = $('onClose'); if (x) x.focus({preventScroll: true}); }
  function closePanel() { panel.hidden = true; }

  function ytIcon() {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', '22'); s.setAttribute('height', '22'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<rect x="1.5" y="5" width="21" height="14" rx="4" fill="currentColor"/><path d="m10 9 5 3-5 3z" fill="#fff"/>';
    return s;
  }
  function avatar(cls, url, name) {
    var u = safeImg(url);
    if (u) { var i = el('img', cls); i.src = u; i.alt = ''; i.referrerPolicy = 'no-referrer'; i.width = 52; i.height = 52; return i; }
    var d = el('span', (cls ? cls + ' ' : '') + 'on-ini', initials(name)); d.setAttribute('aria-hidden', 'true'); return d;
  }
  function renderTop() {
    top.textContent = '';
    if (S.user) {
      var b = el('button', 'on-btn on-chip'); b.type = 'button'; b.setAttribute('aria-haspopup', 'dialog');
      b.setAttribute('aria-label', 'My account');
      var name = S.profile && (S.profile.yt_title || S.profile.display_name) || 'My account';
      b.append(avatar('', S.profile && S.profile.avatar_url, name), el('b', null, money(S.balance)));
      b.addEventListener('click', function () { panel.hidden ? openPanel() : closePanel(); });
      top.append(b);
    } else {
      var s = el('button', 'on-btn on-yt'); s.type = 'button'; s.id = 'onSignIn';
      s.append(ytIcon(), el('span', null, 'Sign in with YouTube'));
      s.addEventListener('click', signIn);
      top.append(s);
    }
  }
  function jobByCode(c) { for (var i = 0; i < S.jobs.length; i++) if (S.jobs[i].code === c) return S.jobs[i]; return null; }
  function jobLabel(code) { var j = jobByCode(code); return j ? j.title : String(code || '').split('.').pop(); }

  function render() {
    renderTop();
    if (!body) return;
    body.textContent = '';
    if (!S.ready) { body.append(el('p', 'on-empty', 'Loading your account…')); return; }
    if (!S.user) {
      var sec = el('div', 'on-sec');
      sec.append(el('h3', null, 'Season 1 is open'), el('p', null, 'Everyone starts equal: $0, no house, no job. Sign in with your YouTube channel to open your wallet.'));
      var ol = el('ol', 'on-steps');
      ['Sign in with YouTube (read-only: we only read your channel name and picture).', 'Pick a junior job in the city.', 'Collect your salary once a day.'].forEach(function (t) { ol.append(el('li', null, t)); });
      var b = el('button', 'on-btn on-signin'); b.type = 'button'; b.append(ytIcon(), el('span', null, 'Sign in with YouTube'));
      b.addEventListener('click', signIn);
      sec.append(ol, b); body.append(sec); return;
    }
    var p = S.profile || {}, name = p.yt_title || p.display_name || 'New resident';
    var me = el('div', 'on-me'), tx = el('div');
    var nb = el('b', null, name); if (p.founder) nb.append(el('span', 'on-badge', 'Founder'));
    tx.append(nb, el('small', null, p.yt_title ? 'Season 1 resident' : 'YouTube channel not linked yet'));
    me.append(avatar('', p.avatar_url, name), tx); body.append(me);

    var grid = el('div', 'on-grid');
    var c1 = el('div', 'on-card'); c1.append(el('h3', null, 'Balance'), el('div', 'on-bal', money(S.balance)));
    var c2 = el('div', 'on-card'); c2.append(el('h3', null, 'Job'));
    var cur = S.job && jobByCode(S.job.job_code);
    if (S.job) {
      var jn = el('div', 'on-jobnow', jobLabel(S.job.job_code));
      jn.append(el('small', null, (cur ? (PLACES[cur.business] || cur.business) + ' · ' + money(cur.daily_salary) + '/day' : 'Junior')));
      c2.append(jn);
    } else c2.append(el('div', 'on-jobnow', 'Unemployed', null), el('small', 'on-empty', 'Find a job below'));
    grid.append(c1, c2); body.append(grid);

    var pay = el('button', 'on-btn on-pay'); pay.type = 'button'; pay.id = 'onPay';
    if (!S.job) { pay.disabled = true; pay.textContent = 'Get a job to earn a salary'; }
    else if (S.claimedToday) { pay.disabled = true; pay.textContent = 'Collected · next salary in ' + untilNextDay(); }
    else { pay.textContent = "Collect today's salary" + (cur ? ' · ' + money(cur.daily_salary) : ''); }
    if (S.busy) pay.disabled = true;
    pay.addEventListener('click', claim); body.append(pay);

    var js = el('div', 'on-sec');
    js.append(el('h3', null, S.job ? 'Junior jobs' : 'Unemployed — find a job'));
    js.append(el('p', null, S.job ? 'You can hold one job at a time. Quit yours to switch.' : 'Junior jobs are open to everyone. Pick one with a free seat.'));
    var ul = el('ul', 'on-jobs'), open = S.jobs.filter(function (j) { return j.tier === 1 && j.seats > 0; });
    open.forEach(function (j) {
      var free = Math.max(0, j.seats - (j.taken || 0)), li = el('li', 'on-job'), t = el('div', 'on-jt');
      t.append(el('b', null, j.title), el('small', null, (PLACES[j.business] || j.business) + ' · ' + (free ? free + ' of ' + j.seats + ' seats free' : 'Full')));
      var a = el('button', null, S.job && S.job.job_code === j.code ? 'Yours' : free ? 'Apply' : 'Full'); a.type = 'button';
      a.disabled = !!S.job || !free || S.busy;
      a.setAttribute('aria-label', 'Apply for ' + j.title);
      a.addEventListener('click', function () { apply(j.code); });
      li.append(t, el('span', 'on-sal', money(j.daily_salary) + '/day'), a); ul.append(li);
    });
    if (!open.length) ul.append(el('li', 'on-empty', 'No jobs listed right now.'));
    js.append(ul); body.append(js);

    var ls = el('div', 'on-sec'); ls.append(el('h3', null, 'History'));
    var led = el('ul', 'on-led');
    S.ledger.slice(0, 10).forEach(function (r) {
      var li = el('li'), sp = el('span'), lbl = r.kind === 'salary' ? 'Salary · ' + jobLabel(String(r.ref || '').split(':')[0]) : r.kind === 'signup' ? 'Welcome bonus' : r.kind === 'purchase' ? 'Purchase' : 'Adjustment';
      sp.append(document.createTextNode(lbl), el('small', null, fmtDate(r.created_at)));
      li.append(sp, el('b', r.amount < 0 ? 'neg' : '', (r.amount > 0 ? '+' : '') + money(r.amount))); led.append(li);
    });
    if (!S.ledger.length) led.append(el('li', 'on-empty', 'Nothing yet. Your first salary will show up here.'));
    ls.append(led); body.append(ls);

    var ft = el('div', 'on-foot');
    if (S.job) { var q = el('button', 'on-link on-quit', 'Quit my job'); q.type = 'button'; q.disabled = S.busy; q.addEventListener('click', quit); ft.append(q); }
    else ft.append(el('span'));
    var so = el('button', 'on-link', 'Sign out'); so.type = 'button'; so.addEventListener('click', signOut); ft.append(so);
    body.append(ft);
  }

  // ---------------------------------------------------------------- server
  function errText(e) {
    var m = (e && (e.message || e.error_description || e.error)) || String(e || 'Something went wrong');
    return m.charAt(0).toUpperCase() + m.slice(1) + (/[.!?]$/.test(m) ? '' : '.');
  }
  function loadLib() {
    if (sb) return Promise.resolve(sb);
    return import(SB_LIB).then(function (m) {
      sb = m.createClient(SB_URL, SB_KEY, {auth: {flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true}});
      return sb;
    });
  }
  function refresh() {
    if (MOCK) { render(); return Promise.resolve(); }
    if (!S.user) { S.ready = true; render(); return Promise.resolve(); }
    return Promise.all([
      sb.from('profiles').select('yt_title,avatar_url,display_name,founder').maybeSingle(),
      sb.from('wallets').select('balance').maybeSingle(),
      sb.from('employment').select('job_code,since').maybeSingle(),
      sb.from('ledger').select('amount,kind,ref,created_at').order('created_at', {ascending: false}).order('id', {ascending: false}).limit(10),
      sb.from('salary_claims').select('day').eq('day', lisbonToday()).maybeSingle(),
      sb.from('job_catalog').select('code,business,title,tier,daily_salary,seats,taken').eq('tier', 1).gt('seats', 0).order('daily_salary', {ascending: false}).order('title')
    ]).then(function (r) {
      var bad = r.filter(function (x) { return x.error; })[0]; if (bad) throw bad.error;
      S.profile = r[0].data; S.balance = r[1].data ? r[1].data.balance : 0; S.job = r[2].data;
      S.ledger = r[3].data || []; S.claimedToday = !!r[4].data; S.jobs = r[5].data || []; S.ready = true; render();
    }).catch(function (e) { S.ready = true; render(); say('Could not load your account. ' + errText(e), 'err'); });
  }

  function signIn() {
    if (MOCK) { openPanel(); say('Demo mode: sign-in is switched off. Remove ?mock=1 to use a real account.', ''); return; }
    openPanel(); say('Opening Google sign-in…', '');
    // check first that the Google provider is switched on, so people get a friendly message instead of a raw error page
    fetch(SB_URL + '/auth/v1/settings', {headers: {apikey: SB_KEY}}).then(function (r) { return r.json(); }).then(function (st) {
      if (!st || !st.external || !st.external.google) {
        say('Sign-in with YouTube is not open yet: the Mayor is still setting it up. Check back soon!', 'err'); return;
      }
      return loadLib().then(function () {
        var back = location.origin + location.pathname + (location.search || '');
        return sb.auth.signInWithOAuth({provider: 'google', options: {scopes: YT_SCOPE, redirectTo: back, queryParams: {prompt: 'select_account'}}});
      }).then(function (res) { if (res && res.error) throw res.error; });
    }).catch(function (e) {
      var m = errText(e);
      say(/provider is not enabled|unsupported provider/i.test(m) ? 'Sign-in with YouTube is not open yet: the Mayor is still setting it up. Check back soon!' : 'Could not start sign-in. ' + m, 'err');
    });
  }
  function linkYouTube(session) {
    if (!session || !session.provider_token) return Promise.resolve();
    say('Linking your YouTube channel…', '');
    return sb.functions.invoke('link-youtube', {body: {provider_token: session.provider_token}}).then(function (res) {
      if (res.error) {
        var ctx = res.error.context;
        return (ctx && ctx.json ? ctx.json().catch(function () { return {}; }) : Promise.resolve({})).then(function (j) { throw new Error(j && j.error || res.error.message); });
      }
      say('Welcome to Motoropolis Online, ' + (res.data && res.data.yt_title || 'driver') + '!', 'ok');
    }).catch(function (e) { say('Signed in, but your channel could not be linked. ' + errText(e), 'err'); });
  }
  function act(fn, okText) {
    if (S.busy) return; S.busy = true; render(); say('');
    return fn().then(function (res) {
      if (res && res.error) throw res.error;
      S.busy = false; if (okText) say(typeof okText === 'function' ? okText(res) : okText, 'ok'); return refresh();
    }).catch(function (e) { S.busy = false; render(); say(errText(e), 'err'); return refresh(); });
  }
  function apply(code) {
    var j = jobByCode(code);
    if (MOCK) {
      if (S.job || !j || j.taken >= j.seats) return;
      j.taken++; S.job = {job_code: code, since: new Date().toISOString()}; say('You are now a ' + j.title + '. Welcome aboard!', 'ok'); render(); return;
    }
    act(function () { return sb.rpc('apply_job', {p_code: code}); }, 'You are now a ' + (j ? j.title : 'junior') + '. Welcome aboard!');
  }
  function quit() {
    if (!confirm('Quit your job? Your seat goes to someone else.')) return;
    if (MOCK) { var j = jobByCode(S.job.job_code); if (j) j.taken = Math.max(0, j.taken - 1); S.job = null; say('You quit your job.', ''); render(); return; }
    act(function () { return sb.rpc('quit_job'); }, 'You quit your job.');
  }
  function claim() {
    if (!S.job || S.claimedToday) return;
    if (MOCK) {
      var j = jobByCode(S.job.job_code), pay = j ? j.daily_salary : 0;
      S.balance += pay; S.claimedToday = true;
      S.ledger.unshift({amount: pay, kind: 'salary', ref: S.job.job_code + ':' + lisbonToday(), created_at: new Date().toISOString()});
      say('Salary collected: +' + money(pay) + '. (Demo: nothing is saved.)', 'ok'); render(); return;
    }
    act(function () { return sb.rpc('claim_salary'); }, function (res) { return 'Salary collected: +' + money(res && res.data && res.data.amount) + '.'; });
  }
  function signOut() {
    if (MOCK) { say('Demo mode: nothing to sign out of.', ''); return; }
    sb.auth.signOut().finally(function () { S.user = null; S.profile = null; S.balance = 0; S.job = null; S.ledger = []; render(); say('Signed out.', ''); });
  }

  // ---------------------------------------------------------------- boot
  function boot() {
    panel = $('onPanel'); body = $('onBody'); msgEl = $('onMsg'); top = $('onTop');
    if (!panel || !top) return;
    $('onClose').addEventListener('click', closePanel);
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
    setInterval(function () { if (!panel.hidden && S.claimedToday) { var b = $('onPay'); if (b && b.disabled && S.job) b.textContent = 'Collected · next salary in ' + untilNextDay(); } if (S.claimedToday && S.mockDay && S.mockDay !== lisbonToday()) { S.claimedToday = false; S.mockDay = lisbonToday(); render(); } }, 30000);
    if (MOCK) { mockState(); render(); openPanel(); say('Demo data (?mock=1): buttons work locally, nothing is saved.', ''); return; }
    render();
    // an OAuth error comes back in the URL (?error=…&error_description=… or in the #hash)
    var hp = new URLSearchParams(location.hash.replace(/^#/, '')), oerr = qs.get('error_description') || hp.get('error_description');
    var back = qs.has('code') || qs.has('error') || hp.has('access_token') || hp.has('error');
    loadLib().then(function () {
      var booted = false;
      sb.auth.onAuthStateChange(function (ev, session) {
        var was = S.user && S.user.id; S.user = session ? session.user : null;
        if (booted && (S.user && S.user.id) !== was) setTimeout(refresh, 0);
      });
      // getSession waits for the client to finish reading the ?code= of the OAuth redirect
      return sb.auth.getSession().then(function (r) { booted = true; return r; });
    }).then(function (r) {
      var session = r && r.data && r.data.session;
      S.user = session ? session.user : null;
      var link = back && session && session.provider_token ? (openPanel(), linkYouTube(session)) : null;
      if (qs.has('code') || qs.has('error')) { // tidy the address bar after the redirect
        ['code', 'error', 'error_code', 'error_description', 'state'].forEach(function (k) { qs.delete(k); });
        history.replaceState(null, '', location.pathname + (qs.toString() ? '?' + qs : '') + (hp.has('error') ? '' : location.hash));
      }
      if (oerr) { openPanel(); say(/provider is not enabled|unsupported provider/i.test(oerr) ? 'Sign-in with YouTube is not open yet: the Mayor is still setting it up. Check back soon!' : 'Sign-in failed: ' + oerr, 'err'); }
      return link ? link.then(refresh) : refresh();
    }).catch(function (e) { S.ready = true; render(); say('Could not reach the Motoropolis servers. ' + errText(e), 'err'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
