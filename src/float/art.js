// Drawn art for Sink or Float: the things to test and the three liquid bottles.
// Each picture is drawn once into a tight texture ("float-<id>"), so an image's
// height is the object's real height. That matters: a floating thing is placed
// by how much of it sits under the water.

const OUT = 0x2b2350;
const LINE = 7;

// Each entry: texture width and height, and a draw function with (0, 0) at the centre.
const DRAW = {
  cork: [200, 150, (g) => {
    poly(g, [[-80, -60], [80, -60], [65, 60], [-65, 60]], 0xc68c52);
    g.fillStyle(0xe0b07c, 1).fillEllipse(0, -60, 160, 26);
    g.lineStyle(LINE, OUT, 1).strokeEllipse(0, -60, 160, 26);
    g.fillStyle(0x936036, 1);
    for (const [x, y] of [[-40, -10], [10, 5], [45, -20], [-20, 30], [30, 40], [-55, 25]]) g.fillCircle(x, y, 6);
  }],

  rock: [240, 170, (g) => {
    const outline = [[-112, 40], [-98, -20], [-55, -70], [15, -80], [80, -55], [115, 5], [102, 55], [35, 78], [-60, 75]];
    poly(g, outline, 0x9aa0a6);
    g.fillStyle(0xbfc4c9, 1).fillCircle(-40, -30, 16).fillCircle(35, -45, 10);
    g.fillStyle(0x6d7378, 1).fillCircle(60, 12, 8).fillCircle(-10, 40, 6);
  }],

  coin: [130, 130, (g) => {
    ring(g, 0, 0, 58, 0xe0a83a);
    g.lineStyle(5, 0xa8741f, 1).strokeCircle(0, 0, 42);
    g.fillStyle(0xf6d27a, 1).fillEllipse(-18, -20, 26, 12);
  }],

  apple: [220, 220, (g) => {
    const body = [];
    for (let a = 0; a < 360; a += 8) {
      const t = Phaser.Math.DegToRad(a);
      const dent = 1 - 0.16 * Math.max(0, -Math.sin(t)) ** 8; // dip at the top
      body.push([92 * Math.cos(t) * dent, 15 + 88 * Math.sin(t) * dent]);
    }
    poly(g, body, 0xd83a3a);
    g.fillStyle(0xf07a6a, 1).fillEllipse(-40, -10, 26, 44);
    g.lineStyle(10, 0x6b4a2b, 1).lineBetween(0, -60, 10, -100);
    poly(g, [[12, -80], [60, -105], [40, -70]], 0x4caf50);
  }],

  grape: [110, 140, (g) => {
    g.lineStyle(8, 0x6b4a2b, 1).lineBetween(0, -45, 6, -66);
    ring(g, 0, 10, 0, 0x7d3c98, 46, 56);
    g.fillStyle(0xb57edc, 1).fillEllipse(-16, -8, 16, 26);
  }],

  ice: [190, 190, (g) => {
    poly(g, [[-85, -40], [0, 0], [0, 90], [-85, 50]], 0xb5e3f7);
    poly(g, [[85, -40], [0, 0], [0, 90], [85, 50]], 0x8fd0ee);
    poly(g, [[0, -85], [85, -40], [0, 0], [-85, -40]], 0xe6f7ff);
    g.fillStyle(0xffffff, 1).fillPoints(pts([[-70, -20], [-55, -12], [-55, 38], [-70, 30]]), true);
  }],

  duck: [240, 200, (g) => {
    poly(g, [[-110, 0], [-60, -25], [60, -25], [105, 5], [80, 80], [-80, 80]], 0xffd23f);
    ring(g, 45, -45, 0, 0xffd23f, 50, 48);
    poly(g, [[85, -50], [125, -40], [88, -28]], 0xf28c28);
    g.fillStyle(OUT, 1).fillCircle(58, -58, 8);
    g.lineStyle(6, 0xe0a800, 1).strokePoints(pts([[-55, 15], [-15, 40], [25, 15]]), false);
  }],

  spoon: [260, 120, (g) => {
    poly(g, [[-120, -12], [15, -8], [15, 8], [-120, 12]], 0xb8c2cc);
    ring(g, 70, 0, 0, 0xb8c2cc, 60, 42);
    g.fillStyle(0xe3e8ee, 1).fillEllipse(66, 0, 80, 50);
    g.fillStyle(0xffffff, 1).fillEllipse(55, -12, 30, 10);
  }],

  log: [340, 170, (g) => {
    poly(g, [[-120, -65], [120, -65], [120, 65], [-120, 65]], 0x8b5a2b);
    g.lineStyle(5, 0x6b4220, 1);
    for (const y of [-35, 0, 35]) g.lineBetween(-110, y, 90, y + 6);
    ring(g, -120, 0, 0, 0x8b5a2b, 40, 65);
    ring(g, 120, 0, 0, 0xe2b77a, 40, 65);
    g.lineStyle(4, 0xa6773f, 1).strokeEllipse(120, 0, 50, 85).strokeEllipse(120, 0, 22, 40);
  }],

  orange: [200, 200, (g) => {
    ring(g, 0, 5, 88, 0xf28c28);
    g.fillStyle(0xd96f12, 1);
    for (let i = 0; i < 18; i++) g.fillCircle(Math.cos(i * 2.4) * (20 + i * 3.5), 5 + Math.sin(i * 2.4) * (20 + i * 3.5), 4);
    g.fillStyle(0xffc078, 1).fillEllipse(-35, -30, 30, 18);
    poly(g, [[0, -78], [40, -98], [25, -72]], 0x4caf50);
  }],

  peeledOrange: [180, 180, (g) => {
    ring(g, 0, 0, 78, 0xffa94d);
    g.lineStyle(5, 0xfff0d6, 1);
    for (let i = 0; i < 5; i++) {
      const t = (Math.PI * 2 * i) / 5 + 0.3;
      g.lineBetween(0, 0, Math.cos(t) * 76, Math.sin(t) * 76);
    }
    g.fillStyle(0xfff0d6, 1).fillCircle(0, 0, 10);
  }],

  // Bottles for the liquid tower.
  honeyBottle: [190, 240, (g) => bottle(g, 0xd98e04, 0xf2b01e)],
  waterBottle: [190, 240, (g) => bottle(g, 0x4fb3ff, 0xd6efff)],
  oilBottle: [190, 240, (g) => bottle(g, 0xf7dc6f, 0x3c8d4a)],
};

