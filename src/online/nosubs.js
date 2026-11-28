/* Motoropolis Online: no subscriber thresholds on this page. Injected by tools/build_online.py as the first <script>
   in <body>, before the city script, so every canvas label (3D boards and pills, 2D map cards) is drawn without them:
   "HARBOR · 3,000 SUBS" -> "HARBOR", "OPENS AT 650 SUBS" -> "COMING SOON", "12 subscribers to go" -> "". */
(function () {
  'use strict';
  function strip(t) {
    if (typeof t !== 'string' || !/\d/.test(t) || !/SUBS|subscriber/i.test(t)) return t;
    var o = t;
    o = o.replace(/^[\d,]+ MORE SUBSCRIBERS? TO OPEN$/, 'COMING SOON');
    o = o.replace(/\s*·\s*(?:UNLOCKS |OPENS |STAR )?AT [\d,]+ SUBS\b/g, '');
    o = o.replace(/\s*·\s*[\d,]+ SUBS\b/g, '');
    o = o.replace(/^(.*?)\s*OPENS AT [\d,]+ SUBS$/, function (m, a) { return a ? a + ' · COMING SOON' : 'COMING SOON'; });
    o = o.replace(/^[\d,]+ (?:more )?subscribers? to (?:go|open)$/i, '');
    return o;
  }
  [window.CanvasRenderingContext2D, window.OffscreenCanvasRenderingContext2D].forEach(function (C) {
    if (!C || !C.prototype) return;
    ['fillText', 'strokeText', 'measureText'].forEach(function (k) {
      var f = C.prototype[k];
      if (typeof f !== 'function') return;
      C.prototype[k] = function (t) {
        var a = Array.prototype.slice.call(arguments);
        a[0] = strip(t);
        return f.apply(this, a);
      };
    });
  });
  window.__onlineStripSubs = strip;
})();
