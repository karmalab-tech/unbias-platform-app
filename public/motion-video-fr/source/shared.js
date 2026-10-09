window.UI = {
  GRID: { x: 1176, y: 72, w: 150, h: 225, gap: 12 },
  key(series, i) { return series + '-' + String(i + 1).padStart(2, '0') + '.webp'; },
  portrait(kit, series, i, x, y, w, h, extra) {
    const k = UI.key(series, i);
    let inner;
    if (kit.assets.has(k)) inner = '<img src="' + kit.assets.url(k) + '">';
    else inner = '<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice"><circle class="ph-body" cx="100" cy="118" r="44"/><path class="ph-body" d="M22 300 C26 220 60 186 100 186 C140 186 174 220 178 300 Z"/></svg>';
    return kit.h('<div class="card pf ' + (extra || '') + '" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px">' + inner + '</div>');
  },
  grid(kit, parent, series, o) {
    o = o || UI.GRID;
    const cells = [];
    for (let i = 0; i < 16; i++) {
      const c = i % 4, r = (i / 4) | 0;
      const el = UI.portrait(kit, series, i, o.x + c * (o.w + o.gap), o.y + r * (o.h + o.gap), o.w, o.h);
      parent.append(el); cells.push(el.style);
    }
    return cells;
  },
  photo(kit, x, y, w, h, seed) {
    const dk = 'data-' + String(((seed * 7) % 16 + 16) % 16 + 1).padStart(2, '0') + '.webp';
    if (kit.assets.has(dk)) return kit.h('<div class="card pf" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;border-radius:14px"><img src="' + kit.assets.url(dk) + '"></div>');
    return kit.h('<div class="card" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;border-radius:14px"><svg viewBox="0 0 120 160" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%"><circle class="ph-body" cx="' + (34 + (seed * 13) % 50) + '" cy="46" r="12"/><path class="ph-body" d="M0 132 L' + (30 + (seed * 11) % 40) + ' 84 L70 118 L92 96 L120 128 V160 H0 Z"/></svg></div>');
  },
  textSlide(kit, lines, opts) {
    opts = opts || {};
    const g = kit.h('<div class="ground"></div>');
    kit.stage.append(g);
    const w = kit.h('<div class="words txt-slide"></div>');
    g.append(w);
    const els = lines.map((s, i) => { const p = kit.h('<p class="line' + (opts.pink && opts.pink.indexOf(i) >= 0 ? ' pk' : '') + '"></p>'); p.textContent = s; w.append(p); return p; });
    UI.mark(kit, g);
    let src = null;
    if (opts.source) { src = kit.h('<p class="src"></p>'); src.textContent = opts.source; g.append(src); }
    const starts = opts.starts || lines.map((_, i) => 0.3 + i * 1.6);
    return function (t) {
      els.forEach((p, i) => kit.TextFx.fadeFromRight(p, t, starts[i], { stagger: 0.07, dx: 24 }));
      w.style.transformOrigin = '0 50%';
      w.style.transform = 'translateX(' + (-t * 8) + 'px) scale(' + (1 + t * 0.006) + ')';
      if (src) src.style.opacity = kit.eo(kit.seg(t, 1.0, 1.6));
    };
  },
  webImg(kit, j) {
    const cat = j % 6, item = Math.floor(j / 6) % 6;
    const k = 'web-' + String(cat * 6 + item + 1).padStart(2, '0') + '.webp';
    if (kit.assets.has(k)) return kit.assets.url(k);
    const fb = ['data', 'person', 'doctor', 'parent', 'data', 'person'][cat];
    const k2 = fb + '-' + String((item * 5 + cat * 3) % 16 + 1).padStart(2, '0') + '.webp';
    return kit.assets.has(k2) ? kit.assets.url(k2) : null;
  },
  tile(kit, j, x, y, w, h, r) {
    const u = UI.webImg(kit, j);
    return kit.h('<div class="card pf" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;border-radius:' + (r || 14) + 'px">' + (u ? '<img src="' + u + '">' : '') + '</div>');
  },
  mark(kit, parent) {
    if (kit.assets.has('watermark.webp')) parent.append(kit.h('<img class="wm" src="' + kit.assets.url('watermark.webp') + '">'));
  },
};