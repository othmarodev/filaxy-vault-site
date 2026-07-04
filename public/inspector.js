/* Dev-only hero inspector. Activate with ?inspect in the URL (or #inspect).
   Lets you drag sliders to align the mockup screen + floating pills live,
   then "Copiar CSS" to hand the values back. Inert in production. */
(function () {
  var on = /inspect/.test(location.search) || /inspect/.test(location.hash);
  if (!on) return;

  var screen = document.querySelector('.dev-screen');
  var device = document.querySelector('.device');
  var pills = [].slice.call(document.querySelectorAll('.pill'));
  if (!screen || !device) return;

  // p1,p3 anchored with left; p2,p4 with right
  var pillSide = ['left', 'right', 'left', 'right'];

  // current defaults (keep in sync with styles.css)
  var S = { top: 3.9, left: 15.5, right: 15.6, bottom: 38.3, pad: 0 };
  var DEV = 1500;
  var P = [
    { top: 6, inset: 11 },
    { top: 24, inset: 11 },
    { top: 46, inset: 10 },
    { top: 57, inset: 11 },
  ];

  function applyScreen() {
    screen.style.top = S.top + '%';
    screen.style.left = S.left + '%';
    screen.style.right = S.right + '%';
    screen.style.bottom = S.bottom + '%';
    screen.style.padding = S.pad + '%';
    device.style.maxWidth = DEV + 'px';
    var hero = document.querySelector('.hero-visual');
    var heroSec = document.querySelector('.hero');
    if (hero) hero.style.maxWidth = DEV + 'px';
    if (heroSec) heroSec.style.maxWidth = DEV + 'px';
  }
  function applyPill(i) {
    var p = pills[i]; if (!p) return;
    p.style.top = P[i].top + '%';
    p.style.bottom = 'auto';
    if (pillSide[i] === 'left') { p.style.left = P[i].inset + '%'; p.style.right = 'auto'; }
    else { p.style.right = P[i].inset + '%'; p.style.left = 'auto'; }
  }
  function applyAll() { applyScreen(); pills.forEach(function (_, i) { applyPill(i); }); }

  // ---- panel UI ----
  var box = document.createElement('div');
  box.style.cssText = 'position:fixed;top:12px;right:12px;z-index:99999;width:260px;max-height:92vh;overflow:auto;' +
    'background:#0b0f1aee;color:#eaf0fb;border:1px solid #ffffff22;border-radius:12px;padding:12px 12px 10px;' +
    'font:12px/1.35 -apple-system,Segoe UI,sans-serif;backdrop-filter:blur(8px);box-shadow:0 20px 50px #000a';
  box.innerHTML = '<div style="font-weight:700;font-size:13px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">' +
    '🔧 Hero inspector <button id="ins-hide" style="background:#ffffff18;border:0;color:#eaf0fb;border-radius:6px;padding:2px 8px;cursor:pointer">ocultar</button></div>';

  function slider(label, min, max, step, val, cb) {
    var wrap = document.createElement('label');
    wrap.style.cssText = 'display:block;margin:7px 0 2px';
    var out = document.createElement('span');
    out.textContent = val;
    out.style.cssText = 'float:right;color:#8fb6ff;font-variant-numeric:tabular-nums';
    var t = document.createElement('span'); t.textContent = label;
    var r = document.createElement('input');
    r.type = 'range'; r.min = min; r.max = max; r.step = step; r.value = val;
    r.style.cssText = 'width:100%;margin-top:3px;accent-color:#7c3aed';
    r.addEventListener('input', function () { out.textContent = r.value; cb(parseFloat(r.value)); });
    wrap.appendChild(t); wrap.appendChild(out); wrap.appendChild(r);
    return wrap;
  }
  function head(txt) {
    var h = document.createElement('div');
    h.textContent = txt;
    h.style.cssText = 'margin:12px 0 2px;font-weight:700;color:#b79dff;border-top:1px solid #ffffff18;padding-top:8px';
    return h;
  }

  box.appendChild(head('Mockup'));
  box.appendChild(slider('device max-width (px)', 900, 1700, 5, DEV, function (v) { DEV = v; applyScreen(); }));
  box.appendChild(head('Pantalla (inset %)'));
  box.appendChild(slider('top', 0, 14, 0.1, S.top, function (v) { S.top = v; applyScreen(); }));
  box.appendChild(slider('left', 6, 24, 0.1, S.left, function (v) { S.left = v; applyScreen(); }));
  box.appendChild(slider('right', 6, 24, 0.1, S.right, function (v) { S.right = v; applyScreen(); }));
  box.appendChild(slider('bottom', 28, 50, 0.1, S.bottom, function (v) { S.bottom = v; applyScreen(); }));
  box.appendChild(slider('padding (margen app)', 0, 9, 0.1, S.pad, function (v) { S.pad = v; applyScreen(); }));

  ['2FA/TOTP', 'Seed phrases', 'Touch ID', 'Health report'].forEach(function (name, i) {
    box.appendChild(head('Pill: ' + name + ' (' + pillSide[i] + ')'));
    box.appendChild(slider('top', 0, 70, 0.5, P[i].top, function (v) { P[i].top = v; applyPill(i); }));
    box.appendChild(slider('inset ' + pillSide[i], 0, 26, 0.5, P[i].inset, function (v) { P[i].inset = v; applyPill(i); }));
  });

  var copy = document.createElement('button');
  copy.textContent = '📋 Copiar CSS';
  copy.style.cssText = 'width:100%;margin-top:12px;background:linear-gradient(135deg,#7c3aed,#0ea5e9);border:0;color:#fff;' +
    'font-weight:700;border-radius:8px;padding:9px;cursor:pointer';
  copy.addEventListener('click', function () {
    var css =
      '.device { max-width: ' + DEV + 'px; }\n' +
      '.hero, .hero-visual { max-width: ' + DEV + 'px; }\n' +
      '.dev-screen { top: ' + S.top + '%; left: ' + S.left + '%; right: ' + S.right + '%; bottom: ' + S.bottom + '%; padding: ' + S.pad + '%; }\n' +
      '.pill.p1 { top: ' + P[0].top + '%; left: ' + P[0].inset + '%; }\n' +
      '.pill.p2 { top: ' + P[1].top + '%; right: ' + P[1].inset + '%; }\n' +
      '.pill.p3 { top: ' + P[2].top + '%; left: ' + P[2].inset + '%; }\n' +
      '.pill.p4 { top: ' + P[3].top + '%; right: ' + P[3].inset + '%; }';
    navigator.clipboard && navigator.clipboard.writeText(css);
    console.log('[hero inspector]\n' + css);
    copy.textContent = '✅ Copiado — pegámelo';
    setTimeout(function () { copy.textContent = '📋 Copiar CSS'; }, 1800);
  });
  box.appendChild(copy);

  var reopen = document.createElement('button');
  reopen.textContent = '🔧';
  reopen.title = 'Inspector';
  reopen.style.cssText = 'position:fixed;top:12px;right:12px;z-index:99999;display:none;background:#0b0f1aee;color:#eaf0fb;' +
    'border:1px solid #ffffff22;border-radius:10px;width:38px;height:38px;font-size:16px;cursor:pointer';
  reopen.addEventListener('click', function () { box.style.display = 'block'; reopen.style.display = 'none'; });

  document.body.appendChild(box);
  document.body.appendChild(reopen);
  document.getElementById('ins-hide').addEventListener('click', function () {
    box.style.display = 'none'; reopen.style.display = 'block';
  });

  applyAll();
})();
