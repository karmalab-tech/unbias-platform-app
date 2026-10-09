const { seg, eo, ei, eio, eob, lerp, TextFx } = kit;
const Z_PICKS = [['person', 2, [86, 128, 200, 210]], ['doctor', 4, [108, 52, 160, 172]], ['parent', 8, [160, 98, 166, 180]]];
const Z_B = [0.4, 2.9, 5.4];
const Z_FX = 1040, Z_FY = 90, Z_K = 1.5;
kit.scene('zooms', {
  init(kit) {
    const g = kit.h('<div class="ground"></div>');
    kit.stage.append(g);
    g.append(kit.h('<div class="words" style="left:140px;top:0;bottom:0;width:840px;justify-content:center"><h2 class="line pk zooms-title">Pourquoi toujours les mêmes visages\u00a0?</h2></div>'));
    this.frame = kit.h('<div class="card" style="left:' + Z_FX + 'px;top:' + Z_FY + 'px;width:600px;height:900px"></div>');
    g.append(this.frame);
    this.pics = [];
    Z_PICKS.forEach(([s, i, f]) => {
      const p = UI.portrait(kit, s, i, 0, 0, 600, 900);
      p.style.border = '0'; p.style.borderRadius = '0';
      p.style.transformOrigin = ((f[0] + f[2] / 2) * Z_K) + 'px ' + ((f[1] + f[3] / 2) * Z_K) + 'px';
      this.frame.append(p); this.pics.push(p.style);
    });
    this.ring = kit.h('<div class="ring" style="left:0;top:0"></div>');
    g.append(this.ring); this.ring = this.ring.style;
    this.title = g.querySelector('.zooms-title');
    UI.mark(kit, g);
  },
  render(t) {
    TextFx.fadeFromRight(this.title, t, 0.2, { stagger: 0.09, dx: 26 });
    const fy = lerp(30, 0, eo(seg(t, 0, 0.6)));
    this.frame.style.opacity = eo(seg(t, 0, 0.4));
    this.frame.style.transform = 'translateY(' + fy + 'px)';
    let op = 0;
    for (let b = 0; b < 3; b++) {
      const a = Z_B[b], z = b < 2 ? Z_B[b + 1] : 8.2;
      const vin = b === 0 ? 1 : eio(seg(t, a - 0.3, a + 0.2));
      const vout = b === 2 ? 0 : eio(seg(t, z - 0.3, z + 0.2));
      const s = lerp(1, 1.3, eio(seg(t, a - 0.3, z)));
      this.pics[b].opacity = vin * (1 - vout);
      this.pics[b].transform = 'scale(' + s + ')';
      if (t >= a - 0.3 && t < z) {
        const f = Z_PICKS[b][2];
        const w = f[2] * Z_K * s, h = f[3] * Z_K * s;
        const cx = Z_FX + (f[0] + f[2] / 2) * Z_K, cy = Z_FY + fy + (f[1] + f[3] / 2) * Z_K;
        const r = eob(seg(t, a + 0.6, a + 1.0), 1.6) * (1 - ei(seg(t, z - 0.5, z - 0.2)));
        op = Math.max(0, Math.min(1, r));
        const pop = lerp(1.12, 1, Math.min(1, Math.max(0, r)));
        this.ring.left = (cx - w * pop / 2) + 'px'; this.ring.top = (cy - h * pop / 2) + 'px';
        this.ring.width = (w * pop) + 'px'; this.ring.height = (h * pop) + 'px';
      }
    }
    this.ring.opacity = op;
  },
});