const { seg, eo, eio, lerp, rng, TextFx } = kit;
const T_CX = [360, 960, 1560];
kit.scene('tri', {
  init(kit) {
    const g = kit.h('<div class="ground"></div>');
    kit.stage.append(g); this.g = g;
    g.append(kit.h('<div class="words" style="left:140px;top:80px;width:1640px"><h2 class="line pk tri-title">L’IA apprend aussi nos stéréotypes</h2><p class="line tri-sub">Et les reproduit dans ses images</p></div>'));
    const r = rng(23);
    this.items = [];
    const series = ['person', 'doctor', 'parent'];
    for (let i = 0; i < 24; i++) {
      const s = series[i % 3], idx = (i * 5 + 1) % 16;
      const el = UI.portrait(kit, s, idx, 0, 0, 110, 165);
      el.style.borderRadius = '14px';
      g.append(el);
      const cl = (i * 7) % 3, k = this.items.filter(o => o.cl === cl).length;
      const tx = T_CX[cl] - 235 + (k % 4) * 120, ty = 560 + ((k / 4) | 0) * 175;
      this.items.push({ s: el.style, cl, k, x0: 160 + r() * 1580, y0: 520 + r() * 380, r0: (r() - 0.5) * 16, tx, ty, d: r() });
    }
    this.title = g.querySelector('.tri-title');
    this.sub = g.querySelector('.tri-sub').style;
    UI.mark(kit, g);
  },
  render(t) {
    this.g.style.transform = 'scale(' + (1 + t * 0.006) + ')';
    TextFx.fadeFromRight(this.title, t, 0.3, { stagger: 0.1, dx: 26 });
    const q = eo(seg(t, 5.6, 6.2));
    this.sub.opacity = q;
    this.sub.transform = 'translateX(' + lerp(22, 0, q) + 'px)';
    for (const o of this.items) {
      const a = 2.0 + o.cl * 0.45 + o.k * 0.09 + o.d * 0.3;
      const p = eio(seg(t, a, a + 1.1));
      const fin = eo(seg(t, 0, 0.6 + o.d));
      const bob = (1 - p) * Math.sin(t * 1.4 + o.d * 9) * 6;
      const x = lerp(o.x0, o.tx, p), y = lerp(o.y0, o.ty, p) - Math.sin(Math.PI * p) * 60 + bob;
      o.s.opacity = fin;
      const env = eo(seg(t, a + 1.0, a + 1.8));
      const by = env * 5 * Math.sin(t * 1.6 + o.d * 7), bs = 1 + env * 0.035 * Math.sin(t * 2.1 + o.d * 9), brt = env * 1.2 * Math.sin(t * 1.3 + o.d * 5);
      o.s.transform = 'translate(' + x + 'px,' + (y + by) + 'px) rotate(' + (lerp(o.r0, 0, p) + brt) + 'deg) scale(' + (lerp(0.9, 1, fin) * bs) + ')';
    }
  },
});