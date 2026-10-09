const { seg, eo, eio, eob, lerp } = kit;
const E_A = [0, 2, 3, 4, 6, 7, 9, 11, 13, 15], E_B = [1, 5, 8, 10, 12, 14];
const E_W = 150, E_H = 225, E_SX = 162, E_SY = 237, E_TOP = 190;
kit.scene('enquete', {
  init(kit) {
    const g = kit.h('<div class="ground"></div>');
    kit.stage.append(g); this.g = g;
    this.cells = [];
    for (let i = 0; i < 16; i++) {
      const el = UI.portrait(kit, 'person', i, 0, 0, E_W, E_H);
      g.append(el);
      const inA = E_A.indexOf(i), k = inA >= 0 ? inA : E_B.indexOf(i);
      const tx = inA >= 0 ? 320 + (k % 4) * E_SX : 1100 + (k % 2) * E_SX;
      const ty = E_TOP + (inA >= 0 ? (k / 4) | 0 : (k / 2) | 0) * E_SY;
      this.cells.push({ s: el.style, x0: 642 + (i % 4) * E_SX, y0: 72 + ((i / 4) | 0) * E_SY, tx, ty, grp: inA >= 0 ? 0 : 1, k });
    }
    this.slots = [];
    for (let k = 0; k < 3; k++) {
      const e = kit.h('<div style="position:absolute;left:1560px;top:' + (E_TOP + k * E_SY) + 'px;width:' + E_W + 'px;height:' + E_H + 'px;box-sizing:border-box;border:4px dashed var(--main);border-radius:22px"></div>');
      g.append(e); this.slots.push(e.style);
    }
    UI.mark(kit, g);
  },
  render(t) {
    this.g.style.transform = 'scale(' + (1 + t * 0.006) + ')';
    for (let i = 0; i < 16; i++) {
      const o = this.cells[i];
      const fin = eo(seg(t, i * 0.04, i * 0.04 + 0.35));
      const a = 1.4 + o.grp * 1.2 + o.k * 0.1;
      const p = eio(seg(t, a, a + 0.8));
      const x = lerp(o.x0, o.tx, p), y = lerp(o.y0, o.ty, p) - Math.sin(Math.PI * p) * 40;
      o.s.opacity = fin;
      o.s.left = '0px'; o.s.top = '0px';
      const env = eo(seg(t, i * 0.04 + 0.3, i * 0.04 + 1.1));
      o.s.transform = 'translate(' + x + 'px,' + (y + env * 5 * Math.sin(t * 1.7 + i * 1.1)) + 'px) scale(' + (1 + env * 0.03 * Math.sin(t * 2.2 + i * 0.8)) + ')';
    }
    this.slots.forEach((s, k) => { const p = eob(seg(t, 4.2 + k * 0.3, 4.6 + k * 0.3), 1.6); s.opacity = Math.min(1, Math.max(0, p)); s.transform = 'scale(' + (lerp(0.8, 1, Math.min(1.1, p)) * (1 + 0.035 * Math.min(1, Math.max(0, p)) * Math.sin(t * 2.6 + k * 1.4))) + ')'; });
  },
});