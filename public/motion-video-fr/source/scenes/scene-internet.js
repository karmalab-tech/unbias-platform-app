const { seg, eo, eio, lerp, rng, TextFx } = kit;
const I_W = 130, I_H = 173, I_S = 140, I_SY = 183;
const I_CX = [75, 685, 1295], I_CY = [230, 605];
kit.scene('internet', {
  init(kit) {
    const g = kit.h('<div class="ground"></div>');
    kit.stage.append(g); this.g = g;
    const r = rng(77);
    const order = Array.from({ length: 48 }, (_, i) => i);
    for (let i = 47; i > 0; i--) { const k = Math.floor(r() * (i + 1)); [order[i], order[k]] = [order[k], order[i]]; }
    this.items = [];
    for (let j = 0; j < 48; j++) {
      const el = UI.tile(kit, j, 0, 0, I_W, I_H, 12);
      g.append(el);
      const pos = order[j];
      const x0 = 120 + (pos % 12) * I_S, y0 = 250 + Math.floor(pos / 12) * I_SY;
      const cat = j % 6, slot = Math.floor(j / 6);
      const tx = I_CX[cat % 3] + (slot % 4) * I_S, ty = I_CY[Math.floor(cat / 3)] + Math.floor(slot / 4) * I_SY;
      this.items.push({ s: el.style, x0, y0, tx, ty, d: r(), cat });
    }
    g.append(kit.h('<div class="words" style="left:140px;top:60px;width:1640px"><h2 class="line pk internet-q">Et sur Internet, on trouve quoi\u00a0?</h2></div>'));
    this.q = g.querySelector('.internet-q');
    this.src = kit.h('<p class="src">LAION-5B (2022), reLAION-5B (2024)</p>');
    g.append(this.src); this.src = this.src.style;
    UI.mark(kit, g);
  },
  render(t) {
    this.g.style.transform = 'scale(' + (1 + t * 0.006) + ')';
    TextFx.fadeFromRight(this.q, t, 0.2, { stagger: 0.09, dx: 26 });
    this.src.opacity = eo(seg(t, 1.0, 1.6));
    for (const o of this.items) {
      const fin = eo(seg(t, o.d * 0.8, o.d * 0.8 + 0.4));
      const a = 2.6 + o.cat * 0.35 + o.d * 0.5;
      const p = eio(seg(t, a, a + 1.0));
      const x = lerp(o.x0, o.tx, p), y = lerp(o.y0, o.ty, p) - Math.sin(Math.PI * p) * 50;
      o.s.opacity = fin;
      o.s.left = '0px'; o.s.top = '0px';
      o.s.transform = 'translate(' + x + 'px,' + (y + fin * 4 * Math.sin(t * 1.8 + o.d * 11)) + 'px) scale(' + (lerp(0.9, 1, fin) * (1 + fin * 0.03 * Math.sin(t * 2.3 + o.d * 13))) + ')';
    }
  },
});