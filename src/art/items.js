// Drawn art for the Sorter items: flat colors with a dark outline.
// Each item is drawn once into a texture ("item-<id>"). If items.json gives an
// item an "image" file, that picture is loaded instead and this drawing is skipped.
//
// Science notes baked into the pictures:
// - Liquids show the liquid itself (pouring into a puddle), not a cup or carton,
//   because a container is a solid.
// - Gases carry the same purple dots as the Gas bin, since most gases are invisible.

import { addEmoji } from '../ui/emoji.js';

const SIZE = 300;
const C = SIZE / 2;
const OUT = 0x2b2350;
const LINE = 7;
const GAS_DOT = 0xa77cf2;

export function addItemArt(scene, item, x, y, displaySize = 280) {
  const key = `item-${item.id}`;
  if (!scene.textures.exists(key) && DRAW[item.id]) {
    const g = scene.make.graphics({ add: false });
    DRAW[item.id](g);
    g.generateTexture(key, SIZE, SIZE);
    g.destroy();
  }
  if (scene.textures.exists(key)) {
    const img = scene.add.image(x, y, key);
    img.setScale(displaySize / Math.max(img.width, img.height));
    return img;
  }
  return addEmoji(scene, x, y, item.emoji, displaySize * 0.7);
}

// --- Drawing helpers (coordinates are centered: -150..150)

const at = (pts) => pts.map(([x, y]) => ({ x: x + C, y: y + C }));

function fill(g, pts, color, alpha = 1) {
  g.fillStyle(color, alpha);
  g.fillPoints(at(pts), true);
}

function stroke(g, pts, closed = true, width = LINE, color = OUT) {
  g.lineStyle(width, color, 1);
  g.strokePoints(at(pts), closed, closed);
}

function shape(g, pts, color, alpha = 1) {
  fill(g, pts, color, alpha);
  stroke(g, pts);
}

function ellipse(cx, cy, rx, ry, rotDeg = 0, n = 40) {
  const r = Phaser.Math.DegToRad(rotDeg);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (Math.PI * 2 * i) / n;
    const ex = rx * Math.cos(t), ey = ry * Math.sin(t);
    pts.push([cx + ex * Math.cos(r) - ey * Math.sin(r), cy + ex * Math.sin(r) + ey * Math.cos(r)]);
  }
  return pts;
}

const circle = (cx, cy, r) => ellipse(cx, cy, r, r);

function rotate(pts, deg) {
  const r = Phaser.Math.DegToRad(deg);
  return pts.map(([x, y]) => [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)]);
}

function dots(g, list, r = 12) {
  for (const [x, y] of list) shape(g, circle(x, y, r), GAS_DOT);
}

// A liquid pouring down into a puddle. Only the stream's sides are outlined,
// so it blends into the puddle.
function pour(g, color, light, { width = 36, bottom = 95 } = {}) {
  shape(g, ellipse(0, 100, 120, 36), color);
  fill(g, ellipse(-35, 94, 40, 10), light);

  const left = [], right = [];
  for (let y = -145; y <= bottom; y += 10) {
    const wobble = Math.sin(y / 22) * 4;
    const w = width / 2 + (y + 145) * 0.03;
    left.push([-w + wobble, y]);
    right.push([w + wobble, y]);
  }
  fill(g, [...left, ...right.slice().reverse()], color);
  stroke(g, left, false);
  stroke(g, right, false);
  fill(g, [[-width / 2 + 6, -135], [-width / 2 + 13, -135], [-width / 2 + 17, 40], [-width / 2 + 8, 40]], light);
}

// --- Items

