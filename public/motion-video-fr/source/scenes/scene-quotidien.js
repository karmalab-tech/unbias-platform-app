const { seg, eo, ei, eio, eob, lerp } = kit;
const Q_HERO = [[0, 810, 400, 300, 420], [1.2, 810, 400, 300, 420], [1.8, 550, 400, 260, 340], [3.0, 550, 400, 260, 340], [3.6, 784, 362, 352, 440], [4.8, 784, 362, 352, 440], [5.4, 720, 410, 480, 520]];
const Q_WIN = [[1.2, 3.0], [3.0, 4.8], [4.8, 99]];
const Q_PICK = ['doctor', 4];
function qHero(t) {
  for (let i = 1; i < Q_HERO.length; i++) {
    const a = Q_HERO[i - 1], b = Q_HERO[i];
    if (t <= b[0]) { const p = eio(seg(t, a[0], b[0])); return [1, 2, 3, 4].map(k => lerp(a[k], b[k], p)); }
  }
  return Q_HERO[Q_HERO.length - 1].slice(1);
}
const Q_DARK = ';background:color-mix(in srgb, var(--ground) 24%, var(--second))';
function qBars(x, y, w, n, gap, dark) { let s = ''; for (let i = 0; i < n; i++) s += '<div class="bar" style="left:' + x + 'px;top:' + (y + i * gap) + 'px;width:' + (i === n - 1 ? w * 0.6 : w) + 'px' + (dark ? Q_DARK : '') + '"></div>'; return s; }
function qMock(kit, type, withP) {
  let el, slot;
  if (type === 0) {
    el = kit.h('<div style="position:absolute;left:510px;top:360px;width:900px;height:560px"><div style="position:absolute;left:0;top:0;width:446px;height:560px;background:var(--second);border-radius:18px 4px 4px 18px">' + qBars(40, 410, 366, 3, 38, 1) + '</div><div style="position:absolute;left:454px;top:0;width:446px;height:560px;background:var(--second);border-radius:4px 18px 18px 4px"><div class="bar" style="left:40px;top:48px;width:300px;height:34px' + Q_DARK + '"></div>' + qBars(40, 130, 366, 9, 40, 1) + '</div></div>');
    slot = [40, 40, 260, 340];
  } else if (type === 1) {
    el = kit.h('<div style="position:absolute;left:770px;top:260px;width:380px;height:760px;box-sizing:border-box;border:12px solid color-mix(in srgb, var(--ground) 72%, var(--second));border-radius:56px;background:var(--ground);overflow:hidden"><div style="position:absolute;left:24px;top:30px;width:48px;height:48px;border-radius:50%;background:var(--main)"></div>' + qBars(88, 46, 160, 1, 0) + qBars(24, 556, 300, 2, 34) + '<div style="position:absolute;left:24px;top:636px;width:200px;height:40px;border-radius:999px;background:var(--second)"></div></div>');
    slot = [2, 90, 352, 440];
  } else {
    el = kit.h('<div style="position:absolute;left:680px;top:260px;width:560px;height:760px;background:var(--second);border-radius:12px"><p class="mock-h" style="left:40px;top:34px;font-size:88px">On recrute</p>' + qBars(40, 694, 440, 2, 30, 1) + '</div>');
    slot = [40, 150, 480, 520];
  }
  if (withP) { const p = UI.portrait(kit, Q_PICK[0], Q_PICK[1], slot[0], slot[1], slot[2], slot[3]); p.style.border = '0'; p.style.borderRadius = '10px'; el.append(p); }
  return el;
}
kit.scene('quotidien', {
  init(kit) {
    const g = kit.h('<div class="ground"></div>');
    kit.stage.append(g); this.g = g;
    const cx = [192, 576, 960, 1344, 1728], cy = [200, 540, 880];
    this.copies = [];
    let n = 0;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      if (r === 1 && c === 2) continue;
      const e = qMock(kit, (r * 5 + c) % 3, true);
      e.style.transformOrigin = '50% 50%';
      g.append(e);
      this.copies.push({ s: e.style, k: n++, dx: cx[c] - 960, dy: cy[r] - 640 });
    }
    this.group = kit.h('<div style="position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:960px 640px"></div>');
    g.append(this.group);
    this.mocks = [0, 1, 2].map(i => { const e = qMock(kit, i, false); this.group.append(e); return e.style; });
    this.hero = UI.portrait(kit, Q_PICK[0], Q_PICK[1], 0, 0, 300, 420);
    this.hero.style.border = '0'; this.hero.style.borderRadius = '10px';
    this.group.append(this.hero); this.hero = this.hero.style;
    this.labels = ['Dans un manuel scolaire', 'Dans une publicité', 'Dans une offre d’emploi'].map(w => { const e = kit.h('<p class="line" style="position:absolute;margin:0;left:140px;top:70px"></p>'); e.textContent = w; g.append(e); return e.style; });
    UI.mark(kit, g);
  },
  render(t) {
    this.g.style.transform = 'scale(' + (1 + t * 0.006) + ')';
    const [x, y, w, h] = qHero(t);
    Object.assign(this.hero, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', opacity: eo(seg(t, 0, 0.5)) });
    for (let i = 0; i < 3; i++) {
      const [a, b] = Q_WIN[i];
      const pin = eo(seg(t, a, a + 0.5)), pout = ei(seg(t, b, b + 0.4));
      this.mocks[i].opacity = pin * (1 - pout);
      this.mocks[i].transform = 'translateX(' + (-220 * pout) + 'px) scale(' + lerp(0.94, 1, pin) + ')';
      const lin = eo(seg(t, a + 0.2, a + 0.6)), lout = ei(seg(t, i === 2 ? 6.2 : b - 0.1, i === 2 ? 6.5 : b + 0.2));
      this.labels[i].opacity = lin * (1 - lout);
      this.labels[i].transform = 'translateX(' + (lerp(30, 0, lin) - 40 * lout) + 'px)';
    }
    const p = eio(seg(t, 6.3, 7.1));
    this.group.style.transform = 'translateY(' + (-100 * p) + 'px) scale(' + (lerp(1, 0.34, p) * (1 + 0.012 * Math.sin(t * 1.8))) + ')';
    for (const o of this.copies) {
      const a = 6.7 + o.k * 0.06;
      const q = eob(seg(t, a, a + 0.45), 1.6);
      const env = eo(seg(t, a + 0.4, a + 1.0));
      o.s.opacity = eo(seg(t, a, a + 0.2));
      o.s.transform = 'translate(' + o.dx + 'px,' + (o.dy + env * 6 * Math.sin(t * 1.9 + o.k)) + 'px) scale(' + (Math.max(0, lerp(0.2, 0.34, q)) * (1 + env * 0.04 * Math.sin(t * 2.4 + o.k * 0.9))) + ')';
    }
  },
});