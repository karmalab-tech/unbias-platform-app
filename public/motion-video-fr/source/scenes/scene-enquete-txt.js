kit.scene('enquete-txt', {
  init(kit) {
    this.draw = UI.textSlide(kit, ['Pour repérer un biais, on compare les images, on compte ce qui revient, on cherche ce qui manque.', 'C’est un début d’enquête, pas une conclusion.'], { starts: [0.3, 2.6], pink: [1] });
  },
  render(t) { this.draw(t); },
});