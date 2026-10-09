const { seg, eo, ei, eio, lerp, TextFx } = kit;
kit.scene('parent', {
  init(kit) {
    const g = kit.h('<div class="ground"></div>');
    kit.stage.append(g);
    this.wrap = kit.h('<div style="position:absolute;inset:0;transform-origin:1494px 540px"></div>');
    g.append(this.wrap);
    this.old = UI.grid(kit, this.wrap, 'doctor');
    this.cells = UI.grid(kit, this.wrap, 'parent');
    g.append(kit.h('<div class="words parent-oldw" style="left:140px;top:0;bottom:0;width:960px;justify-content:center"><h1 class="line pk">«\u00a0ChatGPT, dessine moi un.e médecin\u00a0»</h1><p class="line">Un seul mot change</p></div>'));
    g.append(kit.h('<div class="words parent-new" style="left:140px;top:0;bottom:0;width:960px;justify-content:center"><h1 class="line pk parent-title">«\u00a0ChatGPT, dessine moi un.e parent.e\u00a0»</h1><p class="line parent-sub">Qui imagine-t-elle\u00a0?</p></div>'));
    this.oldWords = g.querySelector('.parent-oldw').style;
    this.title = g.querySelector('.parent-title');
    this.sub = g.querySelector('.parent-sub').style;
    this.newWords = g.querySelector('.parent-new').style;
    UI.mark(kit, g);
  },
  render(t) {
    const out = ei(seg(t, 0, 0.45));
    this.oldWords.opacity = 1 - out;
    this.oldWords.transform = 'translateX(' + lerp(0, -40, out) + 'px)';
    TextFx.fadeFromRight(this.title, t, 0.4, { stagger: 0.1, dx: 30 });
    const q = eo(seg(t, 4.6, 5.3));
    this.sub.opacity = q;
    this.sub.transform = 'translateX(' + lerp(26, 0, q) + 'px)';
    this.newWords.transform = 'translateX(' + (-t * 2) + 'px)';
    for (let i = 0; i < 16; i++) {
      const t0 = 0.6 + i * 0.24;
      const p = eo(seg(t, t0, t0 + 0.4));
      const s = this.cells[i];
      s.opacity = p;
      const env = eo(seg(t, t0 + 0.4, t0 + 1.2)) * (1 - eio(seg(t, 6.3, 7)));
      const br = 1 + env * 0.03 * Math.sin(t * 2.2 + i * 0.75);
      s.transform = 'translateY(' + (lerp(22, 0, p) + env * 4 * Math.sin(t * 1.7 + i * 1.3)) + 'px) scale(' + (lerp(0.94, 1, p) * br) + ')';
      this.old[i].opacity = 1 - eo(seg(t, t0 + 0.15, t0 + 0.4));
    }
    this.wrap.style.transform = 'scale(' + lerp(1.04, 1.06, eio(seg(t, 0, 8))) + ')';
  },
});