// The liquids in the tall glass, by the same id as their bottle's name.
export const LIQUID_COLORS = { honey: 0xd98e04, water: 0x7cc8f0, oil: 0xf7dc6f };

// Adds a Sink or Float picture, `height` game units tall (width follows).
export function floatArt(scene, id, x, y, height) {
  const key = floatTexture(scene, id);
  const img = scene.add.image(x, y, key);
  img.setScale(height / img.height);
  return img;
}

export function floatTexture(scene, id) {
  const key = `float-${id}`;
  if (!scene.textures.exists(key)) {
    const [w, h, draw] = DRAW[id];
    const g = scene.make.graphics({ add: false });
    g.translateCanvas(w / 2, h / 2);
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }
  return key;
}

// The round tank picture on the Float and Sink buttons: a ball floating at the
// top, or resting on the bottom.
export function guessIcon(scene, floats) {
  const icon = scene.add.container(0, 0);
  const g = scene.add.graphics();
  g.fillStyle(0x7cc8f0, 1).fillRect(-70, -30, 140, 95);
  g.lineStyle(8, OUT, 1).strokeRect(-70, -65, 140, 130);
  g.fillStyle(0xe8453c, 1).lineStyle(6, OUT, 1);
  const y = floats ? -30 : 38;
  g.fillCircle(0, y, 26).strokeCircle(0, y, 26);
  icon.add(g);
  return icon;
}

// --- Drawing helpers

function pts(list) {
  return list.map(([x, y]) => ({ x, y }));
}

function poly(g, list, color) {
  g.fillStyle(color, 1).fillPoints(pts(list), true);
  g.lineStyle(LINE, OUT, 1).strokePoints(pts(list), true, true);
}

// A filled, outlined circle (r) or ellipse (rx, ry).
function ring(g, x, y, r, color, rx = r, ry = r) {
  g.fillStyle(color, 1).fillEllipse(x, y, rx * 2, ry * 2);
  g.lineStyle(LINE, OUT, 1).strokeEllipse(x, y, rx * 2, ry * 2);
}

function bottle(g, liquid, cap) {
  const outline = [[-70, 110], [70, 110], [70, -10], [30, -55], [30, -85], [-30, -85], [-30, -55], [-70, -10]];
  g.fillStyle(0xffffff, 0.35).fillPoints(pts(outline), true);
  g.fillStyle(liquid, 1).fillPoints(pts([[-64, 104], [64, 104], [64, 0], [-64, 0]]), true);
  g.fillStyle(0xffffff, 0.5).fillRect(-50, 12, 12, 80);
  g.lineStyle(LINE, OUT, 1).strokePoints(pts(outline), true, true);
  poly(g, [[-36, -85], [36, -85], [36, -112], [-36, -112]], cap);
}
