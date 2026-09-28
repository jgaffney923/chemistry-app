import { COLORS } from '../layout.js';

// Placeholder atom art: a shaded ball with a simple cartoon face.
export function makeAtom(scene, x, y, element, radius) {
  const atom = scene.add.container(x, y);
  const g = scene.add.graphics();

  g.fillStyle(0x000000, 0.25);
  g.fillCircle(radius * 0.06, radius * 0.1, radius);
  g.fillStyle(COLORS[element], 1);
  g.fillCircle(0, 0, radius);
  g.fillStyle(0xffffff, 0.35);
  g.fillCircle(-radius * 0.35, -radius * 0.4, radius * 0.28);

  const face = element === 'carbon' ? 0xffffff : 0x222222;
  g.fillStyle(face, 1);
  g.fillCircle(-radius * 0.3, -radius * 0.05, radius * 0.1);
  g.fillCircle(radius * 0.3, -radius * 0.05, radius * 0.1);
  g.lineStyle(radius * 0.07, face, 1);
  g.beginPath();
  g.arc(0, radius * 0.15, radius * 0.3, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160));
  g.strokePath();

  atom.add(g);
  return atom;
}

// Water: two hydrogens on an oxygen, about 104.5 degrees apart.
export function makeWater(scene, x, y, size) {
  const water = scene.add.container(x, y);
  const spread = Phaser.Math.DegToRad(104.5 / 2);
  const dist = size * 1.2;
  for (const side of [-1, 1]) {
    water.add(makeAtom(scene, side * dist * Math.sin(spread), -dist * Math.cos(spread), 'hydrogen', size * 0.6));
  }
  water.add(makeAtom(scene, 0, 0, 'oxygen', size));
  return water;
}
