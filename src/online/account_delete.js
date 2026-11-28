/* Motoropolis Online: "Delete my account" (button in the account panel + confirm dialog).
   Loaded by src/online/online.html as <script src="../src/online/account_delete.js" defer> (a plain file served by
   GitHub Pages, so tools/build_online.py and online.js stay untouched). It reads the signed-in session that
   online.js keeps in localStorage (key "sb-<project ref>-auth-token"), so the project URL is never written twice:
   switching online.js to the production project switches this file too.
   The edge function delete-account deletes the auth user; the database cascades to every game row. */
(function () {
  'use strict';
  var MOCK = new URLSearchParams(location.search).get('mock') === '1';
  var KEY_RE = /^sb-([a-z0-9]{20})-auth-token$/;

  function session() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i), m = k && KEY_RE.exec(k);
        if (!m) continue;
        var s = JSON.parse(localStorage.getItem(k) || 'null');
        if (s && s.currentSession) s = s.currentSession; // very old supabase-js layout
        if (s && s.access_token) return {key: k, ref: m[1], token: s.access_token, exp: +s.expires_at || 0};
      }
    } catch (e) { /* storage blocked */ }
    return null;
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  var dlg, input, go, note;
  function buildDialog() {
    dlg = el('dialog', 'od-dlg'); dlg.setAttribute('aria-labelledby', 'odTitle');
    var h = el('h2', null, 'Delete your account?'); h.id = 'odTitle';
    var p1 = el('p', null, 'This permanently deletes your Motoropolis Online account: your channel name and picture, the channel fingerprint, your balance, history, job and salary claims. It cannot be undone.');
    var p2 = el('p', 'od-small');
    p2.append(document.createTextNode('You can sign in again later, but you start from $0. To also remove the app from your Google account, visit '));
    var a = el('a', null, 'Google account permissions'); a.href = 'https://myaccount.google.com/permissions'; a.target = '_blank'; a.rel = 'noopener';
    p2.append(a, document.createTextNode('.'));
    var lab = el('label', 'od-lab', 'Type DELETE to confirm'); lab.htmlFor = 'odInput';
    input = el('input'); input.id = 'odInput'; input.type = 'text'; input.autocomplete = 'off'; input.autocapitalize = 'characters'; input.spellcheck = false;
    note = el('p', 'od-note'); note.hidden = true; note.setAttribute('aria-live', 'polite');
    var row = el('div', 'od-row');
    var cancel = el('button', 'od-cancel', 'Cancel'); cancel.type = 'button';
    go = el('button', 'od-go', 'Delete forever'); go.type = 'button'; go.disabled = true;
    row.append(cancel, go);
    dlg.append(h, p1, p2, lab, input, note, row);
    document.body.append(dlg);
    input.addEventListener('input', function () { go.disabled = input.value.trim().toUpperCase() !== 'DELETE'; });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !go.disabled) go.click(); });
    cancel.addEventListener('click', function () { dlg.close(); });
    go.addEventListener('click', run);
  }
  function show(text, kind) { note.hidden = !text; note.textContent = text || ''; note.className = 'od-note' + (kind ? ' ' + kind : ''); }

  function open() {
    if (!dlg) buildDialog();
    input.value = ''; go.disabled = true; input.disabled = false; show('');
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    input.focus();
  }

  function run() {
    if (MOCK) { show('Demo mode (?mock=1): nothing was deleted.', ''); return; }
    var s = session();
    if (!s) { show('You are not signed in on this page any more. Reload, sign in and try again.', 'err'); return; }
    if (s.exp && s.exp * 1000 < Date.now() + 15000) { show('Your sign-in has expired. Reload the page and try again.', 'err'); return; }
    go.disabled = true; input.disabled = true; show('Deleting…', '');
    fetch('https://' + s.ref + '.supabase.co/functions/v1/delete-account', {
      method: 'POST',
      headers: {'Authorization': 'Bearer ' + s.token, 'Content-Type': 'application/json'},
      body: JSON.stringify({confirm: 'DELETE'})
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j && j.error || 'Error ' + r.status); return j; });
    }).then(function () {
      try { localStorage.removeItem(s.key); } catch (e) { /* ignore */ }
      show('Your account has been deleted. Goodbye, and thanks for playing!', 'ok');
      setTimeout(function () { location.replace(location.pathname); }, 2200);
    }).catch(function (e) {
      go.disabled = false; input.disabled = false;
      show('Could not delete the account: ' + (e && e.message || e) + '. Try again, or contact us (see the Privacy page).', 'err');
    });
  }

  // online.js rebuilds the panel body on every render: add the button again whenever a signed-in panel appears
  function ensure() {
    var body = document.getElementById('onBody');
    if (!body || document.getElementById('odBtn')) return;
    var foot = body.querySelector('.on-foot');
    if (!foot || !body.querySelector('.on-me')) return; // signed-in view only
    var wrap = el('div', 'od-wrap');
    var b = el('button', 'on-link od-btn', 'Delete my account'); b.type = 'button'; b.id = 'odBtn';
    b.addEventListener('click', open);
    wrap.append(b); body.append(wrap);
  }
  function boot() {
    var body = document.getElementById('onBody');
    if (!body) return;
    new MutationObserver(ensure).observe(body, {childList: true});
    ensure();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
