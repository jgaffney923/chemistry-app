import { W, H } from '../layout.js';
import { addItemArt } from '../art/items.js';
import { makeRoundButton } from '../ui/button.js';
import { addLabel } from '../ui/emoji.js';
import { say } from '../systems/audio.js';
import { hasSticker } from '../systems/save.js';

const COLS = 5;
const R = 100;

// Full-screen sticker book: found stickers show their picture (tap to hear the
// discovery again); missing ones are a grey "?".
export function openStickerBook(scene, stickers, itemsById, options = {}) {
  const ownsSticker = options.hasSticker || hasSticker;
  const narrationPrefix = options.narrationPrefix || 'disc';
  const layer = scene.add.container(0, 0).setDepth(5000);
  layer.add(scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setInteractive());
  layer.add(scene.add.rectangle(W / 2, H / 2 + 20, 1500, 1060, 0xfdf6e3).setStrokeStyle(10, 0xe0c890));

  const rows = Math.ceil(stickers.length / COLS);
  stickers.forEach((sticker, i) => {
    const x = W / 2 + ((i % COLS) - (COLS - 1) / 2) * 270;
    const y = H / 2 + 20 + (Math.floor(i / COLS) - (rows - 1) / 2) * 300;
    const found = ownsSticker(sticker.id);
    const slot = scene.add.container(x, y);
    if (found) {
      slot.add([
        scene.add.circle(0, 0, R, 0xffffff).setStrokeStyle(12, 0xf2b01e),
        addItemArt(scene, itemsById[sticker.icon], 0, 0, 150),
      ]);
      slot.setInteractive(new Phaser.Geom.Circle(0, 0, R), Phaser.Geom.Circle.Contains);
      slot.on('pointerup', () => {
        say(scene, `${narrationPrefix}.${sticker.id}`);
        scene.tweens.add({ targets: slot, scale: 1.1, duration: 120, yoyo: true });
      });
    } else {
      slot.add([
        scene.add.circle(0, 0, R, 0xe4e0d6).setStrokeStyle(8, 0xcfc8b8),
        addLabel(scene, 0, 0, '?', 110, '#b5ad9c'),
      ]);
    }
    layer.add(slot);
  });

  const close = makeRoundButton(scene, W / 2 + 720, H / 2 - 490, 80, 0x4f7cff, addLabel(scene, 0, 0, '✕', 80), () => layer.destroy());
  layer.add(close);
  say(scene, options.intro || 'lab.stickers');
  return layer;
}
