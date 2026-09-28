// Draws the placeholder app icon (a water molecule) as PNGs. No dependencies.
// Usage: node tools/make-icons.mjs
import { writeFileSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';

const BG = [0x23, 0x1c, 0x44];
const RED = [0xe8, 0x45, 0x3c];
const WHITE = [0xf4, 0xf4, 0xf4];
const INK = [0x22, 0x22, 0x22];

// Everything in 0..1 units, kept inside the middle 80% so "maskable" crops are safe.
const spread = (104.5 / 2) * Math.PI / 180;
const O = { x: 0.5, y: 0.58, r: 0.2 };
const dist = 0.25;
const hydrogens = [-1, 1].map((s) => ({
  x: O.x + s * dist * Math.sin(spread),
  y: O.y - dist * Math.cos(spread),
  r: 0.12,
}));

function inside(px, py, c) {
  return (px - c.x) ** 2 + (py - c.y) ** 2 <= c.r ** 2;
}

function shade(color, px, py, c) {
  // Soft highlight toward the upper left.
  const hx = c.x - c.r * 0.35, hy = c.y - c.r * 0.4;
  const d = Math.hypot(px - hx, py - hy) / c.r;
  const k = Math.max(0, 0.35 - d * 0.5);
  return color.map((v) => v + (255 - v) * k);
}

function colorAt(px, py) {
  if (inside(px, py, O)) {
    const eyeY = O.y - O.r * 0.05;
    for (const ex of [O.x - O.r * 0.3, O.x + O.r * 0.3]) {
      if (inside(px, py, { x: ex, y: eyeY, r: O.r * 0.1 })) return INK;
    }
    return shade(RED, px, py, O);
  }
  for (const h of hydrogens) {
    if (inside(px, py, h)) return shade(WHITE, px, py, h);
  }
  return BG;
}

function render(size) {
  const SS = 4; // supersampling for smooth edges
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const c = colorAt((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size);
          r += c[0]; g += c[1]; b += c[2];
        }
      }
      const n = SS * SS;
      raw.set([r / n, g / n, b / n].map(Math.round), row + 1 + x * 3);
    }
  }
  return png(size, raw);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function png(size, raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [180, 192, 512]) {
  writeFileSync(new URL(`../assets/icons/icon-${size}.png`, import.meta.url), render(size));
  console.log(`assets/icons/icon-${size}.png`);
}
