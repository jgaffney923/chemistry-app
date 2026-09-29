import { BEAKER, beakerTexture } from './props.js';
import { addItemArt } from '../art/items.js';

const { w: W, h: H } = BEAKER;
const BOTTOM = H / 2 - 6;
const SURFACE = BOTTOM - BEAKER.water;
const INNER = W / 2 - 14;
const WATER = 0x7fc8ff;

const GRAINS = {
  sugar: { color: 0xffffff, size: 16, count: 14 },
  salt: { color: 0xf1f3f8, size: 11, count: 18 },
  sand: { color: 0xc9975a, size: 13, count: 22 },
  bakingSoda: { color: 0xffffff, size: 8, count: 26 },
};

// The beaker of water and everything added to it.
// addIngredient() and stir() change what's inside and report any discoveries; the scene
// decides what to say. Sugar and salt sit as grains until stirred, then dissolve:
// they vanish from view but stay "in" the water (the magnifier still finds them).
export class Beaker extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);
    this.water = scene.add.rectangle(0, (SURFACE + BOTTOM) / 2, INNER * 2, BOTTOM - SURFACE, WATER, 0.4);
    this.add(this.water);
    this.add(scene.add.image(0, 0, beakerTexture(scene)));
    this.reset(false);
  }

  get surfaceY() {
    return this.y + SURFACE;
  }

  contains(x, y) {
    return Math.abs(x - this.x) < W / 2 + 60 && y > this.y - H / 2 - 120 && y < this.y + H / 2 + 40;
  }

  // Empty and refill with clean water.
  reset(animate = true) {
    this.contents?.forEach((obj) => {
      this.scene.tweens.killTweensOf(obj);
      obj.destroy();
    });
    this.contents = [];
    this.state = { ice: false, sugar: 'none', salt: 'none', sand: false, oil: false, bakingSoda: false, vinegar: false };
    this.grains = {};
    this.iceArt = null;
    this.oilLayer = null;
    if (animate) {
      this.scene.tweens.add({ targets: this.water, alpha: { from: 0, to: 0.4 }, duration: 600 });
    }
  }

  // Returns { stickers, line } for the scene to act on.
  // (Not named add(): that's the Container method for attaching children.)
  addIngredient(id) {
    const stickers = [];
    let line = null;
    switch (id) {
      case 'ice':
        if (!this.state.ice) this.addIce();
        stickers.push('iceFloats');
        break;
      case 'sugar':
      case 'salt':
        this.dropGrains(id);
        this.state[id] = 'grains';
        line = 'lab.stir';
        break;
      case 'sand':
        if (!this.state.sand) this.dropGrains('sand');
        this.state.sand = true;
        line = 'lab.stir';
        break;
      case 'oil':
        if (!this.state.oil) this.addOil();
        stickers.push('oilFloats');
        break;
      case 'bakingSoda':
        if (!this.state.bakingSoda) this.dropGrains('bakingSoda');
        this.state.bakingSoda = true;
        if (!this.state.vinegar) line = 'lab.bakingSodaAlone';
        break;
      case 'vinegar':
        this.pour(0xf1e6c4);
        this.state.vinegar = true;
        if (!this.state.bakingSoda) line = 'lab.vinegarAlone';
        break;
      default:
        return { stickers, line: 'lab.notInBeaker', rejected: true };
    }
    if (this.state.bakingSoda && this.state.vinegar) {
      this.fizz();
      stickers.push('fizz');
    }
    return { stickers, line };
  }

  // Stirring dissolves sugar and salt; sand swirls up and sinks back.
  stir() {
    const stickers = [];
    this.swirl();
    for (const id of ['sugar', 'salt']) {
      if (this.state[id] === 'grains') {
        this.state[id] = 'dissolved';
        this.fadeGrains(id);
        stickers.push(`${id}Dissolves`);
      }
    }
    if (this.state.sand) {
      this.stirUp('sand');
      stickers.push('sandSinks');
    }
    return stickers;
  }

  // What the magnifier sees at scene height y.
  lensView(y) {
    const local = y - this.y;
    if (local < SURFACE - 40 || local > BOTTOM + 30) return null;
    const nearTop = local < SURFACE + 80;
    const nearBottom = local > BOTTOM - 110;
    if (nearTop && this.state.oil) return 'oil';
    if (nearBottom && this.state.sand) return 'sand';
    if (nearBottom && (this.state.sugar === 'grains' || this.state.salt === 'grains')) return 'grains';
    if (this.state.sugar === 'dissolved' || this.state.salt === 'dissolved') return 'dissolved';
    return 'water';
  }

  // --- Visuals

  keep(obj) {
    this.add(obj);
    this.contents.push(obj);
    return obj;
  }

  addIce() {
    this.state.ice = true;
    const ice = this.keep(addItemArt(this.scene, { id: 'ice', emoji: '🧊' }, 60, SURFACE - 300, 150));
    this.iceArt = ice;
    this.scene.tweens.add({
      targets: ice, y: SURFACE + 10, duration: 600, ease: 'Bounce.easeOut',
      onComplete: () => this.scene.tweens.add({ targets: ice, y: ice.y + 10, angle: 6, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }),
    });
  }

  addOil() {
    this.state.oil = true;
    this.pour(0xf2c230);
    const layer = this.keep(this.scene.add.rectangle(0, SURFACE + 28, INNER * 2, 56, 0xf2c230, 0.85).setAlpha(0));
    this.oilLayer = layer;
    this.scene.tweens.add({ targets: layer, alpha: 1, duration: 600, delay: 500 });
    if (this.iceArt) this.bringToTop(this.iceArt);
  }

  // A stream poured in from above the rim.
  pour(color) {
    const top = -H / 2 - 160;
    const stream = this.scene.add.rectangle(-60, top, 30, SURFACE - top, color)
      .setOrigin(0.5, 0).setScale(1, 0);
    this.add(stream);
    this.scene.tweens.add({
      targets: stream, scaleY: 1, duration: 250, yoyo: true, hold: 500,
      onComplete: () => stream.destroy(),
    });
  }

  dropGrains(id) {
    const { color, size, count } = GRAINS[id];
    const list = this.grains[id] || (this.grains[id] = []);
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(-INNER + 20, INNER - 20);
      const restY = BOTTOM - size - Phaser.Math.Between(0, 22);
      const grain = this.keep(this.scene.add.rectangle(x, SURFACE - 120, size, size, color)
        .setStrokeStyle(3, 0x2b2350, 0.5).setAngle(Phaser.Math.Between(0, 90)));
      list.push(grain);
      this.scene.tweens.add({ targets: grain, y: restY, duration: 700 + i * 25, ease: 'Quad.easeIn' });
    }
  }

  fadeGrains(id) {
    const list = this.grains[id] || [];
    this.grains[id] = [];
    list.forEach((grain, i) => {
      this.scene.tweens.add({
        targets: grain, alpha: 0, scale: 0.2, duration: 900, delay: 300 + i * 30,
        onComplete: () => grain.destroy(),
      });
    });
  }

  stirUp(id) {
    for (const grain of this.grains[id] || []) {
      const restY = grain.y;
      this.scene.tweens.add({
        targets: grain,
        y: SURFACE + Phaser.Math.Between(60, 300),
        x: Phaser.Math.Clamp(grain.x + Phaser.Math.Between(-80, 80), -INNER + 20, INNER - 20),
        duration: 500,
        ease: 'Quad.easeOut',
        onComplete: () => this.scene.tweens.add({ targets: grain, y: restY, duration: 1600, ease: 'Quad.easeIn' }),
      });
    }
  }

  swirl() {
    const g = this.scene.add.graphics({ x: 0, y: (SURFACE + BOTTOM) / 2 });
    this.add(g);
    g.lineStyle(10, 0xffffff, 0.6);
    for (const r of [60, 120, 180]) {
      g.beginPath();
      g.arc(0, 0, r, 0, Math.PI * 1.2);
      g.strokePath();
    }
    this.scene.tweens.add({
      targets: g, alpha: { from: 1, to: 0 }, duration: 1200,
      onUpdate: (tw) => g.setRotation(tw.progress * 4),
      onComplete: () => g.destroy(),
    });
    if (this.oilLayer) {
      this.scene.tweens.add({ targets: this.oilLayer, scaleY: 0.4, y: this.oilLayer.y + 60, duration: 400, yoyo: true, hold: 300 });
    }
  }

  // Baking soda + vinegar: a burst of carbon dioxide bubbles. The baking soda gets used up.
  fizz() {
    this.state.bakingSoda = false;
    this.state.vinegar = false;
    this.fadeGrains('bakingSoda');
    const foam = this.keep(this.scene.add.rectangle(0, SURFACE - 10, INNER * 2, 50, 0xffffff, 0.9).setScale(1, 0));
    this.scene.tweens.add({ targets: foam, scaleY: 1, duration: 500, delay: 400, hold: 2600, yoyo: true, onComplete: () => foam.destroy() });
    for (let i = 0; i < 70; i++) {
      const bubble = this.scene.add.circle(
        Phaser.Math.Between(-INNER + 20, INNER - 20), BOTTOM - 20, Phaser.Math.Between(8, 20), 0xffffff, 0.8,
      ).setStrokeStyle(3, 0xbfe8ff);
      this.add(bubble);
      this.scene.tweens.add({
        targets: bubble,
        y: SURFACE - Phaser.Math.Between(0, 120),
        x: bubble.x + Phaser.Math.Between(-30, 30),
        alpha: { from: 0.9, to: 0 },
        duration: Phaser.Math.Between(900, 1500),
        delay: i * 45,
        ease: 'Quad.easeIn',
        onComplete: () => bubble.destroy(),
      });
    }
  }
}
