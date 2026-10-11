// Pictures for Color-Change Potions, drawn once into textures ("potions-..." keys).

const SIZE = 240;
const OUT = 0x2b2350;

function texture(scene, key, draw) {
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({ add: false });
    draw(g);
    g.generateTexture(key, SIZE, SIZE);
    g.destroy();
  }
  return key;
}

function image(scene, key, x, y, size) {
  return scene.add.image(x, y, key).setScale(size / SIZE);
}

function drawBottle(g, liquid) {
  g.fillStyle(0xffffff, 0.4).fillRoundedRect(58, 92, 124, 126, 18).fillRect(98, 45, 44, 50);
  g.fillStyle(Number(liquid.pour)).fillRoundedRect(63, 118, 114, 95, { tl: 0, tr: 0, bl: 14, br: 14 });
  g.lineStyle(7, OUT).strokeRoundedRect(58, 92, 124, 126, 18).strokeRect(98, 45, 44, 50);
  g.fillStyle(Number(liquid.cap)).fillRoundedRect(92, 16, 56, 32, 8).strokeRoundedRect(92, 16, 56, 32, 8);
  g.lineStyle(5, OUT);
  if (liquid.id === 'lemon') {
    g.fillStyle(0xffe14d).fillCircle(120, 168, 26).strokeCircle(120, 168, 26);
    g.lineBetween(120, 142, 120, 194).lineBetween(97, 155, 143, 181).lineBetween(97, 181, 143, 155);
  } else if (liquid.id === 'water') {
    g.fillStyle(0x4fb3ff).fillTriangle(120, 138, 100, 172, 140, 172).fillCircle(120, 174, 20);
  } else if (liquid.id === 'bakingSoda') {
    g.fillStyle(0xf28c28).fillRect(98, 148, 44, 40).strokeRect(98, 148, 44, 40);
    g.fillStyle(0xffffff).fillCircle(120, 168, 11);
  }
}

export function bottleArt(scene, id, x, y, size) {
  const liquid = scene.cache.json.get('potions').liquids.find((entry) => entry.id === id);
  return image(scene, texture(scene, `potions-bottle-${id}`, (g) => drawBottle(g, liquid)), x, y, size);
}

function drawCup(g, color, bubbles) {
  const left = (y) => 50 + ((y - 50) / 160) * 18;
  const glass = [{ x: 50, y: 50 }, { x: 190, y: 50 }, { x: 172, y: 210 }, { x: 68, y: 210 }];
  g.fillStyle(0xffffff, 0.3).fillPoints(glass, true);
  g.fillStyle(color).fillPoints([{ x: left(95), y: 95 }, { x: 240 - left(95), y: 95 }, glass[2], glass[3]], true);
  g.fillStyle(0xffffff, 0.5).fillRect(left(110) + 10, 110, 10, 80);
  g.lineStyle(8, OUT).strokePoints(glass, true, true);
  if (bubbles) {
    g.fillStyle(0xffffff, 0.9).lineStyle(4, 0xbfe8ff);
    for (const [x, y, r] of [[100, 75, 12], [140, 60, 9], [125, 100, 14], [90, 130, 10], [150, 140, 12]]) {
      g.fillCircle(x, y, r).strokeCircle(x, y, r);
    }
  }
}

export function cupArt(scene, color, x, y, size, bubbles = false) {
  return image(scene, texture(scene, `potions-cup-${color.toString(16)}-${bubbles ? 1 : 0}`, (g) => drawCup(g, color, bubbles)), x, y, size);
}

function drawCabbage(g) {
  g.fillStyle(0x7b3fa0).fillCircle(120, 128, 98);
  g.lineStyle(8, OUT).strokeCircle(120, 128, 98);
  g.lineStyle(6, 0xd8b4f0, 0.9);
  for (const [cx, cy, r, from, to] of [[20, 128, 78, -55, 55], [220, 128, 78, 125, 235], [120, 20, 72, 40, 140], [120, 250, 70, 220, 320]]) {
    g.beginPath();
    g.arc(cx, cy, r, Phaser.Math.DegToRad(from), Phaser.Math.DegToRad(to));
    g.strokePath();
  }
  g.fillStyle(0xd8b4f0, 0.7).fillEllipse(88, 85, 30, 18);
}

// Red cabbage is purple. (The 🥬 emoji is green lettuce.)
export function cabbageArt(scene, x, y, size) {
  return image(scene, texture(scene, 'potions-cabbage', drawCabbage), x, y, size);
}

// Sticker pictures, as "item-<icon>" textures so the sticker book and addItemArt find them.
export function preparePotionArt(scene, cfg) {
  for (const sticker of cfg.stickers) {
    texture(scene, `item-${sticker.icon}`, (g) => drawCup(g, Number(sticker.color), sticker.id === 'mix'));
  }
}
