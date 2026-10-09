const { seg, eo, ei, eio, eob, lerp, rng, TextFx } = kit;
const B_X = 1090, B_Y = 225, B_W = 420, B_H = 630, B_C = 6, B_R = 9;
kit.scene('boucle', {
  async init(kit) {
    this.k = kit;
    const g = kit.h('<div class="ground"></div>');
    kit.stage.append(g);
    this.big = UI.portrait(kit, 'person', 0, B_X, B_Y, B_W, B_H); g.append(this.big); this.big = this.big.style;
    this.img = kit.assets.has('person-01.webp') ? await kit.assets.image('person-01.webp') : null;
    this.off = document.createElement('canvas'); this.off.width = 120; this.off.height = 180;
    const r = rng(41), s = B_W / B_C;
    this.tiles = [];
    for (let i = 0; i < B_C * B_R; i++) {
      const c = i % B_C, row = (i / B_C) | 0;
      const el = UI.portrait(kit, ['person', 'doctor', 'parent'][i % 3], (i * 7 + 3) % 16, 0, 0, s - 4, s - 4);
      el.style.borderRadius = '8px'; el.style.transformOrigin = '0 0';
      g.append(el);
      const G = UI.GRID;
      this.tiles.push({ s: el.style, x0: B_X + c * s + 2, y0: B_Y + row * s + 2, tx: G.x + 10 + r() * (G.w - 40), ty: G.y + 10 + r() * (G.h - 40), d: r() });
    }
    this.cell = UI.portrait(kit, 'person', 0, UI.GRID.x, UI.GRID.y, UI.GRID.w, UI.GRID.h); g.append(this.cell); this.cell = this.cell.style;
    g.append(kit.h('<div class="words boucle-q" style="left:140px;top:0;bottom:0;width:880px;justify-content:center"><h2 class="line pk boucle-title">Et si on apprenait à voir les choix derrière chaque image\u00a0?</h2></div>'));
    g.append(kit.h('<div class="words" style="left:140px;top:0;bottom:0;width:960px;justify-content:center"><h1 class="line pk boucle-again">«\u00a0ChatGPT, dessine moi une personne\u00a0»</h1><p class="line" style="opacity:0">16 fois la même demande</p></div>'));
    this.q = g.querySelector('.boucle-q').style;
    this.title = g.querySelector('.boucle-title');
    this.again = g.querySelector('.boucle-again');
    this.aw = this.again.parentNode.style;
    UI.mark(kit, g);
  },
  render(t, kit) {
    kit = kit || this.k;
    const qi = eo(seg(t, 0.1, 0.6)), qo = ei(seg(t, 4.0, 4.5));
    this.q.opacity = qi * (1 - qo);
    this.q.transform = 'translateX(' + (lerp(0, -40, qo) - t * 2) + 'px)';
    TextFx.fadeFromRight(this.title, t, 0.2, { stagger: 0.08, dx: 24 });
    const bin = eo(seg(t, 0, 0.4));
    this.big.opacity = bin * (1 - seg(t, 0.8, 0.95));
    this.big.transform = 'scale(' + lerp(0.96, 1, bin) * lerp(1, 1.02, seg(t, 0, 0.8)) + ')';
    const px = seg(t, 0.8, 2.4), pxOut = eo(seg(t, 2.4, 2.9));
    if (t > 0.75 && t < 3.0) {
      const fx = kit.fx, n = Math.max(6, Math.round(lerp(120, 6, eio(px)))), m = Math.round(n * 1.5);
      const oc = this.off.getContext('2d');
      oc.clearRect(0, 0, 120, 180);
      fx.save();
      fx.globalAlpha = (1 - pxOut) * eo(seg(t, 0.75, 0.9));
      fx.beginPath();
      if (fx.roundRect) fx.roundRect(B_X, B_Y, B_W, B_H, 22); else fx.rect(B_X, B_Y, B_W, B_H);
      fx.clip();
      if (this.img) {
        oc.imageSmoothingEnabled = true;
        oc.drawImage(this.img, 0, 0, n, m);
        fx.imageSmoothingEnabled = false;
        fx.drawImage(this.off, 0, 0, n, m, B_X, B_Y, B_W, B_H);
      } else { fx.fillStyle = '#1C1C20'; fx.fillRect(B_X, B_Y, B_W, B_H); }
      fx.restore();
    }
    for (const o of this.tiles) {
      const a = 2.3 + o.d * 0.5;
      const fin = eo(seg(t, a, a + 0.4));
      const f0 = 3.2 + o.d * 0.8;
      const p = eio(seg(t, f0, f0 + 0.8));
      const x = lerp(o.x0, o.tx, p), y = lerp(o.y0, o.ty, p) - Math.sin(Math.PI * p) * 80;
      o.s.opacity = fin * (1 - eo(seg(t, f0 + 0.55, f0 + 0.8)));
      o.s.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + lerp(lerp(0.85, 1, fin), 0.35, p) + ')';
    }
    const c = eob(seg(t, 4.6, 5.1), 1.6);
    this.cell.opacity = eo(seg(t, 4.6, 4.9));
    this.cell.transform = 'scale(' + lerp(0.9, 1, Math.min(1.15, c)) + ')';
    TextFx.fadeFromRight(this.again, t, 5.2, { stagger: 0.1, dx: 30 });
    this.aw.transform = 'translateX(' + lerp(18, 0, seg(t, 5.2, 7)) + 'px)';
    this.big.left = (B_X + Math.sin(t * 0.9) * 6) + 'px';
  },
});