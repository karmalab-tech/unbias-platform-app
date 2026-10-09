kit.scene('internet-txt', {
  init(kit) {
    this.draw = UI.textSlide(kit, ['En 2022, des chercheurs ont rassemblé près de 6 milliards d’images d’Internet pour entraîner des IA.', 'Dedans\u00a0: des stéréotypes, des images sexualisées, des œuvres protégées.', 'Et tout ce qui est en ligne n’est pas libre d’utilisation.'], { starts: [0.3, 2.8, 5.0], pink: [2], source: 'Source\u00a0: LAION-5B (2022), reLAION-5B (2024).' });
  },
  render(t) { this.draw(t); },
});