const DRAW = {
  ice(g) {
    shape(g, [[-95, -50], [0, -5], [0, 100], [-95, 55]], 0xb5e3f7);
    shape(g, [[95, -50], [0, -5], [0, 100], [95, 55]], 0x8fd0ee);
    shape(g, [[0, -100], [95, -50], [0, -5], [-95, -50]], 0xe6f7ff);
    fill(g, [[-78, -28], [-60, -18], [-60, 40], [-78, 30]], 0xffffff);
  },

  rock(g) {
    const outline = [[-115, 45], [-100, -15], [-55, -65], [15, -80], [80, -55], [118, 5], [105, 60], [35, 82], [-60, 78]];
    fill(g, outline, 0x9aa0a6);
    fill(g, [[-112, 42], [-60, 66], [35, 72], [100, 52], [112, 12], [60, 36], [-20, 46]], 0x7c8288);
    fill(g, circle(-40, -30, 16), 0xbfc4c9);
    fill(g, circle(35, -45, 10), 0xbfc4c9);
    fill(g, circle(60, 12, 8), 0x6d7378);
    stroke(g, outline);
  },

  spoon(g) {
    shape(g, [[-95, 115], [20, 0], [0, -20], [-115, 95]], 0xb8c2cc);
    shape(g, circle(-105, 105, 15), 0xb8c2cc);
    shape(g, ellipse(55, -55, 64, 44, -45), 0xb8c2cc);
    fill(g, ellipse(50, -50, 42, 26, -45), 0xe3e8ee);
    fill(g, ellipse(35, -70, 16, 7, -45), 0xffffff);
  },

  brick(g) {
    shape(g, [[-115, -15], [85, -15], [85, 80], [-115, 80]], 0xc8553d);
    shape(g, [[-115, -15], [-75, -60], [125, -60], [85, -15]], 0xe0785c);
    shape(g, [[85, -15], [125, -60], [125, 35], [85, 80]], 0xa3402b);
    for (const [x, y] of [[-80, 20], [-30, 50], [20, 15], [55, 55], [-60, 60]]) {
      fill(g, circle(x, y, 5), 0xa3402b);
    }
  },

  teddy(g) {
    const fur = 0xa8733f, light = 0xdcb48a;
    for (const x of [-58, 58]) {
      shape(g, circle(x, -95, 30), fur);
      fill(g, circle(x, -95, 15), light);
    }
    for (const x of [-50, 50]) {
      shape(g, circle(x, 108, 30), fur);
      fill(g, circle(x, 108, 15), light);
    }
    shape(g, ellipse(0, 60, 80, 70), fur);
    fill(g, ellipse(0, 68, 45, 40), light);
    shape(g, circle(-82, 38, 28), fur);
    shape(g, circle(82, 38, 28), fur);
    shape(g, circle(0, -45, 68), fur);
    shape(g, ellipse(0, -22, 36, 26), light);
    fill(g, ellipse(0, -32, 13, 9), OUT);
    fill(g, circle(-26, -62, 8), OUT);
    fill(g, circle(26, -62, 8), OUT);
    g.lineStyle(5, OUT, 1);
    g.beginPath();
    g.arc(C, C - 20, 12, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160));
    g.strokePath();
  },

  crayon(g) {
    const r = (pts) => rotate(pts, -35);
    shape(g, r([[-115, -30], [60, -30], [60, 30], [-115, 30]]), 0x3c8dde);
    shape(g, r([[-85, -30], [25, -30], [25, 30], [-85, 30]]), 0x2a6db5);
    fill(g, r([[-72, -30], [-62, -30], [-62, 30], [-72, 30]]), 0x8fc2f2);
    fill(g, r([[2, -30], [12, -30], [12, 30], [2, 30]]), 0x8fc2f2);
    shape(g, r([[60, -30], [60, 30], [118, 7], [118, -7]]), 0x5aa4ec);
    shape(g, r([[104, -12], [118, -7], [118, 7], [104, 12]]), 0x2a6db5);
  },

  water(g) {
    // A drop: tangent lines from the tip meet a circle at +/-30 degrees.
    const drop = [[0, -125]];
    for (let a = -30; a <= 210; a += 6) {
      const t = Phaser.Math.DegToRad(a);
      drop.push([80 * Math.cos(t), 35 + 80 * Math.sin(t)]);
    }
    shape(g, drop, 0x4fb3ff);
    fill(g, ellipse(-32, 25, 14, 30, 15), 0xd6efff);
    shape(g, circle(100, -55, 15), 0x4fb3ff);
    shape(g, circle(-100, -30, 11), 0x4fb3ff);
  },

  milk(g) {
    pour(g, 0xffffff, 0xe9eef7, { width: 40 });
    for (const [x, y, r] of [[-95, 60, 11], [100, 55, 13], [-60, 30, 8], [70, 25, 9]]) shape(g, circle(x, y, r), 0xffffff);
  },

  juice(g) {
    pour(g, 0xff9f1c, 0xffc978, { width: 34 });
    for (const [x, y, r] of [[-95, 58, 12], [98, 52, 10], [-58, 28, 8], [66, 22, 9]]) shape(g, circle(x, y, r), 0xff9f1c);
  },

  honey(g) {
    const gold = 0xf2b01e, light = 0xffd76a;
    // Thick, slow ribbon folding onto itself.
    shape(g, ellipse(0, 110, 112, 28), gold);
    shape(g, ellipse(-14, 88, 76, 22, -6), gold);
    shape(g, ellipse(10, 68, 50, 17, 8), gold);
    shape(g, [[-78, 104], [-66, 104], [-68, 128], [-74, 132], [-80, 128]], gold);
    const left = [], right = [];
    for (let y = -145; y <= 62; y += 10) {
      const w = 22 + (y + 145) * 0.04;
      const wobble = Math.sin(y / 30) * 5;
      left.push([-w + wobble, y]);
      right.push([w + wobble, y]);
    }
    fill(g, [...left, ...right.slice().reverse()], gold);
    stroke(g, left, false);
    stroke(g, right, false);
    fill(g, [[-12, -140], [-4, -140], [-4, 30], [-14, 30]], light);
    fill(g, ellipse(-40, 104, 30, 7), light);
  },

  chocolate(g) {
    const y = 15;
    shape(g, [[-125, y], [65, y], [65, y + 40], [-125, y + 40]], 0x5e3620);
    shape(g, [[65, y], [125, y - 70], [125, y - 30], [65, y + 40]], 0x4a2a18);
    shape(g, [[-125, y], [-65, y - 70], [125, y - 70], [65, y]], 0x7b4a2d);
    for (let i = 1; i < 4; i++) {
      const dx = (190 * i) / 4;
      stroke(g, [[-125 + dx, y], [-65 + dx, y - 70]], false, 5, 0x4a2a18);
    }
    stroke(g, [[-95, y - 35], [95, y - 35]], false, 5, 0x4a2a18);
    fill(g, [[-100, y - 12], [-80, y - 12], [-62, y - 30], [-82, y - 30]], 0x9c6a4a);
  },

  meltedChocolate(g) {
    pour(g, 0x6b3e26, 0x9c6a4a, { width: 38 });
    for (const [x, y, r] of [[-92, 58, 11], [96, 50, 10], [-55, 26, 7]]) shape(g, circle(x, y, r), 0x6b3e26);
  },

  butter(g) {
    shape(g, [[-110, -10], [70, -10], [70, 70], [-110, 70]], 0xffd966);
    shape(g, [[70, -10], [110, -55], [110, 25], [70, 70]], 0xf2c14e);
    shape(g, [[-110, -10], [-70, -55], [110, -55], [70, -10]], 0xffe8a3);
    fill(g, [[-90, 5], [-70, 5], [-70, 50], [-90, 50]], 0xfff3cc);
  },

  meltedButter(g) {
    pour(g, 0xffd54f, 0xfff0a8, { width: 32 });
    for (const [x, y, r] of [[-94, 56, 10], [98, 50, 12], [62, 22, 8]]) shape(g, circle(x, y, r), 0xffd54f);
  },

  balloon(g) {
    // See-through, so you can see the air (gas dots) inside.
    const body = ellipse(0, -35, 95, 112);
    fill(g, body, 0xcfe6ff, 0.55);
    dots(g, [[-45, -80], [20, -100], [50, -40], [-20, -20], [-55, 10], [30, 25], [0, -60]]);
    stroke(g, body);
    fill(g, ellipse(-50, -90, 14, 26, 20), 0xffffff, 0.85);
    shape(g, [[-14, 92], [14, 92], [0, 76]], 0x9cc5ee);
    const string = [];
    for (let y = 92; y <= 145; y += 5) string.push([Math.sin((y - 92) / 9) * 10, y]);
    stroke(g, string, false, 5);
  },

  steam(g) {
    // A small teapot, with steam (shown as gas dots) rising out of the spout.
    const pot = 0xaab3c0;
    for (const [width, color] of [[16, OUT], [7, pot]]) {
      g.lineStyle(width, color, 1);
      g.beginPath();
      g.arc(C - 88, C + 92, 30, Phaser.Math.DegToRad(100), Phaser.Math.DegToRad(260));
      g.strokePath();
    }
    shape(g, [[40, 72], [92, 28], [104, 40], [52, 100]], pot);
    shape(g, ellipse(-20, 95, 70, 50), pot);
    shape(g, ellipse(-20, 50, 30, 10), pot);
    shape(g, circle(-20, 38, 9), pot);

    const wisp = [];
    for (let y = 20; y >= -140; y -= 8) wisp.push([98 + Math.sin(y / 25) * 18, y]);
    stroke(g, wisp, false, 34, 0xd8dcef);
    stroke(g, wisp, false, 20, 0xffffff);
    dots(g, [[104, -5], [80, -40], [115, -70], [84, -105], [118, -132], [45, -120]], 11);
  },

  puff(g) {
    // Swirly wind lines with gas dots riding along.
    const curl = (y, x0, x1, r) => {
      g.beginPath();
      g.moveTo(C + x0, C + y);
      g.lineTo(C + x1, C + y);
      g.arc(C + x1, C + y - r, r, Math.PI / 2, -Math.PI, true);
      g.strokePath();
    };
    const lines = [[-45, -125, 45, 30], [15, -95, 85, 24], [75, -125, 25, 24]];
    for (const [width, color] of [[24, OUT], [12, 0x9ec9ff]]) {
      g.lineStyle(width, color, 1);
      for (const l of lines) curl(...l);
    }
    dots(g, [[-80, -15], [-20, 45], [40, -15], [110, 30], [-60, 110], [120, 95], [125, -60]], 11);
  },
};
