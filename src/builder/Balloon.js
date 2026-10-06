import { COLORS } from '../layout.js';
import { addLabel } from '../ui/emoji.js';

const RX = 170;
const RY = 200;
const OUT = 0x2b2350;
// Where each gas molecule floats inside the balloon (balloon coordinates).
const SPOTS = [[-70, -90], [60, -60], [-40, 30], [75, 60], [-5, -10], [10, 110], [-90, 90], [90, -120]];
const COLOR = { nitrogen: COLORS.nitrogen, oxygen: COLORS.oxygen };

// The Air Builder balloon. It takes finished nitrogen and oxygen molecules until
// it holds the real mix of air: about 4 nitrogen for every 1 oxygen. A row of
// slots underneath shows what's still needed. It grows as it fills.
export class Balloon extends Phaser.GameObjects.Container {
  constructor(scene, x, y, recipe) {
    super(scene, x, y);
    scene.add.existing(this);
    this.recipe = recipe; // { nitrogen: 4, oxygen: 1 }
    this.total = Object.values(recipe).reduce((a, b) => a + b, 0);

    const string = scene.add.graphics();
    string.lineStyle(5, 0xffffff, 0.7);
    string.strokePoints([{ x: 0, y: RY }, { x: 18, y: RY + 90 }, { x: -12, y: RY + 180 }, { x: 6, y: RY + 260 }]);
    this.body = scene.add.container(0, 0);
    const skin = scene.add.graphics();
    skin.fillStyle(0xffb3c7, 0.55).fillEllipse(0, 0, RX * 2, RY * 2);
    skin.lineStyle(8, OUT, 1).strokeEllipse(0, 0, RX * 2, RY * 2);
    skin.fillStyle(0xffffff, 0.5).fillEllipse(-80, -110, 40, 70);
    skin.fillStyle(0xffb3c7, 1).fillTriangle(0, RY - 6, -22, RY + 26, 22, RY + 26);
    skin.lineStyle(6, OUT, 1).strokeTriangle(0, RY - 6, -22, RY + 26, 22, RY + 26);
    // The string hangs from the knot, so it grows with the balloon.
    this.body.add([string, skin]);
    this.inside = scene.add.container(0, 0);
    this.body.add(this.inside);
    this.add(this.body);

    // One slot per molecule needed, nitrogen first, then oxygen.
    this.slots = [];
    const order = Object.entries(recipe).flatMap(([id, n]) => Array(n).fill(id));
    order.forEach((id, i) => {
      const slot = scene.add.circle((i - (order.length - 1) / 2) * 76, RY + 330, 30, 0xffffff, 0.12)
        .setStrokeStyle(7, COLOR[id]);
      slot.gas = id;
      this.slots.push(slot);
      this.add(slot);
    });
    this.add(addLabel(scene, 0, RY + 395, 'Air', 52));

    this.setSize(RX * 2, RY * 2);
    this.setInteractive(new Phaser.Geom.Ellipse(0, 0, RX * 2 + 40, RY * 2 + 40), Phaser.Geom.Ellipse.Contains);
    this.reset();
  }

  reset() {
    this.counts = Object.fromEntries(Object.keys(this.recipe).map((id) => [id, 0]));
    this.inside.list.forEach((pair) => this.scene.tweens.killTweensOf(pair));
    this.inside.removeAll(true);
    this.slots.forEach((slot) => slot.setFillStyle(0xffffff, 0.12));
    this.body.setScale(this.sizeFor(0));
  }

  sizeFor(count) {
    return 0.55 + (0.45 * count) / this.total;
  }

  // True if this molecule still has room in the mix.
  wants(id) {
    return id in this.recipe && this.counts[id] < this.recipe[id];
  }

  // Counts a molecule in now, so the next one is judged right away. Returns a
  // function that draws it inside, to call once it has flown in.
  take(id) {
    this.counts[id]++;
    const filled = Object.values(this.counts).reduce((a, b) => a + b, 0);
    return () => {
      const [sx, sy] = SPOTS[(filled - 1) % SPOTS.length];
      const pair = this.scene.add.container(sx, sy);
      pair.add([this.scene.add.circle(-17, 0, 22, COLOR[id]).setStrokeStyle(4, OUT), this.scene.add.circle(17, 0, 22, COLOR[id]).setStrokeStyle(4, OUT)]);
      pair.setAngle(Phaser.Math.Between(-40, 40));
      this.inside.add(pair);
      this.scene.tweens.add({ targets: pair, x: sx + 14, y: sy - 10, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.slots.find((s) => s.gas === id && s.fillAlpha < 1)?.setFillStyle(COLOR[id], 1);
      this.scene.tweens.add({ targets: this.body, scale: this.sizeFor(filled), duration: 500, ease: 'Back.easeOut' });
    };
  }

  isFull() {
    return Object.keys(this.recipe).every((id) => this.counts[id] >= this.recipe[id]);
  }
}
