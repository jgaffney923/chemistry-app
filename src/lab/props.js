// Drawn Kitchen Lab equipment. Each is drawn once into a texture (like the bins),
// because rounded shapes drawn live on WebGL can show hairline seams.

const OUT = 0x2b2350;

export const HOT_PLATE = { w: 380, h: 250 };
export const FREEZER = { w: 360, h: 320 };
export const BEAKER = { w: 440, h: 600, water: 500 };
export const LENS_R = 105;

function texture(scene, key, w, h, draw) {
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({ add: false });
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }
  return key;
}

export function hotPlateTexture(scene) {
  const { w, h } = HOT_PLATE;
  return texture(scene, 'lab-hotplate', w, h, (g) => {
    g.fillStyle(0x000000, 0.25);
    g.fillRoundedRect(8, 20, w - 16, h - 20, 30);
    g.fillStyle(0x5a6070, 1);
    g.fillRoundedRect(0, 0, w, h - 16, 30);
    g.lineStyle(7, OUT, 1);
    g.strokeRoundedRect(4, 4, w - 8, h - 24, 28);
    g.fillStyle(0x2b2b30, 1);
    g.fillEllipse(w / 2, 90, 290, 110);
    g.lineStyle(8, 0x6b3a3a, 1);
    for (const r of [0.85, 0.6, 0.35]) g.strokeEllipse(w / 2, 90, 290 * r, 110 * r);
    g.fillStyle(0xd9dde6, 1);
    g.fillCircle(70, 190, 22);
    g.fillStyle(OUT, 1);
    g.fillRect(66, 170, 8, 22);
  });
}

export function freezerTexture(scene) {
  const { w, h } = FREEZER;
  return texture(scene, 'lab-freezer', w, h, (g) => {
    g.fillStyle(0x000000, 0.25);
    g.fillRoundedRect(8, 20, w - 16, h - 20, 26);
    g.fillStyle(0xdff3ff, 1);
    g.fillRoundedRect(0, 0, w, h - 16, 26);
    g.lineStyle(7, OUT, 1);
    g.strokeRoundedRect(4, 4, w - 8, h - 24, 24);
    g.fillStyle(0x9fd4f5, 1);
    g.fillRoundedRect(30, 30, w - 60, h - 100, 18);
    g.lineStyle(5, 0xffffff, 0.8);
    for (let i = 0; i < 3; i++) {
      const y = 70 + i * 55;
      g.lineBetween(50, y, w - 50, y);
    }
    g.fillStyle(0xb8c2cc, 1);
    g.fillRoundedRect(w / 2 - 60, h - 58, 120, 18, 9);
  });
}

// The glass only; the water and what's in it are drawn by the Beaker.
export function beakerTexture(scene) {
  const { w, h } = BEAKER;
  return texture(scene, 'lab-beaker', w + 40, h + 20, (g) => {
    g.fillStyle(0xffffff, 0.08);
    g.fillRect(20, 10, w, h);
    g.lineStyle(14, 0xffffff, 0.9);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(20, 18);
    g.lineTo(20, h + 4);
    g.lineTo(w + 20, h + 4);
    g.lineTo(w + 20, 18);
    g.lineTo(w + 40, 0);
    g.strokePath();
    g.lineStyle(6, 0xffffff, 0.6);
    for (let i = 1; i <= 4; i++) {
      const y = h + 4 - i * 110;
      g.lineBetween(w + 20 - 70, y, w + 20 - 10, y);
    }
  });
}

export function magnifierTexture(scene) {
  const size = 320;
  return texture(scene, 'lab-magnifier', size, size, (g) => {
    const c = LENS_R + 20;
    g.lineStyle(34, OUT, 1);
    g.lineBetween(c + 80, c + 80, size - 20, size - 20);
    g.lineStyle(20, 0x8a5a3a, 1);
    g.lineBetween(c + 80, c + 80, size - 22, size - 22);
    g.fillStyle(0xffffff, 0.18);
    g.fillCircle(c, c, LENS_R);
    g.lineStyle(26, OUT, 1);
    g.strokeCircle(c, c, LENS_R);
    g.lineStyle(14, 0xc9ced8, 1);
    g.strokeCircle(c, c, LENS_R);
  });
}

// Where the lens center sits inside the magnifier texture, relative to its center.
export const LENS_OFFSET = { x: LENS_R + 20 - 160, y: LENS_R + 20 - 160 };
