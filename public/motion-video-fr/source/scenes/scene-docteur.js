const { seg, eo, ei, eio, lerp, TextFx } = kit;
kit.scene('docteur', {
  init(kit) {
    const g = kit.h('<div class="ground"></div>');
    kit.stage.append(g);
    this.wrap = kit.h('<div style="position:absolute;inset:0;transform-origin:1494px 540px"></div>');
    g.append(this.wrap);
    this.old = UI.grid(kit, this.wrap, 'person');
    this.cells = UI.grid(kit, this.wrap, 'doctor');
    g.append(kit.h('<div class="words docteur-oldw" style="left:140px;top:0;bottom:0;width:960px;justify-content:center"><h1 class="line pk">«\u00a0ChatGPT, dessine moi une personne\u00a0»</h1><p class="line">16 fois la même demande</p></div>'));
    g.append(kit.h('<div class="words docteur-new" style="left:140px;top:0;bottom:0;width:960px;justify-content:center"><h1 class="line pk docteur-title">«\u00a0ChatGPT, dessine moi un.e médecin\u00a0»</h1><p class="line docteur-sub">Un seul mot change</p></div>'));
    this.oldWords = g.querySelector('.docteur-oldw').style;
    this.title = g.querySelector('.docteur-title');
    this.sub = g.querySelector('.docteur-sub').style;
    this.newWords = g.querySelector('.docteur-new').style;
    UI.mark(kit, g);
  },
  render(t) {
    const out = ei(seg(t, 0, 0.45));
    this.oldWords.opacity = 1 - out;
    this.oldWords.transform = 'translateX(' + lerp(0, -40, out) + 'px)';
    TextFx.fadeFromRight(this.title, t, 0.4, { stagger: 0.1, dx: 30 });
    this.sub.opacity = eo(seg(t, 1.6, 2.2));
    this.sub.transform = 'translateX(' + lerp(26, 0, eo(seg(t, 1.6, 2.2))) + 'px)';
    this.newWords.transform = 'translateX(' + (-t * 2) + 'px)';
    for (let i = 0; i < 16; i++) {
      const t0 = 0.5 + i * 0.14;
      const p = eo(seg(t, t0, t0 + 0.3));
      const s = this.cells[i];
      s.opacity = p;
      const env = eo(seg(t, t0 + 0.3, t0 + 1.1)) * (1 - eio(seg(t, 5.3, 6)));
      const br = 1 + env * 0.03 * Math.sin(t * 2.2 + i * 0.75);
      s.transform = 'translateY(' + (env * 4 * Math.sin(t * 1.7 + i * 1.3)) + 'px) scale(' + (lerp(1.08, 1, p) * br) + ')';
      this.old[i].opacity = 1 - eo(seg(t, t0 + 0.1, t0 + 0.3));
    }
    this.wrap.style.transform = 'scale(' + lerp(1.025, 1.04, eio(seg(t, 0, 6))) + ')';
  },
});