kit.scene('quotidien-txt', {
  init(kit) {
    this.draw = UI.textSlide(kit, ['Ces images sont partout autour de nous.', 'À force de voir toujours les mêmes,', 'on finit par croire que c’est la norme.'], { starts: [0.3, 1.8, 2.9], pink: [2] });
  },
  render(t) { this.draw(t); },
});