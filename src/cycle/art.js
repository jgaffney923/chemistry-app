import { W } from '../layout.js';
import { addEmoji } from '../ui/emoji.js';

export const SEA = { x: 0, y: 1180, w: 1000, h: 356 };
export const PEAK = { x: 1300, y: 820 };
export const DROP_COLOR = 0xf4faff;
export const DROP_OUTLINE = 0x1f5ea8;
export const RAIN_COLOR = 0x2a78d0;
export const RIVER_IDLE_ALPHA = 0.7;

// Where the mountain surface is at a given x (rain lands on it).
export function mountainY(x) {
  return PEAK.y + Math.abs(x - PEAK.x) * (x < PEAK.x ? 1.2 : 0.95);
}

// The whole picture behind the game: sky, cold band, sea, mountain and river.
export function drawLandscape(scene) {
  scene.add.rectangle(0, 260, W, 920, 0xbfe6ff).setOrigin(0);
  scene.add.rectangle(0, 260, W, 340, 0x8fc4f0).setOrigin(0);
  const sea = scene.add.rectangle(SEA.x, SEA.y, SEA.w, SEA.h, 0x2f7fc4).setOrigin(0);

  const land = scene.add.graphics();
  land.fillStyle(0x6fb86a, 1);
  land.fillPoints([
    { x: SEA.w, y: 1536 }, { x: SEA.w, y: 1180 }, { x: PEAK.x, y: PEAK.y },
    { x: 1700, y: 1180 }, { x: W, y: 1180 }, { x: W, y: 1536 },
  ], true);
  land.fillStyle(0xffffff, 1);
  land.fillPoints([{ x: 1250, y: 880 }, { x: PEAK.x, y: PEAK.y }, { x: 1350, y: 880 }, { x: 1300, y: 900 }], true);

  const riverPoints = [
    { x: 1290, y: 880 }, { x: 1260, y: 970 }, { x: 1200, y: 1040 }, { x: 1120, y: 1110 }, { x: 1040, y: 1170 }, { x: 990, y: 1210 },
  ];
  const river = scene.add.graphics();
  river.lineStyle(56, 0x1f6fc8, 1).strokePoints(riverPoints, false, false);
  river.setAlpha(RIVER_IDLE_ALPHA);
  return { sea, river, riverPoints };
}

// The sun token's picture: a glowing disc with the sun on it.
export function sunArt(scene) {
  return [scene.add.circle(0, 0, 110, 0xffe066, 0.6), addEmoji(scene, 0, 0, '☀️', 170)];
}

// A cloud made of many solid drops. `container.drops` lists them.
export function cloudOfDrops(scene, x, y, count) {
  const cloud = scene.add.container(x, y);
  cloud.drops = [];
  for (let i = 0; i < count; i++) {
    const angle = i * 2.4;
    const dist = Math.sqrt((i + 0.5) / count);
    const drop = scene.add.circle(Math.cos(angle) * dist * 150, Math.sin(angle) * dist * 85, 20, DROP_COLOR)
      .setStrokeStyle(4, DROP_OUTLINE, 1);
    cloud.add(drop);
    cloud.drops.push(drop);
  }
  cloud.setInteractive(new Phaser.Geom.Circle(0, 0, 170), Phaser.Geom.Circle.Contains);
  return cloud;
}

export function raindrop(scene, x, y) {
  return scene.add.circle(x, y, 16, RAIN_COLOR).setStrokeStyle(3, 0xffffff, 1);
}
