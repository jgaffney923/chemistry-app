import { MIN_TOUCH } from '../layout.js';
import { sfx } from '../systems/audio.js';

// A round button with a squish on press. `content` is a game object (or array)
// drawn centered on the button. The touch area never goes below MIN_TOUCH.
export function makeRoundButton(scene, x, y, radius, color, content, onTap) {
  const button = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.25);
  g.fillCircle(0, radius * 0.06, radius);
  g.fillStyle(color, 1);
  g.fillCircle(0, 0, radius);
  button.add(g);
  if (content) button.add(content);

  const hit = Math.max(radius, MIN_TOUCH / 2);
  button.setInteractive(new Phaser.Geom.Circle(0, 0, hit), Phaser.Geom.Circle.Contains);

  button.on('pointerdown', () => {
    scene.tweens.add({ targets: button, scale: 0.92, duration: 80 });
  });
  button.on('pointerout', () => button.setScale(1));
  button.on('pointerup', () => {
    scene.tweens.add({ targets: button, scale: 1, duration: 120, ease: 'Back.easeOut' });
    sfx(scene, 'pop');
    onTap();
  });
  return button;
}
