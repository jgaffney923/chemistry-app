import { W, H, MIN_TOUCH } from '../layout.js';
import { floatArt, guessIcon } from './art.js';
import { makeRoundButton } from '../ui/button.js';
import { addEmoji } from '../ui/emoji.js';

// Makes a picture touchable, with a touch area never smaller than MIN_TOUCH
// on screen, even for small things like a coin or a grape. `scale` is the
// picture's resting scale. Also re-enables a picture that was switched off.
export function makeTouchable(img, scale) {
  const min = MIN_TOUCH / scale;
  const w = Math.max(img.width, min);
  const h = Math.max(img.height, min);
  const area = new Phaser.Geom.Rectangle((img.width - w) / 2, (img.height - h) / 2, w, h);
  if (img.input) {
    img.input.hitArea = area;
    img.input.enabled = true;
  } else {
    img.setInteractive(area, Phaser.Geom.Rectangle.Contains);
  }
}

// After a round: play again, the other part of Sink or Float, or home.
export function finishButtons(scene, again) {
  const other = again === 'Float' ? 'Layers' : 'Float';
  const otherIcon = other === 'Layers' ? floatArt(scene, 'honeyBottle', 0, 0, 150) : guessIcon(scene, true);
  const buttons = [
    [0x3ccf6e, addEmoji(scene, 0, 0, '🔄', 130), () => scene.scene.start(again, {})],
    [0xfdf6e3, otherIcon, () => scene.scene.start(other, {})],
    [0x4f7cff, addEmoji(scene, 0, 0, '🏠', 130), () => scene.scene.start('Menu', {})],
  ];
  buttons.forEach(([color, content, onTap], i) => {
    makeRoundButton(scene, W / 2 + (i - 1) * 400, H / 2 + 220, 140, color, content, onTap).setDepth(2001);
  });
}
