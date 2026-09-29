import { W, H, COLORS, MIN_TOUCH } from '../layout.js';
import { preloadNarration, unlockAudio, say } from '../systems/audio.js';

// "Tap to start": iOS only allows sound after a tap, so every session begins here.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.json('narration', 'src/data/narration.json');
    this.load.json('items', 'src/data/items.json');
    this.load.json('lab', 'src/data/lab.json');
    this.load.json('molecules', 'src/data/molecules.json');
    this.load.once('filecomplete-json-narration', () => preloadNarration(this));
    // Real pictures, for items that have one. Others are drawn in code.
    this.load.once('filecomplete-json-items', () => {
      const { items, changeItems } = this.cache.json.get('items').sorter;
      for (const item of [...items, ...changeItems]) {
        if (item.image) this.load.image(`item-${item.id}`, item.image);
      }
    });
  }

  create() {
    const radius = Math.max(MIN_TOUCH, 260);
    const button = this.add.container(W / 2, H / 2);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.25);
    g.fillCircle(0, 16, radius);
    g.fillStyle(COLORS.go, 1);
    g.fillCircle(0, 0, radius);
    g.fillStyle(COLORS.white, 1);
    g.fillTriangle(-radius * 0.28, -radius * 0.42, -radius * 0.28, radius * 0.42, radius * 0.45, 0);
    button.add(g);

    this.tweens.add({
      targets: button,
      scale: 1.06,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    button.setSize(radius * 2, radius * 2);
    button.setInteractive({ useHandCursor: true });
    button.once('pointerup', () => {
      // Both of these must happen inside the tap itself.
      unlockAudio(this);
      say(this, 'boot.welcome');
      this.tweens.killTweensOf(button);
      this.tweens.add({
        targets: button,
        scale: 0,
        duration: 250,
        ease: 'Back.easeIn',
        onComplete: () => this.scene.start('Menu'),
      });
    });
  }
}
