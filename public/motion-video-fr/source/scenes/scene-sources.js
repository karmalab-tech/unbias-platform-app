const { seg, eo, ei, eio, lerp, TextFx } = kit;
const S_CAPS = ['médecin souriant, blouse blanche', 'famille heureuse au parc', 'portrait professionnel, fond gris', 'enfant qui joue dehors', 'femme au marché', 'homme d’affaires en costume', 'grand-mère en cuisine', 'équipe de bureau en réunion', 'selfie au coucher du soleil', 'illustration, ville la nuit'];
const S_TOP = 214, S_END = 960;
kit.scene('sources', {
  init(kit) {
    const g = kit.h('<div class="ground"></div>');
    kit.stage.append(g); this.g = g;
    const ra = kit.h('<div style="position:absolute;left:0;top:240px;height:300px"></div>');
    for (let i = 0; i < 8; i++) {
      const card = kit.h('<div class="card" style="left:' + (i * 430) + 'px;top:0;width:400px;height:300px;border-radius:16px"><div style="position:absolute;left:0;top:0;right:0;height:40px;background:color-mix(in srgb, var(--ground) 80%, var(--second))"></div><div style="position:absolute;left:16px;top:15px;width:10px;height:10px;border-radius:50%;background:var(--main)"></div><div style="position:absolute;left:34px;top:15px;width:10px;height:10px;border-radius:50%;background:var(--accent)"></div><div style="position:absolute;left:62px;top:11px;width:240px;height:18px;border-radius:9px;background:color-mix(in srgb, var(--ground) 60%, var(--second))"></div></div>');
      const u = UI.webImg(kit, i * 5 + 2);
      if (u) card.append(kit.h('<div class="pf" style="position:absolute;left:0;top:40px;width:240px;height:260px"><img src="' + u + '"></div>'));
      card.append(kit.h('<div class="bar" style="left:260px;top:70px;width:110px"></div>'));
      card.append(kit.h('<div class="bar" style="left:260px;top:104px;width:120px"></div>'));
      card.append(kit.h('<div class="bar" style="left:260px;top:138px;width:80px"></div>'));
      ra.append(card);
    }
    const rb = kit.h('<div style="position:absolute;left:0;top:580px;height:260px"></div>');
    for (let i = 0; i < 18; i++) rb.append(UI.tile(kit, i * 7 + 1, i * 215, 0, 195, 260, 14));
    const rc = kit.h('<div style="position:absolute;left:0;top:890px;height:60px"></div>');
    let x = 0;
    for (let i = 0; i < 14; i++) { const c = kit.h('<p class="webcap" style="left:' + x + 'px;top:0"></p>'); c.textContent = '«\u00a0' + S_CAPS[i % S_CAPS.length] + '\u00a0»'; rc.append(c); x += 40 + S_CAPS[i % S_CAPS.length].length * 19 + 80; }
    g.append(ra); g.append(rb); g.append(rc);
    this.rows = [[ra.style, -120, 0], [rb.style, -210, -200], [rc.style, -90, -100]];
    this.cover = kit.h('<div style="position:absolute;left:0;right:0;top:0;height:1200px;background:var(--ground)"></div>');
    g.append(this.cover); this.cover = this.cover.style;
    this.reveal = kit.h('<div style="position:absolute;left:0;right:0;top:' + S_TOP + 'px;height:0;overflow:hidden"><div class="words" style="left:140px;top:110px;width:1640px"><p class="line sources-a">Les entreprises d’IA ne disent pas tout sur leurs données.</p><p class="line pk sources-b">Mais on sait qu’une grande partie vient d’Internet.</p></div></div>');
    g.append(this.reveal);
    this.b = this.reveal.querySelector('.sources-b');
    this.reveal = this.reveal.style;
    this.line = kit.h('<div style="position:absolute;left:0;right:0;top:0;height:4px;background:var(--main)"></div>');
    g.append(this.line); this.line = this.line.style;
    g.append(kit.h('<div class="words" style="left:140px;top:60px;width:1640px"><h2 class="line pk sources-q">D’où viennent ces images\u00a0?</h2></div>'));
    this.q = g.querySelector('.sources-q');
    this.src = kit.h('<p class="src">Source\u00a0: Stanford, Foundation Model Transparency Index, 2025.</p>');
    g.append(this.src); this.src = this.src.style;
    UI.mark(kit, g);
  },
  render(t) {
    this.g.style.transform = 'scale(' + (1 + t * 0.004) + ')';
    TextFx.fadeFromRight(this.q, t, 0.2, { stagger: 0.09, dx: 26 });
    const fin = eo(seg(t, 0, 0.6));
    for (const [s, v, x0] of this.rows) { s.transform = 'translateX(' + (x0 + v * Math.min(t, 5)) + 'px)'; s.opacity = fin; }
    const c = eio(seg(t, 3.4, 4.6));
    const coverTop = lerp(1090, S_TOP, c);
    this.cover.transform = 'translateY(' + coverTop + 'px)';
    const o = eio(seg(t, 4.9, 6.3));
    const lineY = c < 1 ? coverTop : lerp(S_TOP, S_END, o);
    this.line.transform = 'translateY(' + (lineY - 2 + (o >= 1 ? 3 * Math.sin(t * 1.6) : 0)) + 'px)';
    this.line.opacity = c > 0 ? 1 : 0;
    this.reveal.height = (c < 1 ? 0 : Math.max(0, lineY - S_TOP)) + 'px';
    TextFx.fadeFromRight(this.b, t, 6.8, { stagger: 0.08, dx: 24 });
    this.src.opacity = eo(seg(t, 7.6, 8.2));
  },
});