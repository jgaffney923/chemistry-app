import { makeAtom } from '../art/atoms.js';
import { MIN_TOUCH } from '../layout.js';
import { BOND_GAP } from './shapes.js';

const NUB = 0xffe066;
const OUT = 0x2b2350;

// One atom on the board. `bonds` maps each neighbor atom to the bond order
// (1 single, 2 double, 3 triple). Free bond spots are drawn as little nubs
// pointing away from its neighbors, and they wiggle to invite a connection.
export class Atom extends Phaser.GameObjects.Container {
  constructor(scene, x, y, symbol, info) {
    super(scene, x, y);
    scene.add.existing(this);
    this.symbol = symbol;
    this.valence = info.valence;
    this.radius = info.radius;
    this.bonds = new Map();

    this.nubs = scene.add.graphics();
    // Nubs go on top of the ball, so each free bond spot pokes out like a handle.
    this.add([makeAtom(scene, 0, 0, info.element, info.radius), this.nubs]);
    this.setDepth(10);
    this.setInteractive(new Phaser.Geom.Circle(0, 0, Math.max(info.radius + 20, MIN_TOUCH / 2)), Phaser.Geom.Circle.Contains);
  }

  free() {
    let used = 0;
    for (const order of this.bonds.values()) used += order;
    return this.valence - used;
  }

  // Every atom joined to this one, directly or through others.
  group() {
    const seen = new Set([this]);
    const queue = [this];
    while (queue.length) {
      for (const next of queue.shift().bonds.keys()) {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
    return seen;
  }

  // Redrawn every frame so the nubs follow neighbors and pulse gently.
  drawNubs(time) {
    this.nubs.clear();
    const count = this.free();
    if (!count) return;
    const taken = [...this.bonds.keys()].map((n) => Math.atan2(n.y - this.y, n.x - this.x));
    const size = 25 + Math.sin(time / 180) * 4;
    for (const angle of spreadAngles(taken, count)) {
      const x = Math.cos(angle) * (this.radius + 2);
      const y = Math.sin(angle) * (this.radius + 2);
      this.nubs.fillStyle(NUB, 1).fillCircle(x, y, size);
      this.nubs.lineStyle(5, OUT, 1).strokeCircle(x, y, size);
    }
  }
}

// Picks `count` directions as far as possible from the taken ones (and each other).
function spreadAngles(taken, count) {
  if (!taken.length) {
    return Array.from({ length: count }, (_, i) => -Math.PI / 2 + (Math.PI * 2 * i) / count);
  }
  const chosen = [];
  const used = [...taken];
  for (let n = 0; n < count; n++) {
    let best = 0, bestGap = -1;
    for (let deg = 0; deg < 360; deg += 10) {
      const a = Phaser.Math.DegToRad(deg);
      const gap = Math.min(...used.map((u) => Math.abs(Phaser.Math.Angle.Wrap(a - u))));
      if (gap > bestGap) {
        bestGap = gap;
        best = a;
      }
    }
    chosen.push(best);
    used.push(best);
  }
  return chosen;
}

export function bondLength(a, b) {
  return a.radius + b.radius + BOND_GAP;
}
