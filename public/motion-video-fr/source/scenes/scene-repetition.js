const { seg, eo, eob, lerp, rng } = kit;
const R_RARE = [20, 34];
const R_MOM = [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15];
kit.scene('repetition', {
  init(kit) {
    const g = kit.h('<div class="ground"></div>');
    kit.stage.append(g);
    this.field = kit.h('<div style="position:absolute;inset:0"></div>');
    g.append(this.field);
    const r = rng(5);
    this.often = []; this.rare = [];
    let m = 0, q = 0;
    for (let i = 0; i < 72; i++) {
      const c = i % 12, row = (i / 12) | 0;
      const x = -12 + c * 162, y = -96 + row * 212;
      const rare = R_RARE.indexOf(i) >= 0;
      const often = !rare && r() < 0.4;
      let el;
      if (rare) el = UI.portrait(kit, 'parent', 7, x, y, 150, 200);
      else if (often) el = UI.portrait(kit, 'parent', R_MOM[(m++ * 7) % R_MOM.length], x, y, 150, 200);
      else if (i % 2 === 0) el = UI.portrait(kit, 'person', (q++ * 5) % 16, x, y, 150, 200);
      else el = UI.photo(kit, x, y, 150, 200, i);
      el.style.borderRadius = '16px';
      this.field.append(el);
      if (often || rare) {
        const ring = kit.h('<div style="position:absolute;left:' + (x - 6) + 'px;top:' + (y - 6) + 'px;width:162px;height:212px;box-sizing:border-box;border-radius:20px;border:5px ' + (rare ? 'dashed var(--second)' : 'solid var(--main)') + '"></div>');
        this.field.append(ring);
        (rare ? this.rare : this.often).push({ ring: ring.style, k: (rare ? this.rare : this.often).length });
      }
    }
    UI.mark(kit, g);
  },
  render(t) {
    this.field.style.transform = 'translateY(' + (-t * 8) + 'px) scale(' + lerp(1.03, 1, eo(seg(t, 0, 1.2))) + ')';
    for (const o of this.often) {
      const p = eob(seg(t, 0.8 + o.k * 0.07, 1.2 + o.k * 0.07), 1.6);
      o.ring.opacity = Math.min(1, Math.max(0, p));
      o.ring.transform = 'scale(' + (lerp(1.08, 1, Math.min(1, p)) * (1 + 0.025 * Math.min(1, Math.max(0, p)) * Math.sin(t * 3 + o.k * 0.9))) + ')';
    }
    for (const o of this.rare) {
      const p = eo(seg(t, 3.4 + o.k * 0.5, 3.9 + o.k * 0.5));
      o.ring.opacity = p;
      o.ring.transform = 'scale(' + (lerp(1.15, 1, p) * (1 + 0.04 * p * Math.sin(t * 3.4 + o.k))) + ')';
    }
  },
});