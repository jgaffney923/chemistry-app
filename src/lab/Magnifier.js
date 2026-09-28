import { magnifierTexture, LENS_R, LENS_OFFSET } from './props.js';
import { makeDraggable, returnTo } from '../systems/drag.js';

const WATER_BG = 0xb9e3ff;
const WATER_DOT = 0x3b8ed8;

// The magnifying glass. Held over the beaker, its lens shows a particle view of
// what's there (from beaker.lensView). onLook(viewType) is called when it's let go
// over the water, so the scene can explain what it shows.
export class Magnifier extends Phaser.GameObjects.Container {
  constructor(scene, x, y, beaker, { onLook, onTap }) {
    super(scene, x, y);
    scene.add.existing(this);
    this.home = { x, y };
    this.beaker = beaker;
    this.viewType = null;

    this.add(scene.add.image(0, 0, magnifierTexture(scene)));
    this.setInteractive(new Phaser.Geom.Circle(LENS_OFFSET.x, LENS_OFFSET.y, 150), Phaser.Geom.Circle.Contains);

    // The close-up view lives outside the container so a mask can clip it.
    this.view = scene.add.container(0, 0).setDepth(1990).setVisible(false);
    this.maskShape = scene.make.graphics({ add: false });
    this.maskShape.fillStyle(0xffffff).fillCircle(0, 0, LENS_R - 8);
    this.view.setMask(this.maskShape.createGeometryMask());

    makeDraggable(scene, this, {
      onPickUp: () => this.setDepth(2000),
      onTap,
      onDrop: () => {
        if (this.viewType) onLook(this.viewType);
        else returnTo(scene, this, this.home.x, this.home.y);
      },
    });
    this.on('drag', () => this.look());
    scene.events.on('update', this.follow, this);
    scene.events.once('shutdown', () => scene.events.off('update', this.follow, this));
  }

  get lensX() {
    return this.x + LENS_OFFSET.x * this.scaleX;
  }

  get lensY() {
    return this.y + LENS_OFFSET.y * this.scaleY;
  }

  // Keep the view and its mask under the lens, even while tweening home.
  follow() {
    this.view.setPosition(this.lensX, this.lensY);
    this.maskShape.setPosition(this.lensX, this.lensY);
  }

  look() {
    const over = Math.abs(this.lensX - this.beaker.x) < 200;
    const type = over ? this.beaker.lensView(this.lensY) : null;
    if (type === this.viewType) return;
    this.viewType = type;
    this.clearView();
    this.view.setVisible(Boolean(type));
    if (type) this.build(type);
  }

  build(type) {
    const s = this.scene;
    const r = LENS_R;
    const add = (obj) => {
      this.view.add(obj);
      return obj;
    };
    const jiggle = (dot, amount) => s.tweens.add({
      targets: dot,
      x: dot.x + Phaser.Math.Between(-amount, amount),
      y: dot.y + Phaser.Math.Between(-amount, amount),
      duration: Phaser.Math.Between(250, 600), yoyo: true, repeat: -1,
    });
    const dots = (count, color, size, top, bottom, amount = 10) => {
      for (let i = 0; i < count; i++) {
        const dot = add(s.add.circle(Phaser.Math.Between(-r, r), Phaser.Math.Between(top, bottom), size, color)
          .setStrokeStyle(3, 0x2b2350, 0.4));
        jiggle(dot, amount);
      }
    };

    add(s.add.circle(0, 0, r, WATER_BG));
    if (type === 'oil') {
      add(s.add.rectangle(0, -r / 2, r * 2, r, 0xf5d77a));
      add(s.add.rectangle(0, 0, r * 2, 5, 0x2b2350, 0.5));
      dots(8, 0xd9a400, 16, -r + 10, -12, 6);
      dots(9, WATER_DOT, 11, 14, r - 10);
    } else if (type === 'sand' || type === 'grains') {
      dots(10, WATER_DOT, 11, -r + 10, 20);
      const color = type === 'sand' ? 0xc9975a : 0xffffff;
      for (let i = 0; i < 4; i++) {
        add(s.add.rectangle(-75 + i * 50, r - 45 + (i % 2) * 12, 46, 40, color)
          .setStrokeStyle(4, 0x2b2350, 0.6).setAngle(i * 17));
      }
    } else if (type === 'dissolved') {
      dots(14, WATER_DOT, 11, -r + 10, r - 10);
      dots(9, 0xffffff, 9, -r + 10, r - 10, 14);
    } else {
      dots(18, WATER_DOT, 11, -r + 10, r - 10);
    }
  }

  clearView() {
    this.view.each((child) => this.scene.tweens.killTweensOf(child));
    this.view.removeAll(true);
  }

  goHome() {
    this.viewType = null;
    this.clearView();
    this.view.setVisible(false);
    returnTo(this.scene, this, this.home.x, this.home.y);
  }
}
