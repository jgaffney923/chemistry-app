import { addLabel } from '../ui/emoji.js';

export const BIN_W = 560;
export const BIN_H = 560;
const DROP_MARGIN = 70; // forgiving drop zone around the bin

// Particle pictures: tightly packed (solid), loose but touching (liquid), far apart (gas).
// Each dot jiggles by `move`: solids barely, liquids more, gases drift the most.
const PARTICLES = {
  solid: { move: 3, dots: grid(5, 3, 44, 0, 10) },
  liquid: {
    move: 10,
    dots: [[-100, 55], [-55, 60], [-10, 58], [35, 62], [80, 56], [120, 60],
      [-80, 15], [-35, 20], [10, 12], [55, 18], [100, 22], [-120, 25]],
  },
  gas: { move: 30, dots: [[-110, -50], [60, -60], [-20, 10], [110, 30], [-90, 55], [30, 70]] },
};

function grid(cols, rows, step, cx, cy) {
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push([cx + (c - (cols - 1) / 2) * step, cy + (r - (rows - 1) / 2) * step]);
    }
  }
  return dots;
}

// Rounded shapes drawn live on WebGL can show hairline seams, so each bin is
// drawn once into a texture and reused.
function binTexture(scene, state, color) {
  const key = `bin-${state}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ add: false });
  g.fillStyle(0x000000, 0.25);
  g.fillRoundedRect(0, 14, BIN_W, BIN_H, 48);
  g.fillStyle(color, 1);
  g.fillRoundedRect(0, 0, BIN_W, BIN_H, 48);
  g.fillStyle(0xffffff, 0.9);
  g.fillRoundedRect(BIN_W / 2 - 170, BIN_H / 2 - 170, 340, 200, 30);
  g.generateTexture(key, BIN_W, BIN_H + 14);
  g.destroy();
  return key;
}

export class Bin extends Phaser.GameObjects.Container {
  constructor(scene, x, y, state, info) {
    super(scene, x, y);
    scene.add.existing(this);
    this.state = state;
    this.color = Number(info.color);
    this.filled = 0;

    this.add(scene.add.image(0, 7, binTexture(scene, state, this.color)));

    this.add(addLabel(scene, 0, -225, info.label, 72));
    this.addParticles(scene, PARTICLES[state]);

    this.setSize(BIN_W, BIN_H).setInteractive();
  }

  addParticles(scene, { move, dots }) {
    for (const [dx, dy] of dots) {
      const dot = scene.add.circle(dx * 1.1, dy - 70, 19, this.color);
      this.add(dot);
      scene.tweens.add({
        targets: dot,
        x: dot.x + Phaser.Math.Between(-move, move),
        y: dot.y + Phaser.Math.Between(-move, move) * 0.6,
        duration: Phaser.Math.Between(300, 900),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  contains(x, y) {
    return Math.abs(x - this.x) < BIN_W / 2 + DROP_MARGIN
      && Math.abs(y - this.y) < BIN_H / 2 + DROP_MARGIN;
  }

  // Where the next sorted item sits, in scene coordinates.
  nextSlot() {
    const i = this.filled++;
    const col = i % 3, row = Math.floor(i / 3);
    return { x: this.x + (col - 1) * 150, y: this.y + 150 + row * 60 };
  }

  bounce() {
    this.scene.tweens.add({ targets: this, scaleY: 0.92, scaleX: 1.05, duration: 90, yoyo: true });
  }

  // Gentle glow to point a stuck kid at the right answer.
  pulse() {
    this.scene.tweens.add({ targets: this, scale: 1.08, duration: 280, yoyo: true, repeat: 3, ease: 'Sine.easeInOut' });
  }
}
