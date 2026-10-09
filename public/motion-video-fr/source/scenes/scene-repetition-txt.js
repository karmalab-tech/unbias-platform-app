kit.scene('repetition-txt', {
  init(kit) {
    this.draw = UI.textSlide(kit, ['Ces images viennent de notre société.', 'Et elle ne montre pas tout le monde de la même façon.'], { starts: [0.3, 1.8], pink: [1] });
  },
  render(t) { this.draw(t); },
});