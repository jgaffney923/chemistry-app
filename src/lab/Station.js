import { HOT_PLATE, FREEZER, hotPlateTexture, freezerTexture } from './props.js';

// The hot plate ("heat") or the freezer ("cool"). Holds at most one item, which
// sits at `slot`. glow() shows it working.
export class Station extends Phaser.GameObjects.Container {
  constructor(scene, x, y, kind) {
    super(scene, x, y);
    scene.add.existing(this);
    this.kind = kind;
    this.item = null;
    const heat = kind === 'heat';
    const size = heat ? HOT_PLATE : FREEZER;

    if (heat) {
      this.glowShape = scene.add.ellipse(0, 90 - size.h / 2, 300, 118, 0xff5a2e, 0);
    } else {
      this.glowShape = scene.add.rectangle(0, -40, size.w - 60, size.h - 100, 0xffffff, 0);
    }
    this.add([scene.add.image(0, 0, heat ? hotPlateTexture(scene) : freezerTexture(scene)), this.glowShape]);
    this.slot = heat ? { x, y: y - 110 } : { x, y: y - 40 };
    this.setSize(size.w, size.h).setInteractive();
  }

  contains(x, y) {
    return Math.abs(x - this.x) < this.width / 2 + 40 && Math.abs(y - this.y) < this.height / 2 + 80;
  }

  glow() {
    this.scene.tweens.killTweensOf(this.glowShape);
    this.scene.tweens.add({
      targets: this.glowShape,
      fillAlpha: { from: 0, to: this.kind === 'heat' ? 0.75 : 0.5 },
      duration: 350,
      yoyo: true,
      hold: 500,
    });
  }
}
