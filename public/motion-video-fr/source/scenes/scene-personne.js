const { seg, eo, eio, lerp, TextFx } = kit;
kit.scene('personne', {
  init(kit) {
    const g = kit.h('<div class="ground"></div>');
    kit.stage.append(g);
    this.wrap = kit.h('<div style="position:absolute;inset:0;transform-origin:1494px 540px"></div>');
    g.append(this.wrap);
    this.cells = UI.grid(kit, this.wrap, 'person');
    g.append(kit.h('<div class="words" style="left:140px;top:0;bottom:0;width:960px;justify-content:center"><h1 class="line pk personne-title">«\u00a0ChatGPT, dessine moi une personne\u00a0»</h1><p class="line personne-sub">16 fois la même demande</p></div>'));
    this.sub = g.querySelector('.personne-sub').style;
    this.title = g.querySelector('.personne-title');
    this.words = g.querySelector('.words').style;
    UI.mark(kit, g);
  },
  render(t) {
    TextFx.fadeFromRight(this.title, t, -0.9, { stagger: 0.1, dx: 30 });
    this.sub.opacity = eo(seg(t, 1.0, 1.6));
    this.sub.transform = 'translateX(' + lerp(26, 0, eo(seg(t, 1.0, 1.6))) + 'px)';
    this.words.transform = 'translateX(' + (-t * 2) + 'px)';
    for (let i = 0; i < 16; i++) {
      const t0 = i === 0 ? -0.5 : 0.5 + i * 0.32;
      const p = eo(seg(t, t0, t0 + 0.4));
      const s = this.cells[i];
      s.opacity = p;
      const env = eo(seg(t, t0 + 0.4, t0 + 1.2)) * (1 - eio(seg(t, 6.3, 7)));
      const br = 1 + env * 0.03 * Math.sin(t * 2.2 + i * 0.75);
      s.transform = 'translateY(' + (lerp(22, 0, p) + env * 4 * Math.sin(t * 1.7 + i * 1.3)) + 'px) scale(' + (lerp(0.94, 1, p) * br) + ')';
    }
    this.wrap.style.transform = 'scale(' + lerp(1, 1.025, eio(seg(t, 0, 8))) + ')';
  },
});