// Placeholder props for the warm-up: a glass, a bowl, a block, and a jar.

export const GLASS_W = 200;
export const GLASS_H = 320;
export const BOWL_R = 240;
export const JUICE = 0xffa62b;

// A tall glass with an open top. `glass.setFill(0..1)` sets how full it is.
export function makeGlass(scene, x, y) {
  const glass = scene.add.container(x, y);
  const liquid = scene.add.graphics();
  const outline = scene.add.graphics();
  outline.fillStyle(0xffffff, 0.12);
  outline.fillRect(-GLASS_W / 2, -GLASS_H / 2, GLASS_W, GLASS_H);
  outline.lineStyle(12, 0xffffff, 0.9);
  outline.beginPath();
  outline.moveTo(-GLASS_W / 2, -GLASS_H / 2);
  outline.lineTo(-GLASS_W / 2, GLASS_H / 2);
  outline.lineTo(GLASS_W / 2, GLASS_H / 2);
  outline.lineTo(GLASS_W / 2, -GLASS_H / 2);
  outline.strokePath();
  glass.add([liquid, outline]);

  glass.fill = 0;
  glass.setFill = (amount) => {
    glass.fill = amount;
    const h = (GLASS_H - 20) * amount;
    liquid.clear();
    liquid.fillStyle(JUICE, 1);
    liquid.fillRect(-GLASS_W / 2 + 6, GLASS_H / 2 - 6 - h, GLASS_W - 12, h);
  };
  glass.setSize(GLASS_W + 60, GLASS_H + 60);
  return glass;
}

// A round bowl. `bowl.setLevel(0..1)` fills it with juice, following the curve.
export function makeBowl(scene, x, y) {
  const bowl = scene.add.container(x, y);
  const liquid = scene.add.graphics();
  const outline = scene.add.graphics();
  outline.fillStyle(0xffffff, 0.12);
  outline.slice(0, 0, BOWL_R, 0, Math.PI, false);
  outline.fillPath();
  outline.lineStyle(12, 0xffffff, 0.9);
  outline.beginPath();
  outline.arc(0, 0, BOWL_R, 0, Math.PI, false);
  outline.strokePath();
  bowl.add([liquid, outline]);

  bowl.setLevel = (amount) => {
    liquid.clear();
    if (amount <= 0) return;
    // Liquid surface sits `depth` above the bottom; fill the circle below it.
    const r = BOWL_R - 6;
    const top = r - r * 0.6 * amount;
    const start = Math.asin(top / r);
    const points = [];
    for (let i = 0; i <= 40; i++) {
      const t = start + ((Math.PI - 2 * start) * i) / 40;
      points.push(new Phaser.Math.Vector2(r * Math.cos(t), r * Math.sin(t)));
    }
    liquid.fillStyle(JUICE, 1);
    liquid.fillPoints(points, true);
  };
  return bowl;
}

// A wooden block. A plain rectangle keeps edges crisp.
export function makeBlock(scene, x, y, size = 130) {
  const block = scene.add.container(x, y);
  block.add([
    scene.add.rectangle(0, 0, size, size, 0xb07a4a).setStrokeStyle(8, 0x7a5030),
    scene.add.rectangle(-size * 0.2, -size * 0.2, size * 0.25, size * 0.25, 0xffffff, 0.25),
  ]);
  block.size = size;
  return block;
}

// A small closed jar. `jar.lid` pops off when opened.
export function makeJar(scene, x, y) {
  const jar = scene.add.container(x, y);
  const body = scene.add.rectangle(0, 20, 180, 200, 0xffffff, 0.15).setStrokeStyle(10, 0xffffff, 0.9);
  const lid = scene.add.rectangle(0, -95, 210, 44, 0xe8453c).setStrokeStyle(6, 0x9a2a24);
  jar.add([body, lid]);
  jar.lid = lid;
  jar.setSize(260, 300);
  return jar;
}
