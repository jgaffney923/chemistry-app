import { W, H } from '../layout.js';
import { APP_VERSION } from '../version.js';
import { makeWater } from '../art/atoms.js';
import { say } from '../systems/audio.js';

// M0 placeholder: a friendly water molecule to tap. The real menu arrives in M1.
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const water = makeWater(this, W / 2, H / 2 + 60, 220);
    water.setScale(0);
    this.tweens.add({ targets: water, scale: 1, duration: 500, ease: 'Back.easeOut' });
    this.tweens.add({
      targets: water,
      y: water.y - 30,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    water.setSize(700, 600);
    water.setInteractive();
    water.on('pointerup', () => {
      say(this, 'menu.water');
      this.tweens.add({ targets: water, angle: { from: -8, to: 8 }, duration: 90, yoyo: true, repeat: 2, onComplete: () => water.setAngle(0) });
    });

    this.add.text(W - 40, H - 40, APP_VERSION, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(1, 1).setAlpha(0.3);
  }
}
