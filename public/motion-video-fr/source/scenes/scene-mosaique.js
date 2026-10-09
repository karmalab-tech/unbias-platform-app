const { seg, eo, eio, lerp, rng } = kit;
const M_COLS = 14, M_ROWS = 14, M_W = 120, M_H = 160, M_G = 10;
kit.scene('mosaique', {
  init(kit) {
    const g = kit.h('<div class="ground"></div>');
    kit.stage.append(g);
    const bw = M_COLS * (M_W + M_G) - M_G, bh = 1530;
    this.box = kit.h('<div style="position:absolute;left:' + (960 - bw / 2) + 'px;top:' + (540 - bh / 2) + 'px;width:' + bw + 'px;height:' + bh + 'px;overflow:hidden;border-radius:28px"></div>');
    g.append(this.box);
    const r = rng(11);
    this.cols = []; this.speeds = [];
    let n = 0;
    for (let c = 0; c < M_COLS; c++) {
      const col = kit.h('<div style="position:absolute;left:' + c * (M_W + M_G) + 'px;top:-425px;width:' + M_W + 'px"></div>');
      for (let k = 0; k < M_ROWS; k++) {
        const y = k * (M_H + M_G);
        let el;
        if (r() < 0.7) { el = UI.portrait(kit, ['person', 'doctor', 'parent'][n % 3], (n * 5) % 16, 0, y, M_W, M_H); n++; el.style.borderRadius = '14px'; }
        else el = UI.photo(kit, 0, y, M_W, M_H, c * 3 + k);
        col.append(el);
      }
      this.box.append(col);
      this.cols.push(col.style);
      this.speeds.push((c % 2 ? 1 : -1) * (24 + (c * 17) % 30));
    }
    UI.mark(kit, g);
  },
  render(t) {
    this.box.style.transform = 'scale(' + lerp(0.42, 1.3, eio(seg(t, 0, 4.8))) + ')';
    this.box.style.opacity = eo(seg(t, 0, 0.6));
    for (let c = 0; c < M_COLS; c++) this.cols[c].transform = 'translateY(' + (this.speeds[c] * t) + 'px)';
  },
});