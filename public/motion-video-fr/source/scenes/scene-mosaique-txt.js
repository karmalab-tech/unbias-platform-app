kit.scene('mosaique-txt', {
  init(kit) {
    this.draw = UI.textSlide(kit, ['Pour apprendre, l’IA regarde', 'des milliards d’images et leurs descriptions.'], { starts: [0.3, 1.3], pink: [1] });
  },
  render(t) { this.draw(t); },
});